<?php

namespace Database\Seeders;

use App\Models\AiAgent;
use App\Models\AiAgentRoute;
use App\Models\AiProvider;
use Illuminate\Database\Seeder;

class AiSeeder extends Seeder
{
    public function run(): void
    {
        $provider = AiProvider::updateOrCreate(
            ['slug' => 'local-llm'],
            [
                'name' => 'Local LLM (OpenAI-compatible)',
                'base_url' => 'http://localhost:8080/v1',
                'api_key' => null,
                'default_model' => 'qwen2.5-7b-instruct',
                'enabled' => true,
                'is_default' => true,
                'sends_data_externally' => false,
                'timeout_seconds' => 20,
            ],
        );

        $dealGradeSchema = [
            'type' => 'object',
            'required' => ['grade', 'rating', 'summary', 'red_flags', 'tips'],
            'properties' => [
                'grade' => ['type' => 'string', 'enum' => ['A+', 'A', 'B', 'C', 'D', 'F']],
                'rating' => ['type' => 'string', 'enum' => ['excellent', 'good', 'fair', 'poor', 'bad', 'needs_more_info']],
                'confidence' => ['type' => 'number'],
                'summary' => ['type' => 'string'],
                'red_flags' => ['type' => 'array', 'items' => ['type' => 'string'], 'maxItems' => 5],
                'tips' => ['type' => 'array', 'items' => ['type' => 'string'], 'maxItems' => 5],
            ],
        ];

        $systemPrompt = <<<'TXT'
You are a car deal grading assistant. You help users understand whether a car finance or lease deal is good. The backend already performed the calculations. Do not invent numbers. Do not recalculate hidden values. Use only the provided inputs and computed values. Return strict JSON only.
TXT;

        $financeTemplate = <<<'TXT'
Grade this car finance deal.

Inputs:
{{inputs_json}}

Computed values:
{{computed_json}}

Return JSON exactly matching this shape:
{
  "grade": "A+|A|B|C|D|F",
  "rating": "excellent|good|fair|poor|bad|needs_more_info",
  "confidence": 0.0,
  "summary": "one short paragraph",
  "red_flags": ["up to 5 short items"],
  "tips": ["up to 5 short items"]
}

Guidelines:
- A/A+ = strong deal
- B = good/decent deal
- C = average or acceptable but not special
- D = weak deal
- F = avoid
- Use needs_more_info if required values are missing
- Be concise. No markdown. No extra fields.
TXT;

        $leaseTemplate = <<<'TXT'
Grade this car lease deal.

Inputs:
{{inputs_json}}

Computed values:
{{computed_json}}

Return JSON exactly matching this shape:
{
  "grade": "A+|A|B|C|D|F",
  "rating": "excellent|good|fair|poor|bad|needs_more_info",
  "confidence": 0.0,
  "summary": "one short paragraph",
  "red_flags": ["up to 5 short items"],
  "tips": ["up to 5 short items"]
}

Pay extra attention to: money factor (compare to base ~0.0008-0.0025 range), residual percentage, capitalized cost vs MSRP, fees stacked on lease cash. Be concise. No markdown. No extra fields.
TXT;

        $financeAgent = AiAgent::updateOrCreate(
            ['slug' => 'deal-grade-finance'],
            [
                'name' => 'Finance Deal Grader',
                'description' => 'Grades a vehicle finance deal and offers tips.',
                'provider_id' => $provider->id,
                'model' => null,
                'system_prompt' => $systemPrompt,
                'user_prompt_template' => $financeTemplate,
                'response_format' => 'json_object',
                'output_schema' => $dealGradeSchema,
                'temperature' => 0.2,
                'top_p' => 0.9,
                'max_tokens' => 500,
                'enabled' => true,
                'rate_limit_per_user_day' => 50,
            ],
        );

        $leaseAgent = AiAgent::updateOrCreate(
            ['slug' => 'deal-grade-lease'],
            [
                'name' => 'Lease Deal Grader',
                'description' => 'Grades a vehicle lease deal and offers tips.',
                'provider_id' => $provider->id,
                'model' => null,
                'system_prompt' => $systemPrompt,
                'user_prompt_template' => $leaseTemplate,
                'response_format' => 'json_object',
                'output_schema' => $dealGradeSchema,
                'temperature' => 0.2,
                'top_p' => 0.9,
                'max_tokens' => 500,
                'enabled' => true,
                'rate_limit_per_user_day' => 50,
            ],
        );

        AiAgentRoute::updateOrCreate(
            ['context_key' => 'calculator.finance.deal-grade'],
            ['agent_id' => $financeAgent->id, 'priority' => 0, 'enabled' => true],
        );

        AiAgentRoute::updateOrCreate(
            ['context_key' => 'calculator.lease.deal-grade'],
            ['agent_id' => $leaseAgent->id, 'priority' => 0, 'enabled' => true],
        );
    }
}
