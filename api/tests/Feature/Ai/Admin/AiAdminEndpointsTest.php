<?php

namespace Tests\Feature\Ai\Admin;

use App\Models\AiAgent;
use App\Models\AiAgentRoute;
use App\Models\AiAgentVersion;
use App\Models\AiInvocation;
use App\Models\AiProvider;
use App\Models\User;
use Database\Seeders\AiSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiAdminEndpointsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AiSeeder::class);
        $this->admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($this->admin);
    }

    public function test_index_providers_does_not_leak_api_key(): void
    {
        AiProvider::create([
            'slug' => 'openai', 'name' => 'OpenAI',
            'base_url' => 'https://api.openai.com/v1',
            'api_key' => 'sk-secret',
        ]);

        $response = $this->getJson('/api/admin/ai/providers')->assertOk();
        $body = $response->json('providers');

        foreach ($body as $p) {
            $this->assertArrayNotHasKey('api_key', $p);
            $this->assertArrayHasKey('has_api_key', $p);
        }
    }

    public function test_create_provider_with_api_key(): void
    {
        $response = $this->postJson('/api/admin/ai/providers', [
            'slug' => 'openai',
            'name' => 'OpenAI',
            'base_url' => 'https://api.openai.com/v1',
            'api_key' => 'sk-12345',
            'default_model' => 'gpt-4o-mini',
            'sends_data_externally' => true,
        ])->assertCreated();

        $id = $response->json('provider.id');
        $this->assertTrue(AiProvider::find($id)->hasApiKey());
        $this->assertTrue($response->json('provider.has_api_key'));
    }

    public function test_update_provider_clears_key_with_empty_string(): void
    {
        $p = AiProvider::create([
            'slug' => 'p', 'name' => 'p', 'base_url' => 'http://x/v1', 'api_key' => 'secret',
        ]);

        $this->patchJson("/api/admin/ai/providers/{$p->id}", ['api_key' => ''])
            ->assertOk();

        $this->assertFalse($p->fresh()->hasApiKey());
    }

    public function test_provider_test_endpoint_pings_provider(): void
    {
        $p = AiProvider::where('slug', 'local-llm')->first();

        Http::fake([
            '*/models' => Http::response(['data' => [['id' => 'qwen2.5-7b-instruct']]], 200),
            '*/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => 'pong']]],
                'usage' => ['prompt_tokens' => 1, 'completion_tokens' => 1],
            ], 200),
        ]);

        $response = $this->postJson("/api/admin/ai/providers/{$p->id}/test")->assertOk();

        $this->assertTrue($response->json('models.ok'));
        $this->assertContains('qwen2.5-7b-instruct', $response->json('models.models'));
        $this->assertTrue($response->json('ping.ok'));
        $this->assertSame('pong', $response->json('ping.content'));
    }

    public function test_update_agent_prompt_bumps_version_and_creates_snapshot(): void
    {
        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $oldVersion = $agent->version;

        $this->patchJson("/api/admin/ai/agents/{$agent->id}", [
            'system_prompt' => 'You are an updated grader.',
        ])->assertOk();

        $agent->refresh();
        $this->assertSame($oldVersion + 1, $agent->version);
        $this->assertSame(1, AiAgentVersion::where('agent_id', $agent->id)->where('version', $agent->version)->count());
    }

    public function test_non_prompt_field_update_does_not_bump_version(): void
    {
        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $oldVersion = $agent->version;

        $this->patchJson("/api/admin/ai/agents/{$agent->id}", [
            'enabled' => false,
        ])->assertOk();

        $this->assertSame($oldVersion, $agent->fresh()->version);
    }

    public function test_rollback_restores_old_prompt_and_creates_new_version(): void
    {
        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $originalPrompt = $agent->system_prompt;
        $originalVersion = $agent->version;

        // create v1 snapshot manually since seeder didn't
        AiAgentVersion::create([
            'agent_id' => $agent->id,
            'version' => $originalVersion,
            'snapshot' => $agent->snapshot(),
        ]);

        $this->patchJson("/api/admin/ai/agents/{$agent->id}", [
            'system_prompt' => 'totally changed',
        ])->assertOk();

        $this->postJson("/api/admin/ai/agents/{$agent->id}/rollback/{$originalVersion}")
            ->assertOk();

        $this->assertSame($originalPrompt, $agent->fresh()->system_prompt);
        $this->assertGreaterThan($originalVersion + 1, $agent->fresh()->version);
    }

    public function test_agent_preview_calls_pipeline(): void
    {
        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => json_encode([
                    'grade' => 'A', 'rating' => 'excellent', 'confidence' => 0.9,
                    'summary' => 'great', 'red_flags' => [], 'tips' => [],
                ])]]],
            ], 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $response = $this->postJson("/api/admin/ai/agents/{$agent->id}/preview", [
            'context' => ['inputs' => ['msrp' => 35000], 'computed' => ['monthly_payment' => 645]],
        ])->assertOk();

        $this->assertTrue($response->json('ok'));
        $this->assertSame('A', $response->json('response.grade'));

        $messages = $response->json('messages');
        $this->assertIsArray($messages);
        $this->assertSame('system', $messages[0]['role']);
        $this->assertSame('user', $messages[1]['role']);
        $this->assertNotNull($response->json('model'));

        $payload = $response->json('request_payload');
        $this->assertIsArray($payload);
        $this->assertArrayHasKey('model', $payload);
        $this->assertArrayHasKey('messages', $payload);
        $this->assertNotEmpty($response->json('raw_response'));
    }

    public function test_routes_crud(): void
    {
        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();

        $this->postJson('/api/admin/ai/routes', [
            'context_key' => 'custom.context',
            'agent_id' => $agent->id,
        ])->assertCreated();

        $this->assertSame(1, AiAgentRoute::where('context_key', 'custom.context')->count());
    }

    public function test_invocation_index_filters_by_agent(): void
    {
        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();

        AiInvocation::create([
            'user_id' => $this->admin->id,
            'agent_id' => $agent->id,
            'agent_version' => 1,
            'status' => 'success',
        ]);
        AiInvocation::create([
            'user_id' => $this->admin->id,
            'agent_id' => $agent->id,
            'agent_version' => 1,
            'status' => 'error',
        ]);

        $response = $this->getJson('/api/admin/ai/invocations?errors_only=1')->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('error', $response->json('data.0.status'));
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/ai/providers')->assertForbidden();
    }
}
