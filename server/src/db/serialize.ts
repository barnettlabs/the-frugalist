/**
 * Row to API shape.
 *
 * Drizzle returns rows keyed by its model properties, which are camelCase.
 * Laravel serialised Eloquent models using the underlying column names, which
 * are snake_case - and that is what both clients type against:
 * web/src/types/models.ts declares `user_id`, `sheet_name`, `created_at`, and
 * the Expo app does the same. Returning camelCase would break every consumer of
 * every record endpoint.
 *
 * The exact target shape was captured from the running Laravel app rather than
 * inferred:
 *
 *     {
 *       "id": 23,
 *       "user_id": 70,
 *       "sheet_name": "Shape Probe",
 *       "msrp": 52000,
 *       "start_date": "2026-03-15T00:00:00.000000Z",
 *       "created_at": "2026-09-10T08:43:58.000000Z"
 *     }
 *
 * Note the timestamp format: Laravel emits six fractional digits, where
 * JavaScript's toISOString emits three. Clients parse both fine, but matching
 * it keeps the differential test honest and means a byte comparison against the
 * old service stays meaningful.
 */

const camelBoundary = /[A-Z]/g;

const keyCache = new Map<string, string>();

export function camelToSnake(key: string): string {
	const cached = keyCache.get(key);
	if (cached !== undefined) return cached;

	const converted = key.replace(camelBoundary, (c) => `_${c.toLowerCase()}`);
	keyCache.set(key, converted);
	return converted;
}

/** Laravel's default datetime serialisation: ISO 8601 with microseconds. */
export function toLaravelDate(value: Date): string {
	// toISOString gives milliseconds; Laravel pads to microseconds.
	return value.toISOString().replace(/\.(\d{3})Z$/, '.$1000Z');
}

function serializeValue(value: unknown): unknown {
	if (value === null || value === undefined) return null;
	if (value instanceof Date) return toLaravelDate(value);
	if (Array.isArray(value)) return value.map(serializeValue);

	// Postgres numeric arrives as a string. Laravel's float casts turned those
	// into JSON numbers, so anything that is numeric-looking and came from a
	// numeric column has already been converted by the route; a bare object here
	// is JSON/JSONB and passes through.
	if (typeof value === 'object') {
		return serializeRow(value as Record<string, unknown>);
	}

	return value;
}

/** One row, keys snake_cased and values Laravel-shaped. */
export function serializeRow<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
	const out: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(row)) {
		out[camelToSnake(key)] = serializeValue(value);
	}

	return out;
}

export function serializeRows<T extends Record<string, unknown>>(
	rows: T[],
): Record<string, unknown>[] {
	return rows.map(serializeRow);
}
