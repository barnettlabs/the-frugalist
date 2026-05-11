<?php

namespace Tests\Feature\Ai;

use App\Models\AiAgent;
use App\Models\AiAgentRoute;
use App\Models\AiInvocation;
use App\Models\AiProvider;
use Database\Seeders\AiSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_provider_api_key_is_encrypted_at_rest(): void
    {
        $provider = AiProvider::create([
            'slug' => 'openai',
            'name' => 'OpenAI',
            'base_url' => 'https://api.openai.com/v1',
            'api_key' => 'sk-secret-token',
            'default_model' => 'gpt-4o-mini',
            'enabled' => true,
        ]);

        $row = \DB::table('ai_providers')->where('id', $provider->id)->first();

        $this->assertNotSame('sk-secret-token', $row->api_key);
        $this->assertSame('sk-secret-token', $provider->fresh()->api_key);
    }

    public function test_provider_api_key_hidden_in_serialization(): void
    {
        $provider = AiProvider::create([
            'slug' => 'openai',
            'name' => 'OpenAI',
            'base_url' => 'https://api.openai.com/v1',
            'api_key' => 'sk-secret',
        ]);

        $this->assertArrayNotHasKey('api_key', $provider->toArray());
    }

    public function test_seeder_creates_default_provider_and_agents_and_routes(): void
    {
        $this->seed(AiSeeder::class);

        $this->assertSame(1, AiProvider::where('slug', 'local-llm')->where('is_default', true)->count());

        $finance = AiAgent::where('slug', 'deal-grade-finance')->first();
        $lease = AiAgent::where('slug', 'deal-grade-lease')->first();
        $this->assertNotNull($finance);
        $this->assertNotNull($lease);
        $this->assertSame(1, $finance->version);
        $this->assertTrue($finance->enabled);
        $this->assertIsArray($finance->output_schema->toArray());

        $this->assertSame($finance->id, AiAgentRoute::where('context_key', 'calculator.finance.deal-grade')->first()?->agent_id);
        $this->assertSame($lease->id, AiAgentRoute::where('context_key', 'calculator.lease.deal-grade')->first()?->agent_id);
    }

    public function test_invocation_model_persists_json_payload(): void
    {
        $provider = AiProvider::create([
            'slug' => 'p', 'name' => 'p', 'base_url' => 'http://example/v1',
        ]);
        $agent = AiAgent::create([
            'slug' => 'a', 'name' => 'a',
            'provider_id' => $provider->id,
            'system_prompt' => 's', 'user_prompt_template' => 'u',
        ]);

        $inv = AiInvocation::create([
            'agent_id' => $agent->id,
            'agent_version' => 1,
            'provider_id' => $provider->id,
            'model' => 'foo',
            'context_key' => 'calculator.finance.deal-grade',
            'request_hash' => str_repeat('a', 64),
            'request_payload' => ['hello' => 'world'],
            'response' => ['grade' => 'A'],
            'status' => 'success',
            'latency_ms' => 123,
            'cached' => false,
        ]);

        $this->assertSame('A', $inv->fresh()->response['grade']);
    }
}
