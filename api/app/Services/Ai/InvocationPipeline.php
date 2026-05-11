<?php

namespace App\Services\Ai;

use App\Models\AiAgent;
use App\Models\AiInvocation;
use App\Models\AiInvocationCache;
use App\Models\User;

class InvocationPipeline
{
    public function __construct(
        private PromptRenderer $renderer,
        private OutputValidator $validator,
    ) {}

    /**
     * @param  array<string, mixed>  $context  user-supplied input + computed values
     */
    public function run(
        AiAgent $agent,
        array $context,
        ?User $user = null,
        ?string $contextKey = null,
        bool $useCache = true,
    ): InvocationResult {
        if (! $agent->enabled) {
            return InvocationResult::error('agent_disabled', 'Agent is disabled.');
        }

        $provider = $agent->provider;
        if (! $provider || ! $provider->enabled) {
            return InvocationResult::error('provider_unavailable', 'No enabled provider configured for this agent.');
        }

        $model = $agent->resolveModel();
        $requestHash = $this->hashInput($context);
        $cacheKey = hash('sha256', implode('|', [
            $agent->id,
            $agent->version,
            $provider->id,
            $model ?? '',
            $requestHash,
        ]));

        if ($useCache) {
            $hit = AiInvocationCache::where('cache_key', $cacheKey)->first();
            if ($hit) {
                $hit->increment('hit_count');
                $hit->forceFill(['last_hit_at' => now()])->save();

                $this->log($agent, $provider, $user, $contextKey, $cacheKey, $requestHash, $context, $hit->response->toArray(), 'success', null, 0, null, null, true);

                return InvocationResult::ok($hit->response->toArray(), true, $cacheKey);
            }
        }

        $messages = $this->buildMessages($agent, $context);

        $client = new OpenAiCompatibleClient($provider);
        $options = [
            'model' => $model,
            'temperature' => (float) $agent->temperature,
            'top_p' => (float) $agent->top_p,
            'max_tokens' => (int) $agent->max_tokens,
        ];
        if ($agent->response_format === 'json_object') {
            $options['response_format'] = ['type' => 'json_object'];
        }

        $result = $client->chat($messages, $options);

        if (! $result->success) {
            $this->log($agent, $provider, $user, $contextKey, $cacheKey, $requestHash, $context, null, 'error', $result->error, $result->latencyMs, null, null, false, $result->rawBody);

            return InvocationResult::error('provider_error', $result->error ?? 'Unknown provider error');
        }

        [$parsed, $parseError] = $this->parseAndValidate($result->content, $agent);

        if ($parseError !== null) {
            // one retry with stricter prompt
            $messages[] = ['role' => 'assistant', 'content' => $result->content ?? ''];
            $messages[] = ['role' => 'user', 'content' => 'Your previous response was not valid JSON for the required schema ('.$parseError.'). Return ONLY the JSON object, no prose, no markdown, matching the schema exactly.'];

            $retry = $client->chat($messages, $options);
            if ($retry->success) {
                [$parsed, $parseError] = $this->parseAndValidate($retry->content, $agent);
                $result = $retry;
            }
        }

        if ($parseError !== null) {
            $this->log($agent, $provider, $user, $contextKey, $cacheKey, $requestHash, $context, null, 'invalid_json', $parseError, $result->latencyMs, $result->promptTokens, $result->completionTokens, false, $result->rawBody);

            return InvocationResult::error('invalid_json', $parseError);
        }

        if ($useCache) {
            AiInvocationCache::updateOrCreate(
                ['cache_key' => $cacheKey],
                [
                    'agent_id' => $agent->id,
                    'agent_version' => $agent->version,
                    'provider_id' => $provider->id,
                    'model' => $model,
                    'request_hash' => $requestHash,
                    'response' => $parsed,
                ],
            );
        }

        $this->log($agent, $provider, $user, $contextKey, $cacheKey, $requestHash, $context, $parsed, 'success', null, $result->latencyMs, $result->promptTokens, $result->completionTokens, false);

        return InvocationResult::ok($parsed, false, $cacheKey);
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    private function buildMessages(AiAgent $agent, array $context): array
    {
        return [
            ['role' => 'system', 'content' => $agent->system_prompt],
            ['role' => 'user', 'content' => $this->renderUserPrompt($agent, $context)],
        ];
    }

    private function renderUserPrompt(AiAgent $agent, array $context): string
    {
        $renderContext = $context + [
            'inputs_json' => $context['inputs'] ?? [],
            'computed_json' => $context['computed'] ?? [],
            'context_json' => $context,
        ];

        return $this->renderer->render($agent->user_prompt_template, $renderContext);
    }

    private function parseAndValidate(?string $content, AiAgent $agent): array
    {
        if ($agent->response_format === 'text') {
            return [['text' => (string) $content], null];
        }

        $content = trim((string) $content);
        // strip markdown fences if present
        $content = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', $content);

        $decoded = json_decode($content, true);
        if (! is_array($decoded)) {
            return [null, 'response was not valid JSON'];
        }

        $schema = $agent->output_schema?->toArray();
        $errors = $this->validator->validate($decoded, $schema);
        if (! empty($errors)) {
            return [null, implode('; ', $errors)];
        }

        return [$decoded, null];
    }

    private function hashInput(array $context): string
    {
        $normalized = $this->normalize($context);

        return hash('sha256', json_encode($normalized));
    }

    private function normalize(mixed $value): mixed
    {
        if (is_array($value)) {
            $assoc = ! array_is_list($value);
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $this->normalize($v);
            }
            if ($assoc) {
                ksort($out);
            }

            return $out;
        }
        if (is_float($value)) {
            return round($value, 4);
        }

        return $value;
    }

    private function log(
        AiAgent $agent,
        $provider,
        ?User $user,
        ?string $contextKey,
        string $cacheKey,
        string $requestHash,
        array $context,
        ?array $response,
        string $status,
        ?string $error,
        ?int $latencyMs,
        ?int $promptTokens,
        ?int $completionTokens,
        bool $cached,
        ?string $rawBody = null,
    ): void {
        AiInvocation::create([
            'user_id' => $user?->id,
            'agent_id' => $agent->id,
            'agent_version' => $agent->version,
            'provider_id' => $provider?->id,
            'model' => $agent->resolveModel(),
            'context_key' => $contextKey,
            'request_hash' => $requestHash,
            'request_payload' => $context,
            'response' => $response,
            'raw_response' => $rawBody,
            'status' => $status,
            'error' => $error,
            'latency_ms' => $latencyMs,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'cached' => $cached,
        ]);
    }
}
