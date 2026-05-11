<?php

namespace App\Services\Ai;

class OutputValidator
{
    /**
     * Validate a decoded JSON value against a (subset of) JSON Schema.
     * Supports: type (object/array/string/number/boolean), required, properties (top-level),
     * enum, maxItems, items.type. Returns array of error strings (empty = valid).
     */
    public function validate(mixed $value, ?array $schema): array
    {
        if ($schema === null) {
            return [];
        }

        $errors = [];
        $this->check($value, $schema, '$', $errors);

        return $errors;
    }

    private function check(mixed $value, array $schema, string $path, array &$errors): void
    {
        $type = $schema['type'] ?? null;
        if ($type && ! $this->matchesType($value, $type)) {
            $errors[] = "$path: expected $type";

            return;
        }

        if (isset($schema['enum']) && ! in_array($value, $schema['enum'], true)) {
            $errors[] = "$path: not in enum (".implode('|', $schema['enum']).')';
        }

        if ($type === 'object' && is_array($value)) {
            foreach (($schema['required'] ?? []) as $req) {
                if (! array_key_exists($req, $value)) {
                    $errors[] = "$path.$req: missing required";
                }
            }
            foreach (($schema['properties'] ?? []) as $key => $propSchema) {
                if (array_key_exists($key, $value)) {
                    $this->check($value[$key], $propSchema, "$path.$key", $errors);
                }
            }
        }

        if ($type === 'array' && is_array($value)) {
            if (isset($schema['maxItems']) && count($value) > $schema['maxItems']) {
                $errors[] = "$path: exceeds maxItems ".$schema['maxItems'];
            }
            if (isset($schema['items'])) {
                foreach ($value as $i => $item) {
                    $this->check($item, $schema['items'], "$path[$i]", $errors);
                }
            }
        }
    }

    private function matchesType(mixed $value, string $type): bool
    {
        return match ($type) {
            'object' => is_array($value) && (empty($value) || ! array_is_list($value)),
            'array' => is_array($value) && (empty($value) || array_is_list($value)),
            'string' => is_string($value),
            'number' => is_int($value) || is_float($value),
            'integer' => is_int($value),
            'boolean' => is_bool($value),
            'null' => $value === null,
            default => true,
        };
    }
}
