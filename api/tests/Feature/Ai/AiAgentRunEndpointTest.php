<?php

namespace Tests\Feature\Ai;

use App\Models\AiAgent;
use App\Models\AiInvocation;
use App\Models\User;
use Database\Seeders\AiSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiAgentRunEndpointTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AiSeeder::class);
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    private function fakeOk(): void
    {
        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => json_encode([
                    'grade' => 'B', 'rating' => 'good', 'confidence' => 0.75,
                    'summary' => 'Decent.', 'red_flags' => [], 'tips' => [],
                ])]]],
                'usage' => ['prompt_tokens' => 50, 'completion_tokens' => 25],
            ], 200),
        ]);
    }

    public function test_run_returns_grade_for_known_agent(): void
    {
        $this->fakeOk();

        $response = $this->postJson('/api/ai/agents/deal-grade-finance/run', [
            'context' => [
                'inputs' => ['msrp' => 35000],
                'computed' => ['monthly_payment' => 645],
            ],
            'context_key' => 'calculator.finance.deal-grade',
        ]);

        $response->assertOk()
            ->assertJsonPath('agent.slug', 'deal-grade-finance')
            ->assertJsonPath('response.grade', 'B')
            ->assertJsonPath('cached', false);
    }

    public function test_unknown_agent_returns_404(): void
    {
        $this->postJson('/api/ai/agents/does-not-exist/run', [
            'context' => ['inputs' => []],
        ])->assertNotFound();
    }

    public function test_requires_authentication(): void
    {
        app('auth')->forgetGuards();
        $this->refreshApplication();

        $this->postJson('/api/ai/agents/deal-grade-finance/run', [
            'context' => ['inputs' => []],
        ])->assertUnauthorized();
    }

    public function test_rate_limit_blocks_after_quota(): void
    {
        $this->fakeOk();
        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $agent->update(['rate_limit_per_user_day' => 2]);

        for ($i = 0; $i < 2; $i++) {
            AiInvocation::create([
                'user_id' => $this->user->id,
                'agent_id' => $agent->id,
                'agent_version' => 1,
                'status' => 'success',
            ]);
        }

        $this->postJson('/api/ai/agents/deal-grade-finance/run', [
            'context' => ['inputs' => []],
        ])->assertStatus(429);
    }

    public function test_validation_fails_without_context(): void
    {
        $this->postJson('/api/ai/agents/deal-grade-finance/run', [])
            ->assertStatus(422);
    }
}
