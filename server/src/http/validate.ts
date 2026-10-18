import { validationErrorBody, zodToValidationErrors } from '@frugalist/contracts';
import type { Context, MiddlewareHandler, ValidationTargets } from 'hono';
import type { ZodSchema, z } from 'zod';

/**
 * Request validation that fails the way Laravel failed.
 *
 * Hono's own zValidator returns Zod's error format, which no client here can
 * read. This wrapper keeps the ergonomics and swaps the failure body for the
 * 422 envelope in contracts/errors.
 */
export function validate<T extends ZodSchema, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T,
): MiddlewareHandler<
	{ Variables: { [K in Target as `valid_${string & K}`]: z.infer<T> } },
	string
> {
	return async (c, next) => {
		const raw = await readTarget(c, target);
		const result = schema.safeParse(raw);

		if (!result.success) {
			return c.json(validationErrorBody(zodToValidationErrors(result.error.issues)), 422);
		}

		c.set(`valid_${String(target)}` as never, result.data as never);
		await next();
	};
}

async function readTarget(c: Context, target: keyof ValidationTargets): Promise<unknown> {
	switch (target) {
		case 'json': {
			// An empty or malformed body should read as "no fields provided" so the
			// schema reports the missing fields, rather than surfacing a parse error.
			try {
				return emptyStringsToNull(await c.req.json());
			} catch {
				return {};
			}
		}
		case 'query':
			return c.req.query();
		case 'param':
			return c.req.param();
		case 'header':
			return Object.fromEntries(c.req.raw.headers.entries());
		case 'form':
			return await c.req.parseBody();
		default:
			return {};
	}
}

/**
 * Laravel's ConvertEmptyStringsToNull middleware, which ran on every request.
 *
 * A cleared form field arrives as "", and every rule here is `nullable`, so
 * Laravel saw it as null and accepted it. Without this the same field failed
 * "must be a number" or "must be a valid date": a new estimate with any field
 * left blank could not be saved.
 */
export function emptyStringsToNull(value: unknown): unknown {
	if (value === '') return null;
	if (Array.isArray(value)) return value.map(emptyStringsToNull);
	if (value !== null && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, emptyStringsToNull(v)]));
	}
	return value;
}

export function validated<T>(c: Context, target: keyof ValidationTargets): T {
	return c.get(`valid_${String(target)}` as never) as T;
}
