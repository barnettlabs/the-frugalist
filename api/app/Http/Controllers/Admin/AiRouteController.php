<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiAgentRoute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiRouteController extends Controller
{
    public function index(): JsonResponse
    {
        $routes = AiAgentRoute::with('agent:id,slug,name')
            ->orderBy('context_key')
            ->orderByDesc('priority')
            ->get();

        return response()->json(['routes' => $routes]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'context_key' => 'required|string|max:128',
            'agent_id' => 'required|exists:ai_agents,id',
            'priority' => 'sometimes|integer',
            'enabled' => 'sometimes|boolean',
        ]);

        $route = AiAgentRoute::create($data);

        return response()->json(['route' => $route->load('agent:id,slug,name')], 201);
    }

    public function update(Request $request, AiAgentRoute $route): JsonResponse
    {
        $data = $request->validate([
            'context_key' => 'sometimes|string|max:128',
            'agent_id' => 'sometimes|exists:ai_agents,id',
            'priority' => 'sometimes|integer',
            'enabled' => 'sometimes|boolean',
        ]);

        $route->update($data);

        return response()->json(['route' => $route->load('agent:id,slug,name')]);
    }

    public function destroy(AiAgentRoute $route): JsonResponse
    {
        $route->delete();

        return response()->json(['message' => 'Route deleted.']);
    }
}
