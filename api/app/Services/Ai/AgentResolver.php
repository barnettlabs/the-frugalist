<?php

namespace App\Services\Ai;

use App\Models\AiAgent;
use App\Models\AiAgentRoute;

class AgentResolver
{
    public function bySlug(string $slug): ?AiAgent
    {
        return AiAgent::with('provider')->where('slug', $slug)->first();
    }

    public function byContextKey(string $contextKey): ?AiAgent
    {
        $route = AiAgentRoute::with('agent.provider')
            ->where('context_key', $contextKey)
            ->where('enabled', true)
            ->orderByDesc('priority')
            ->first();

        return $route?->agent;
    }
}
