<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiInvocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiInvocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AiInvocation::with(['agent:id,slug,name', 'provider:id,slug,name', 'user:id,first_name,last_name,email']);

        if ($agent = $request->query('agent_id')) {
            $query->where('agent_id', $agent);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($since = $request->query('since')) {
            $query->where('created_at', '>=', $since);
        }
        if ($request->boolean('errors_only')) {
            $query->whereIn('status', ['error', 'invalid_json', 'timeout']);
        }

        $invocations = $query->orderByDesc('id')->paginate((int) $request->query('per_page', 50));

        return response()->json($invocations);
    }

    public function show(AiInvocation $invocation): JsonResponse
    {
        $invocation->load(['agent:id,slug,name', 'provider:id,slug,name', 'user:id,first_name,last_name,email']);

        return response()->json(['invocation' => $invocation]);
    }
}
