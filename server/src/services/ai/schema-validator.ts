/**
 * The JSON Schema subset the agent output validator supports.
 *
 * Ports App\Services\Ai\OutputValidator. The schemas are stored per agent and
 * authored through the admin UI, so the supported keyword set and the exact
 * error strings are both data contracts - an operator reading "agent.grade: not
 * in enum (A|B|C)" in the invocation log is reading this function's output.
 *
 * The analysis suggested Zod's generateObject would replace this outright, and
 * for *new* agents it should. It cannot replace it retroactively: the stored
 * schemas are JSON Schema documents, and translating them to Zod at runtime
 * would change which outputs are accepted. Kept as-is; the Vercel AI SDK path
 * is a separate migration for the agents themselves.
 */

export type JsonSchema = {
	type?: string;
	required?: string[];
	properties?: Record<string, JsonSchema>;
	enum?: unknown[];
	maxItems?: number;
	items?: JsonSchema;
};

export function validateAgainstSchema(value: unknown, schema: JsonSchema | null): string[] {
	if (schema === null || schema === undefined) return [];

	const errors: string[] = [];
	check(value, schema, '$', errors);
	return errors;
}

function check(value: unknown, schema: JsonSchema, path: string, errors: string[]): void {
	const type = schema.type;

	if (type && !matchesType(value, type)) {
		errors.push(`${path}: expected ${type}`);
		return;
	}

	if (schema.enum && !schema.enum.includes(value)) {
		errors.push(`${path}: not in enum (${schema.enum.join('|')})`);
	}

	if (type === 'object' && isPlainObject(value)) {
		for (const key of schema.required ?? []) {
			if (!(key in value)) {
				errors.push(`${path}.${key}: missing required`);
			}
		}

		for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
			if (key in value) {
				check(value[key], propSchema, `${path}.${key}`, errors);
			}
		}
	}

	if (type === 'array' && Array.isArray(value)) {
		if (schema.maxItems !== undefined && value.length > schema.maxItems) {
			errors.push(`${path}: exceeds maxItems ${schema.maxItems}`);
		}

		if (schema.items) {
			value.forEach((item, i) => check(item, schema.items!, `${path}[${i}]`, errors));
		}
	}
}

/**
 * PHP has one array type for both lists and maps, so the original distinguished
 * them with array_is_list() and treated an empty array as satisfying either.
 * That leniency is preserved: an agent returning [] where an object was
 * expected passed validation before and still does.
 */
function matchesType(value: unknown, type: string): boolean {
	switch (type) {
		case 'object':
			return isPlainObject(value) || (Array.isArray(value) && value.length === 0);
		case 'array':
			return Array.isArray(value) || (isPlainObject(value) && Object.keys(value).length === 0);
		case 'string':
			return typeof value === 'string';
		case 'number':
			return typeof value === 'number' && Number.isFinite(value);
		case 'integer':
			return typeof value === 'number' && Number.isInteger(value);
		case 'boolean':
			return typeof value === 'boolean';
		case 'null':
			return value === null;
		default:
			return true;
	}
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
