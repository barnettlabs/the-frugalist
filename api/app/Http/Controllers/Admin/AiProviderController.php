<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiProvider;
use App\Services\Ai\OpenAiCompatibleClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiProviderController extends Controller
{
    public function index(): JsonResponse
    {
        $providers = AiProvider::orderBy('name')->get()
            ->map(fn ($p) => $this->present($p));

        return response()->json(['providers' => $providers]);
    }

    public function show(AiProvider $provider): JsonResponse
    {
        return response()->json(['provider' => $this->present($provider)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateData($request, creating: true);
        $apiKey = $data['api_key'] ?? null;
        unset($data['api_key']);

        if (empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlugFromName($data['name']);
        }

        if (! empty($data['is_default'])) {
            AiProvider::where('is_default', true)->update(['is_default' => false]);
        }

        $provider = AiProvider::create($data);
        if ($apiKey !== null && $apiKey !== '') {
            $provider->api_key = $apiKey;
            $provider->save();
        }

        return response()->json(['provider' => $this->present($provider)], 201);
    }

    public function update(Request $request, AiProvider $provider): JsonResponse
    {
        $data = $this->validateData($request, creating: false, providerId: $provider->id);

        if (array_key_exists('api_key', $data)) {
            $apiKey = $data['api_key'];
            unset($data['api_key']);
            $provider->api_key = $apiKey === '' ? null : $apiKey;
        }

        if (! empty($data['is_default'])) {
            AiProvider::where('id', '!=', $provider->id)->where('is_default', true)->update(['is_default' => false]);
        }

        $provider->fill($data)->save();

        return response()->json(['provider' => $this->present($provider)]);
    }

    public function destroy(AiProvider $provider): JsonResponse
    {
        $provider->delete();

        return response()->json(['message' => 'Provider deleted.']);
    }

    public function models(AiProvider $provider): JsonResponse
    {
        return response()->json((new OpenAiCompatibleClient($provider))->listModels());
    }

    public function test(Request $request, AiProvider $provider): JsonResponse
    {
        $model = $request->input('model') ?: $provider->default_model;
        $client = new OpenAiCompatibleClient($provider);

        $models = $client->listModels();
        $ping = $client->ping($model);

        return response()->json([
            'models' => $models,
            'ping' => [
                'ok' => $ping->success,
                'content' => $ping->content,
                'error' => $ping->error,
                'latency_ms' => $ping->latencyMs,
                'prompt_tokens' => $ping->promptTokens,
                'completion_tokens' => $ping->completionTokens,
            ],
        ]);
    }

    private function validateData(Request $request, bool $creating, ?int $providerId = null): array
    {
        $rules = [
            'slug' => ['sometimes', 'nullable', 'string', 'max:64', 'alpha_dash',
                'unique:ai_providers,slug'.($providerId ? ','.$providerId : '')],
            'name' => [($creating ? 'required' : 'sometimes'), 'string', 'max:255'],
            'base_url' => [($creating ? 'required' : 'sometimes'), 'string', 'max:1000'],
            'api_key' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'default_model' => 'sometimes|nullable|string|max:255',
            'enabled' => 'sometimes|boolean',
            'is_default' => 'sometimes|boolean',
            'sends_data_externally' => 'sometimes|boolean',
            'timeout_seconds' => 'sometimes|integer|min:1|max:120',
            'settings' => 'sometimes|nullable|array',
        ];

        return $request->validate($rules);
    }

    private function uniqueSlugFromName(string $name): string
    {
        $base = Str::slug($name) ?: 'provider';
        $slug = $base;
        $i = 2;
        while (AiProvider::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function present(AiProvider $p): array
    {
        return [
            'id' => $p->id,
            'slug' => $p->slug,
            'name' => $p->name,
            'base_url' => $p->base_url,
            'has_api_key' => $p->hasApiKey(),
            'default_model' => $p->default_model,
            'enabled' => $p->enabled,
            'is_default' => $p->is_default,
            'sends_data_externally' => $p->sends_data_externally,
            'timeout_seconds' => $p->timeout_seconds,
            'settings' => $p->settings,
            'created_at' => $p->created_at,
            'updated_at' => $p->updated_at,
        ];
    }
}
