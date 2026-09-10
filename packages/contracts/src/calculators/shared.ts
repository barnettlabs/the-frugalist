import { z } from 'zod';

/**
 * Inputs arrive from three places - the Vue app, the Expo app, and the AI agent
 * pipeline - and historically all three sent money as whatever the form had:
 * a number, or a masked string like "$32,500". The Laravel calculators coped by
 * running every read through a coercing `num()` helper, so the schemas below
 * accept the same union rather than tightening the contract mid-migration.
 *
 * Tightening it is a fine thing to do later, as its own change with its own
 * client updates. Doing it here would mean parity failures that are actually
 * validation changes, which is exactly the confusion to avoid.
 */
export const looseNumber = z.union([z.number(), z.string(), z.null()]).optional();

export const extraPaymentSchema = z.object({
	startMonth: looseNumber,
	endMonth: looseNumber,
	paymentAmount: looseNumber,
});

export type ExtraPaymentInput = z.infer<typeof extraPaymentSchema>;

/** Accepts a JSON string or an already-parsed array, as PHP's json_decode branch did. */
export const extraPaymentsJson = z
	.union([z.string(), z.array(extraPaymentSchema), z.null()])
	.optional();

export const extraExpenseSchema = z.object({
	label: z.union([z.string(), z.null()]).optional(),
	amount: looseNumber,
	frequency: z.union([z.string(), z.null()]).optional(),
});

export const extraExpensesJson = z
	.union([z.string(), z.array(extraExpenseSchema), z.null()])
	.optional();

export type ParsedExtraPayment = {
	startMonth: number;
	endMonth: number;
	paymentAmount: number;
};

/** Mirrors `$includeSchedule`, which every compute endpoint exposes. */
export const computeOptionsSchema = z.object({
	include_schedule: z.boolean().optional().default(true),
});

/**
 * `is_string($raw) ? json_decode($raw, true) : $raw`, with PHP's `empty()`
 * semantics on the guard - empty string, null and `[]` all mean "no payments".
 * A malformed JSON string returned null from json_decode and then failed the
 * is_array check, so it degraded to an empty list rather than throwing; that is
 * preserved.
 */
export function decodeJsonish<T>(raw: unknown): T[] {
	if (raw === null || raw === undefined || raw === '' || raw === 0 || raw === false) return [];

	if (Array.isArray(raw)) return raw as T[];

	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? (parsed as T[]) : [];
		} catch {
			return [];
		}
	}

	return [];
}

/** Sum of every extra payment window covering `month`. */
export function extraForMonth(month: number, extras: ParsedExtraPayment[]): number {
	let total = 0;
	for (const p of extras) {
		if (month >= p.startMonth && month <= p.endMonth) {
			total += p.paymentAmount;
		}
	}
	return total;
}
