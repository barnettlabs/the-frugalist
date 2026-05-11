<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiAgent;
use App\Models\AiAgentVersion;
use App\Services\Ai\InvocationPipeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AiAgentController extends Controller
{
    public function __construct(private InvocationPipeline $pipeline) {}

    public function index(): JsonResponse
    {
        $agents = AiAgent::with('provider:id,slug,name')
            ->orderBy('name')->get();

        return response()->json(['agents' => $agents]);
    }

    public function show(AiAgent $agent): JsonResponse
    {
        $agent->load('provider:id,slug,name');

        return response()->json(['agent' => $agent]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateData($request, creating: true);

        $agent = DB::transaction(function () use ($data, $request) {
            $agent = AiAgent::create($data);
            AiAgentVersion::create([
                'agent_id' => $agent->id,
                'version' => $agent->version,
                'snapshot' => $agent->snapshot(),
                'created_by' => $request->user()?->id,
            ]);

            return $agent;
        });

        return response()->json(['agent' => $agent], 201);
    }

    public function update(Request $request, AiAgent $agent): JsonResponse
    {
        $data = $this->validateData($request, creating: false, agentId: $agent->id);

        $agent = DB::transaction(function () use ($agent, $data, $request) {
            $agent->fill($data);
            $promptFieldsChanged = $agent->isDirty([
                'system_prompt', 'user_prompt_template', 'response_format',
                'output_schema', 'temperature', 'top_p', 'max_tokens',
                'provider_id', 'model',
            ]);

            if ($promptFieldsChanged) {
                $agent->version = $agent->version + 1;
            }
            $agent->save();

            if ($promptFieldsChanged) {
                AiAgentVersion::create([
                    'agent_id' => $agent->id,
                    'version' => $agent->version,
                    'snapshot' => $agent->snapshot(),
                    'created_by' => $request->user()?->id,
                ]);
            }

            return $agent;
        });

        return response()->json(['agent' => $agent->fresh('provider')]);
    }

    public function destroy(AiAgent $agent): JsonResponse
    {
        $agent->delete();

        return response()->json(['message' => 'Agent deleted.']);
    }

    public function versions(AiAgent $agent): JsonResponse
    {
        return response()->json([
            'versions' => $agent->versions()->limit(50)->get(),
        ]);
    }

    public function rollback(Request $request, AiAgent $agent, int $version): JsonResponse
    {
        $snapshot = AiAgentVersion::where('agent_id', $agent->id)
            ->where('version', $version)
            ->firstOrFail()
            ->snapshot
            ->toArray();

        $agent = DB::transaction(function () use ($agent, $snapshot, $request) {
            $agent->fill($snapshot);
            $agent->version = $agent->version + 1;
            $agent->save();

            AiAgentVersion::create([
                'agent_id' => $agent->id,
                'version' => $agent->version,
                'snapshot' => $agent->snapshot(),
                'created_by' => $request->user()?->id,
            ]);

            return $agent;
        });

        return response()->json(['agent' => $agent->fresh('provider')]);
    }

    public function preview(Request $request, AiAgent $agent): JsonResponse
    {
        $data = $request->validate([
            'context' => 'required|array',
            'use_cache' => 'sometimes|boolean',
        ]);

        $result = $this->pipeline->run(
            agent: $agent,
            context: $data['context'],
            user: $request->user(),
            contextKey: 'admin.preview',
            useCache: $data['use_cache'] ?? false,
        );

        return response()->json([
            'ok' => $result->ok,
            'response' => $result->response,
            'cached' => $result->cached,
            'error' => $result->errorCode,
            'message' => $result->errorMessage,
        ]);
    }

    private function validateData(Request $request, bool $creating, ?int $agentId = null): array
    {
        return $request->validate([
            'slug' => [($creating ? 'required' : 'sometimes'), 'string', 'max:64', 'alpha_dash',
                'unique:ai_agents,slug'.($agentId ? ','.$agentId : '')],
            'name' => [($creating ? 'required' : 'sometimes'), 'string', 'max:255'],
            'description' => 'sometimes|nullable|string|max:2000',
            'provider_id' => 'sometimes|nullable|exists:ai_providers,id',
            'model' => 'sometimes|nullable|string|max:255',
            'system_prompt' => ($creating ? 'required' : 'sometimes').'|string',
            'user_prompt_template' => ($creating ? 'required' : 'sometimes').'|string',
            'response_format' => 'sometimes|in:json_object,json_schema,text',
            'output_schema' => 'sometimes|nullable|array',
            'temperature' => 'sometimes|numeric|min:0|max:2',
            'top_p' => 'sometimes|numeric|min:0|max:1',
            'max_tokens' => 'sometimes|integer|min:1|max:8192',
            'enabled' => 'sometimes|boolean',
            'rate_limit_per_user_day' => 'sometimes|integer|min:0',
            'settings' => 'sometimes|nullable|array',
        ]);
    }
}
