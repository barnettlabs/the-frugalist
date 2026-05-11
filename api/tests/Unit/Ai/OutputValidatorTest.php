<?php

namespace Tests\Unit\Ai;

use App\Services\Ai\OutputValidator;
use PHPUnit\Framework\TestCase;

class OutputValidatorTest extends TestCase
{
    private OutputValidator $v;

    protected function setUp(): void
    {
        $this->v = new OutputValidator;
    }

    public function test_accepts_null_schema(): void
    {
        $this->assertSame([], $this->v->validate(['anything' => 1], null));
    }

    public function test_requires_present_keys(): void
    {
        $schema = ['type' => 'object', 'required' => ['a', 'b']];
        $errors = $this->v->validate(['a' => 1], $schema);
        $this->assertCount(1, $errors);
        $this->assertStringContainsString('b', $errors[0]);
    }

    public function test_enforces_enum(): void
    {
        $schema = [
            'type' => 'object',
            'properties' => ['grade' => ['type' => 'string', 'enum' => ['A', 'B']]],
        ];
        $this->assertSame([], $this->v->validate(['grade' => 'A'], $schema));
        $this->assertNotEmpty($this->v->validate(['grade' => 'Z'], $schema));
    }

    public function test_enforces_array_max_items(): void
    {
        $schema = ['type' => 'array', 'maxItems' => 2];
        $this->assertNotEmpty($this->v->validate([1, 2, 3], $schema));
        $this->assertSame([], $this->v->validate([1, 2], $schema));
    }
}
