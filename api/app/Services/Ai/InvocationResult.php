<?php

namespace App\Services\Ai;

class InvocationResult
{
    public function __construct(
        public bool $ok,
        public ?array $response,
        public bool $cached,
        public ?string $cacheKey,
        public ?string $errorCode,
        public ?string $errorMessage,
    ) {}

    public static function ok(array $response, bool $cached, string $cacheKey): self
    {
        return new self(true, $response, $cached, $cacheKey, null, null);
    }

    public static function error(string $code, string $message): self
    {
        return new self(false, null, false, null, $code, $message);
    }
}
