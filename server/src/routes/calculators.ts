import {
	computeFinance,
	computeLease,
	computeMortgage,
	humanizeField,
} from '@frugalist/contracts';
import { Hono } from 'hono';
import { z } from 'zod';

import type { AppEnv } from '../http/app.js';
import { validate, validated } from '../http/validate.js';

/**
 * Public compute endpoints. The same maths backs the UI and the AI agents, so
 * these are the single source of truth for a payment number.
 *
 * First endpoints cut over from Laravel, chosen because they are stateless,
 * already unit-tested, publicly routed and trivially reversible - which makes
 * them the cheapest possible way to prove the deployment and routing pipeline.
 *
 * The response envelope is `{ inputs, computed }`, matching
 * App\Http\Controllers\CalculatorController exactly. `inputs` echoes only the
 * keys the request actually sent, because Laravel's validate() returns just the
 * present-and-validated subset - the Vue calculators read that back to
 * repopulate their forms, so echoing a full defaulted object would change what
 * they render.
 */

/**
 * Laravel's `numeric` rule, which is PHP's is_numeric().
 *
 * Worth being precise here: is_numeric() accepts numeric *strings* like "42.5"
 * and "1e5" but rejects "$42,000". The calculators themselves are far more
 * forgiving - they strip non-numeric characters - but that leniency only
 * applies to values loaded from the database. Requests to these endpoints were
 * always validated strictly, so a masked currency string has to keep returning
 * 422 rather than silently succeeding.
 */
const numericLike = (field: string) =>
	z
		.union([z.number(), z.string(), z.boolean(), z.null()])
		.optional()
		.refine(
			(v) => {
				if (v === null || v === undefined) return true;
				// is_numeric() is false for booleans, so `true` fails the rule.
				// Verified against the running Laravel app.
				if (typeof v === 'boolean') return false;
				if (typeof v === 'number') return Number.isFinite(v);
				const trimmed = v.trim();
				if (trimmed === '') return false;
				return Number.isFinite(Number(trimmed));
			},
			{ message: `The ${humanizeField(field)} field must be a number.` },
		);

/** Laravel's `boolean` rule: true, false, 1, 0, "1", "0". */
const booleanLike = (field: string) =>
	z
		.union([z.boolean(), z.number(), z.string(), z.null()])
		.optional()
		.refine(
			(v) =>
				v === null ||
				v === undefined ||
				typeof v === 'boolean' ||
				v === 1 ||
				v === 0 ||
				v === '1' ||
				v === '0',
			{ message: `The ${humanizeField(field)} field must be true or false.` },
		);

/**
 * `(bool) ($data['with_schedule'] ?? true)` in PHP.
 *
 * Note `(bool) "0"` is false in PHP but `Boolean("0")` is true in JavaScript -
 * a difference that would silently flip the default for any client sending the
 * string form.
 */
function resolveIncludeSchedule(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') return value !== '0' && value !== '';
	return Boolean(value);
}

/**
 * The validated subset, minus the control flag, exactly as `inputs`.
 *
 * One deliberate divergence: when no keys validate, Laravel emits `"inputs":[]`
 * rather than `{}`, because PHP cannot distinguish an empty array from an empty
 * map and json_encode picks the array form. This returns `{}`, which is what the
 * field actually means. Both clients read it with property access, for which the
 * two are indistinguishable, so nothing observable changes.
 */
function echoInputs<T extends Record<string, unknown>>(data: T): Omit<T, 'with_schedule'> {
	const { with_schedule: _ignored, ...rest } = data;
	return rest;
}

const financeSchema = z.object({
	msrp: numericLike('msrp'),
	fees: numericLike('fees'),
	discounts: numericLike('discounts'),
	rebates: numericLike('rebates'),
	down_payment: numericLike('down_payment'),
	sales_tax_percent: numericLike('sales_tax_percent'),
	interest_rate: numericLike('interest_rate'),
	finance_term: numericLike('finance_term'),
	extra_payments_json: z.unknown().optional(),
	with_schedule: booleanLike('with_schedule'),
});

const leaseSchema = z.object({
	msrp: numericLike('msrp'),
	dealer_contribution: numericLike('dealer_contribution'),
	trade_in: numericLike('trade_in'),
	doc_fee: numericLike('doc_fee'),
	acquisition_fee: numericLike('acquisition_fee'),
	misc_fees: numericLike('misc_fees'),
	lease_cash: numericLike('lease_cash'),
	down_payment: numericLike('down_payment'),
	money_factor: numericLike('money_factor'),
	sales_tax_percent: numericLike('sales_tax_percent'),
	residual_percent: numericLike('residual_percent'),
	lease_term: numericLike('lease_term'),
	with_schedule: booleanLike('with_schedule'),
});

const mortgageSchema = z.object({
	property_value: numericLike('property_value'),
	down_payment: numericLike('down_payment'),
	interest_rate: numericLike('interest_rate'),
	loan_term_years: numericLike('loan_term_years'),
	monthly_hoa: numericLike('monthly_hoa'),
	annual_insurance: numericLike('annual_insurance'),
	annual_property_tax: numericLike('annual_property_tax'),
	extra_expenses_json: z.unknown().optional(),
	extra_payments_json: z.unknown().optional(),
	with_schedule: booleanLike('with_schedule'),
});

export const calculatorRoutes = new Hono<AppEnv>();

calculatorRoutes.post('/finance/compute', validate('json', financeSchema), (c) => {
	const data = validated<z.infer<typeof financeSchema>>(c, 'json');
	const inputs = echoInputs(data);

	return c.json({
		inputs,
		computed: computeFinance(inputs, resolveIncludeSchedule(data.with_schedule)),
	});
});

calculatorRoutes.post('/lease/compute', validate('json', leaseSchema), (c) => {
	const data = validated<z.infer<typeof leaseSchema>>(c, 'json');
	const inputs = echoInputs(data);

	return c.json({
		inputs,
		computed: computeLease(inputs, resolveIncludeSchedule(data.with_schedule)),
	});
});

calculatorRoutes.post('/mortgage/compute', validate('json', mortgageSchema), (c) => {
	const data = validated<z.infer<typeof mortgageSchema>>(c, 'json');
	const inputs = echoInputs(data);

	return c.json({
		inputs,
		computed: computeMortgage(inputs, resolveIncludeSchedule(data.with_schedule)),
	});
});
