<?php

namespace App\Services\Ai;

use App\Models\AiProvider;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class OpenAiCompatibleClient
{
    public function __construct(private AiProvider $provider) {}

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @param  array<string, mixed>  $options
     */
    public function chat(array $messages, array $options = []): ChatCompletionResult
    {
        $startedAt = microtime(true);

        $payload = array_filter([
            'model' => $options['model'] ?? $this->provider->default_model,
            'messages' => $this->prepareMessages($messages),
            'temperature' => $options['temperature'] ?? null,
            'top_p' => $options['top_p'] ?? null,
            'max_tokens' => $options['max_tokens'] ?? null,
            'response_format' => $options['response_format'] ?? null,
        ], static fn ($v) => $v !== null);

        try {
            $response = $this->http()->post('/chat/completions', $payload);
        } catch (\Throwable $e) {
            return ChatCompletionResult::failed($e->getMessage(), (int) ((microtime(true) - $startedAt) * 1000));
        }

        $latencyMs = (int) ((microtime(true) - $startedAt) * 1000);

        if (! $response->successful()) {
            return ChatCompletionResult::failed(
                'http_'.$response->status().': '.$response->body(),
                $latencyMs,
                $response->body(),
            );
        }

        $body = $response->json();
        $content = $body['choices'][0]['message']['content'] ?? null;

        return new ChatCompletionResult(
            success: true,
            content: $content,
            rawBody: $response->body(),
            latencyMs: $latencyMs,
            promptTokens: $body['usage']['prompt_tokens'] ?? null,
            completionTokens: $body['usage']['completion_tokens'] ?? null,
            error: null,
        );
    }

    public function ping(?string $model = null): ChatCompletionResult
    {
        return $this->chat(
            [['role' => 'user', 'content' => 'ping']],
            ['model' => $model ?? $this->provider->default_model, 'max_tokens' => 5, 'temperature' => 0],
        );
    }

    public function listModels(): array
    {
        try {
            $response = $this->http()->get('/models');
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage(), 'models' => []];
        }

        if (! $response->successful()) {
            return ['ok' => false, 'error' => 'http_'.$response->status(), 'models' => []];
        }

        $models = collect($response->json('data') ?? [])->pluck('id')->filter()->values()->all();

        return ['ok' => true, 'models' => $models];
    }

    /**
     * Adjust the message list to match the provider's expected layout.
     * Some providers (Anthropic-flavored gateways) reject the `system` role
     * inside messages and require strict alternating user/assistant. In that
     * mode we fold the system text into the first user message.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array<int, array{role: string, content: string}>
     */
    private function prepareMessages(array $messages): array
    {
        $settings = $this->provider->settings;
        $settingsArray = $settings instanceof \ArrayObject ? $settings->getArrayCopy() : (is_array($settings) ? $settings : []);
        $mode = $settingsArray['system_handling'] ?? 'message';
        if ($mode !== 'prepend_user') {
            return $messages;
        }

        $system = '';
        $rest = [];
        foreach ($messages as $m) {
            if (($m['role'] ?? null) === 'system') {
                $system .= ($system === '' ? '' : "\n\n").$m['content'];
            } else {
                $rest[] = $m;
            }
        }

        if ($system === '') {
            return $rest;
        }

        if (! empty($rest) && ($rest[0]['role'] ?? null) === 'user') {
            $rest[0]['content'] = $system."\n\n".$rest[0]['content'];

            return $rest;
        }

        return array_merge([['role' => 'user', 'content' => $system]], $rest);
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl(rtrim($this->provider->base_url, '/'))
            ->timeout($this->provider->timeout_seconds ?: 20)
            ->acceptJson()
            ->asJson()
            ->when($this->provider->api_key, fn (PendingRequest $r) => $r->withToken($this->provider->api_key));
    }
}
