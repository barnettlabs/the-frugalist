/**
 * Prompt template rendering.
 *
 * Ports App\Services\Ai\PromptRenderer: `{{var}}` placeholders with dotted path
 * support, arrays and objects rendered as pretty JSON, and a missing path
 * rendering as an empty string rather than leaving the placeholder in the
 * prompt. The templates live in the database and are edited through the admin
 * UI, so the substitution rules are data, not code - changing them would break
 * prompts already saved.
 */

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

export function renderPrompt(template: string, context: Record<string, unknown>): string {
	return template.replace(PLACEHOLDER, (_match, path: string) => {
		const value = resolvePath(path, context);

		if (value === null || value === undefined) return '';

		if (typeof value === 'object') {
			// PHP's JSON_PRETTY_PRINT uses four spaces; JSON.stringify's closest
			// equivalent is an explicit indent. Prompts are whitespace-tolerant, but
			// matching it keeps the rendered prompt byte-identical, which matters
			// because the cache key is derived from the request.
			return JSON.stringify(value, null, 4);
		}

		return String(value);
	});
}

function resolvePath(path: string, context: Record<string, unknown>): unknown {
	let value: unknown = context;

	for (const segment of path.split('.')) {
		if (value !== null && typeof value === 'object' && segment in (value as object)) {
			value = (value as Record<string, unknown>)[segment];
		} else {
			return null;
		}
	}

	return value;
}
