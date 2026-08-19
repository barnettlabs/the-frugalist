<?php

namespace Tests\Feature\Ai;

use App\Models\AiAgent;
use App\Models\AiInvocation;
use App\Models\AiInvocationCache;
use App\Services\Ai\InvocationPipeline;
use Database\Seeders\AiSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class InvocationPipelineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AiSeeder::class);
    }

    private function pipeline(): InvocationPipeline
    {
        return app(InvocationPipeline::class);
    }

    private function dealGradePayload(): array
    {
        return [
            'choices' => [[
                'message' => ['content' => json_encode([
                    'grade' => 'B',
                    'rating' => 'good',
                    'confidence' => 0.7,
                    'summary' => 'Decent deal overall.',
                    'red_flags' => ['Down payment a bit high'],
                    'tips' => ['Ask for a lower rate'],
                ])],
            ]],
            'usage' => ['prompt_tokens' => 100, 'completion_tokens' => 50],
        ];
    }

    public function test_successful_invocation_returns_parsed_response_and_logs(): void
    {
        Http::fake([
            '*/chat/completions' => Http::response($this->dealGradePayload(), 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $result = $this->pipeline()->run($agent, [
            'inputs' => ['msrp' => 35000, 'down_payment' => 3000],
            'computed' => ['monthly_payment' => 645, 'interest_amount' => 5000],
        ]);

        $this->assertTrue($result->ok);
        $this->assertSame('B', $result->response['grade']);
        $this->assertFalse($result->cached);
        $this->assertSame(1, AiInvocation::where('status', 'success')->count());
        $this->assertSame(1, AiInvocationCache::count());
    }

    public function test_identical_inputs_hit_cache_on_second_call(): void
    {
        Http::fake([
            '*/chat/completions' => Http::response($this->dealGradePayload(), 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $input = ['inputs' => ['msrp' => 35000], 'computed' => ['monthly_payment' => 645]];

        $first = $this->pipeline()->run($agent, $input);
        $second = $this->pipeline()->run($agent, $input);

        $this->assertFalse($first->cached);
        $this->assertTrue($second->cached);
        Http::assertSentCount(1);
        $this->assertSame(1, AiInvocationCache::where('hit_count', 1)->count());
    }

    public function test_invalid_json_triggers_retry_then_fails(): void
    {
        Http::fake([
            '*/chat/completions' => Http::sequence()
                ->push(['choices' => [['message' => ['content' => 'not json']]]], 200)
                ->push(['choices' => [['message' => ['content' => 'still not json']]]], 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $result = $this->pipeline()->run($agent, ['inputs' => [], 'computed' => []]);

        $this->assertFalse($result->ok);
        $this->assertSame('invalid_json', $result->errorCode);
        Http::assertSentCount(2);
        $this->assertSame(0, AiInvocationCache::count());
        $this->assertSame(1, AiInvocation::where('status', 'invalid_json')->count());
    }

    public function test_retry_succeeds_after_first_invalid(): void
    {
        Http::fake([
            '*/chat/completions' => Http::sequence()
                ->push(['choices' => [['message' => ['content' => 'sorry — here goes']]]], 200)
                ->push($this->dealGradePayload(), 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $result = $this->pipeline()->run($agent, ['inputs' => [], 'computed' => []]);

        $this->assertTrue($result->ok);
        Http::assertSentCount(2);
    }

    public function test_strips_markdown_code_fences_from_json(): void
    {
        $fenced = "```json\n".json_encode([
            'grade' => 'A', 'rating' => 'excellent', 'confidence' => 0.9,
            'summary' => 'great', 'red_flags' => [], 'tips' => [],
        ])."\n```";

        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => $fenced]]],
            ], 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $result = $this->pipeline()->run($agent, ['inputs' => [], 'computed' => []]);

        $this->assertTrue($result->ok);
        $this->assertSame('A', $result->response['grade']);
    }

    public function test_http_error_is_reported(): void
    {
        Http::fake([
            '*/chat/completions' => Http::response('boom', 500),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $result = $this->pipeline()->run($agent, ['inputs' => [], 'computed' => []]);

        $this->assertFalse($result->ok);
        $this->assertSame('provider_error', $result->errorCode);
        $this->assertSame(1, AiInvocation::where('status', 'error')->count());
    }

    public function test_prepend_user_system_handling_folds_system_into_first_user_message(): void
    {
        Http::fake([
            '*/chat/completions' => Http::response($this->dealGradePayload(), 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $agent->provider->update(['settings' => ['system_handling' => 'prepend_user']]);

        $this->pipeline()->run($agent, ['inputs' => ['msrp' => 35000], 'computed' => []]);

        Http::assertSent(function ($request) {
            $body = $request->data();
            $messages = $body['messages'];
            $this->assertCount(1, $messages, 'system should have been folded away');
            $this->assertSame('user', $messages[0]['role']);
            $this->assertStringContainsString('car deal grading assistant', $messages[0]['content']);
            $this->assertStringContainsString('Grade this car finance deal', $messages[0]['content']);

            return true;
        });
    }

    public function test_default_message_system_handling_keeps_system_role(): void
    {
        Http::fake([
            '*/chat/completions' => Http::response($this->dealGradePayload(), 200),
        ]);

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();

        $this->pipeline()->run($agent, ['inputs' => [], 'computed' => []]);

        Http::assertSent(function ($request) {
            $messages = $request->data()['messages'];
            $this->assertSame('system', $messages[0]['role']);
            $this->assertSame('user', $messages[1]['role']);

            return true;
        });
    }

    public function test_disabled_agent_returns_error_without_calling_provider(): void
    {
        Http::fake();

        $agent = AiAgent::where('slug', 'deal-grade-finance')->first();
        $agent->update(['enabled' => false]);

        $result = $this->pipeline()->run($agent, ['inputs' => [], 'computed' => []]);

        $this->assertFalse($result->ok);
        $this->assertSame('agent_disabled', $result->errorCode);
        Http::assertNothingSent();
    }
}
