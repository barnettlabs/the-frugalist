<?php

namespace Tests\Unit\Ai;

use App\Services\Ai\PromptRenderer;
use PHPUnit\Framework\TestCase;

class PromptRendererTest extends TestCase
{
    public function test_substitutes_simple_keys(): void
    {
        $r = new PromptRenderer;
        $this->assertSame('hello world', $r->render('hello {{name}}', ['name' => 'world']));
    }

    public function test_substitutes_dotted_paths(): void
    {
        $r = new PromptRenderer;
        $this->assertSame('msrp=35000', $r->render('msrp={{inputs.msrp}}', ['inputs' => ['msrp' => 35000]]));
    }

    public function test_renders_arrays_as_pretty_json(): void
    {
        $r = new PromptRenderer;
        $out = $r->render('{{inputs}}', ['inputs' => ['a' => 1, 'b' => 2]]);
        $this->assertStringContainsString('"a": 1', $out);
        $this->assertStringContainsString('"b": 2', $out);
    }

    public function test_missing_key_renders_empty_string(): void
    {
        $r = new PromptRenderer;
        $this->assertSame('a:', $r->render('a:{{missing}}', []));
    }
}
