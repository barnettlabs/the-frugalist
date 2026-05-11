<?php

namespace App\Services\Ai;

class PromptRenderer
{
    /**
     * Render a template with `{{var}}` placeholders. Arrays/objects render as pretty JSON.
     * Dotted paths supported, e.g. `{{context.inputs.msrp}}`.
     */
    public function render(string $template, array $context): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/', function ($m) use ($context) {
            $value = $this->resolve($m[1], $context);

            if (is_array($value) || is_object($value)) {
                return json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            }

            return $value === null ? '' : (string) $value;
        }, $template);
    }

    private function resolve(string $path, array $context): mixed
    {
        $segments = explode('.', $path);
        $value = $context;

        foreach ($segments as $segment) {
            if (is_array($value) && array_key_exists($segment, $value)) {
                $value = $value[$segment];
            } else {
                return null;
            }
        }

        return $value;
    }
}
