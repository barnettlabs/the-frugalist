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
        public ?array $messages = null,
        public ?array $requestPayload = null,
        public ?string $rawResponse = null,
    ) {}

    public static function ok(array $response, bool $cached, string $cacheKey, ?array $messages = null, ?array $requestPayload = null, ?string $rawResponse = null): self
    {
        return new self(true, $response, $cached, $cacheKey, null, null, $messages, $requestPayload, $rawResponse);
    }

    public static function error(string $code, string $message, ?array $messages = null, ?array $requestPayload = null, ?string $rawResponse = null): self
    {
        return new self(false, null, false, null, $code, $message, $messages, $requestPayload, $rawResponse);
    }
}
