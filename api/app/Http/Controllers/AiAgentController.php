<?php

namespace App\Http\Controllers;

use App\Models\AiInvocation;
use App\Services\Ai\AgentResolver;
use App\Services\Ai\InvocationPipeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAgentController extends Controller
{
    public function __construct(
        private AgentResolver $resolver,
        private InvocationPipeline $pipeline,
    ) {}

    public function run(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'context' => 'required|array',
            'context.inputs' => 'nullable|array',
            'context.computed' => 'nullable|array',
            'context_key' => 'nullable|string|max:128',
            'use_cache' => 'nullable|boolean',
        ]);

        if (strlen(json_encode($data)) > 32 * 1024) {
            return response()->json(['error' => 'request_too_large'], 413);
        }

        $agent = $this->resolver->bySlug($slug);
        if (! $agent) {
            return response()->json(['error' => 'agent_not_found'], 404);
        }

        $user = $request->user();

        if ($user && $this->isOverDailyLimit($user->id, $agent->id, $agent->rate_limit_per_user_day)) {
            return response()->json(['error' => 'rate_limit_exceeded'], 429);
        }

        $result = $this->pipeline->run(
            agent: $agent,
            context: $data['context'],
            user: $user,
            contextKey: $data['context_key'] ?? null,
            useCache: $data['use_cache'] ?? true,
        );

        if (! $result->ok) {
            return response()->json([
                'error' => $result->errorCode,
                'message' => $result->errorMessage,
            ], $result->errorCode === 'agent_disabled' ? 503 : 502);
        }

        return response()->json([
            'agent' => ['slug' => $agent->slug, 'version' => $agent->version],
            'response' => $result->response,
            'cached' => $result->cached,
        ]);
    }

    private function isOverDailyLimit(int $userId, int $agentId, int $limit): bool
    {
        if ($limit <= 0) {
            return false;
        }

        $count = AiInvocation::where('user_id', $userId)
            ->where('agent_id', $agentId)
            ->where('created_at', '>=', now()->startOfDay())
            ->count();

        return $count >= $limit;
    }
}
