import { z } from 'zod';

/**
 * Laravel validation rules, transcribed.
 *
 * The 422 bodies are a contract, so the rules that produce them have to behave
 * and *read* the same. Rather than approximate them per-route, each rule lives
 * here once with the message text Laravel emits, verified against the running
 * application.
 *
 * The attribute name is passed in already humanised ("sales tax percent")
 * because that is what Laravel's :attribute placeholder renders - it replaces
 * underscores with spaces.
 */

const isNumericLike = (v: unknown): boolean => {
	if (typeof v === 'number') return Number.isFinite(v);
	if (typeof v === 'string') {
		const t = v.trim();
		return t !== '' && Number.isFinite(Number(t));
	}
	// is_numeric() rejects booleans, null and objects.
	return false;
};

const toNumber = (v: unknown): number => (typeof v === 'number' ? v : Number(String(v).trim()));

/** `nullable|string|max:N` */
export function nullableString(attribute: string, max?: number) {
	let schema = z.union([z.string(), z.null()]).optional();

	if (max !== undefined) {
		schema = schema.refine((v) => v === null || v === undefined || v.length <= max, {
			message: `The ${attribute} field must not be greater than ${max} characters.`,
		}) as never;
	}

	return schema;
}

/** `nullable|numeric` with optional `min:` / `max:` */
export function nullableNumeric(attribute: string, bounds: { min?: number; max?: number } = {}) {
	return z
		.union([z.number(), z.string(), z.boolean(), z.null()])
		.optional()
		.superRefine((v, ctx) => {
			if (v === null || v === undefined) return;

			if (!isNumericLike(v)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must be a number.`,
				});
				return;
			}

			const n = toNumber(v);

			if (bounds.min !== undefined && n < bounds.min) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must be at least ${bounds.min}.`,
				});
			}

			if (bounds.max !== undefined && n > bounds.max) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must not be greater than ${bounds.max}.`,
				});
			}
		})
		.transform((v) => (v === null || v === undefined ? v : toNumber(v)));
}

/** `nullable|integer` with optional bounds. */
export function nullableInteger(attribute: string, bounds: { min?: number; max?: number } = {}) {
	return z
		.union([z.number(), z.string(), z.null()])
		.optional()
		.superRefine((v, ctx) => {
			if (v === null || v === undefined) return;

			const n = toNumber(v);

			if (!isNumericLike(v) || !Number.isInteger(n)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must be an integer.`,
				});
				return;
			}

			if (bounds.min !== undefined && n < bounds.min) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must be at least ${bounds.min}.`,
				});
			}

			if (bounds.max !== undefined && n > bounds.max) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must not be greater than ${bounds.max}.`,
				});
			}
		})
		.transform((v) => (v === null || v === undefined ? v : toNumber(v)));
}

/** `nullable|in:A,B,C` */
export function nullableEnum<const T extends readonly string[]>(attribute: string, values: T) {
	return z
		.union([z.string(), z.null()])
		.optional()
		.refine((v) => v === null || v === undefined || (values as readonly string[]).includes(v), {
			message: `The selected ${attribute} is invalid.`,
		});
}

/** `nullable|email|max:N` */
export function nullableEmail(attribute: string, max?: number) {
	return z
		.union([z.string(), z.null()])
		.optional()
		.superRefine((v, ctx) => {
			if (v === null || v === undefined) return;

			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must be a valid email address.`,
				});
				return;
			}

			if (max !== undefined && v.length > max) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must not be greater than ${max} characters.`,
				});
			}
		});
}

/**
 * `nullable|date`
 *
 * Returns a Date so the column receives the type Drizzle expects. Timestamps in
 * this database are UTC by construction - config/app.php has always set the
 * Laravel timezone to UTC - so a date-only string is anchored at UTC midnight
 * rather than the server's local midnight, which would shift the stored day.
 */
export function nullableDate(attribute: string) {
	return z
		.union([z.string(), z.date(), z.null()])
		.optional()
		.superRefine((v, ctx) => {
			if (v === null || v === undefined || v instanceof Date) return;

			if (Number.isNaN(Date.parse(v))) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `The ${attribute} field must be a valid date.`,
				});
			}
		})
		.transform((v) => {
			if (v === null || v === undefined) return v;
			if (v instanceof Date) return v;
			return /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00Z`) : new Date(v);
		});
}

export const laravelRules = {
	nullableString,
	nullableNumeric,
	nullableInteger,
	nullableEnum,
	nullableEmail,
	nullableDate,
};
