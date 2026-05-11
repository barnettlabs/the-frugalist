<?php

namespace App\Services\Ai;

class ChatCompletionResult
{
    public function __construct(
        public bool $success,
        public ?string $content,
        public ?string $rawBody,
        public int $latencyMs,
        public ?int $promptTokens,
        public ?int $completionTokens,
        public ?string $error,
    ) {}

    public static function failed(string $error, int $latencyMs, ?string $rawBody = null): self
    {
        return new self(
            success: false,
            content: null,
            rawBody: $rawBody,
            latencyMs: $latencyMs,
            promptTokens: null,
            completionTokens: null,
            error: $error,
        );
    }
}
