import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { createApp } from '../http/app.js';

/**
 * Endpoint-level tests for the first cutover.
 *
 * The maths itself is already proven against Laravel by the parity suite in
 * @frugalist/contracts. What is checked here is everything the HTTP layer adds
 * on top and could get wrong independently: the `{ inputs, computed }`
 * envelope, which keys get echoed, the strict `numeric` validation the Laravel
 * controller applied, and the 422 body shape both clients parse.
 */

const app = createApp();

const post = (path: string, body: unknown) =>
	app.request(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

const cases = JSON.parse(
	readFileSync(
		fileURLToPath(new URL('../../../packages/contracts/fixtures/cases.json', import.meta.url)),
		'utf8',
	),
) as { finance: { name: string; input: Record<string, unknown> }[] };

describe('POST /api/calculators/finance/compute', () => {
	it('returns the { inputs, computed } envelope', async () => {
		const res = await post('/api/calculators/finance/compute', {
			msrp: 42000,
			down_payment: 5000,
			finance_term: 60,
			interest_rate: 6.49,
			sales_tax_percent: 7.25,
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as Record<string, Record<string, unknown>>;

		expect(Object.keys(body).sort()).toEqual(['computed', 'inputs']);
		expect(body.computed).toHaveProperty('monthly_payment');
		expect(body.computed).toHaveProperty('amortization');
	});

	it('echoes only the keys the request actually sent', async () => {
		// Laravel's validate() returns the present-and-validated subset, and the
		// Vue forms read `inputs` back. A fully defaulted echo would change what
		// they render.
		const res = await post('/api/calculators/finance/compute', { msrp: 30000 });
		const body = (await res.json()) as { inputs: Record<string, unknown> };

		expect(Object.keys(body.inputs)).toEqual(['msrp']);
	});

	it('never echoes the with_schedule control flag', async () => {
		const res = await post('/api/calculators/finance/compute', {
			msrp: 30000,
			with_schedule: false,
		});
		const body = (await res.json()) as { inputs: Record<string, unknown>; computed: { amortization: unknown } };

		expect(body.inputs).not.toHaveProperty('with_schedule');
		expect(body.computed.amortization).toBeNull();
	});

	it('defaults with_schedule to true when absent or null', async () => {
		for (const payload of [{ msrp: 40000, finance_term: 60, interest_rate: 6 }, { msrp: 40000, finance_term: 60, interest_rate: 6, with_schedule: null }]) {
			const res = await post('/api/calculators/finance/compute', payload);
			const body = (await res.json()) as { computed: { amortization: unknown } };
			expect(body.computed.amortization).not.toBeNull();
		}
	});

	it('treats the string "0" as false, as PHP does', async () => {
		// Boolean("0") is true in JavaScript; (bool) "0" is false in PHP.
		const res = await post('/api/calculators/finance/compute', {
			msrp: 40000,
			finance_term: 60,
			interest_rate: 6,
			with_schedule: '0',
		});
		const body = (await res.json()) as { computed: { amortization: unknown } };

		expect(body.computed.amortization).toBeNull();
	});

	it('accepts numeric strings', async () => {
		const res = await post('/api/calculators/finance/compute', { msrp: '42000', finance_term: '60' });
		expect(res.status).toBe(200);
	});

	it('rejects masked currency strings with 422, matching the numeric rule', async () => {
		const res = await post('/api/calculators/finance/compute', { msrp: '$42,000' });

		expect(res.status).toBe(422);
		const body = (await res.json()) as { message: string; errors: Record<string, string[]> };

		// Text captured from the running Laravel app, not invented.
		expect(body.errors.msrp).toEqual(['The msrp field must be a number.']);
		expect(body.message).toBe('The msrp field must be a number.');
	});

	it('humanizes snake_case field names the way Laravel does', async () => {
		const res = await post('/api/calculators/finance/compute', { sales_tax_percent: 'abc' });
		const body = (await res.json()) as { message: string; errors: Record<string, string[]> };

		expect(body.errors.sales_tax_percent).toEqual([
			'The sales tax percent field must be a number.',
		]);
		expect(body.message).toBe('The sales tax percent field must be a number.');
	});

	it('summarises multiple errors the way Laravel does', async () => {
		const res = await post('/api/calculators/finance/compute', {
			msrp: 'x',
			fees: 'y',
			rebates: 'z',
		});
		const body = (await res.json()) as { message: string; errors: Record<string, string[]> };

		expect(Object.keys(body.errors).sort()).toEqual(['fees', 'msrp', 'rebates']);
		expect(body.message).toBe('The msrp field must be a number. (and 2 more errors)');
	});

	it('uses the singular form for exactly one additional error', async () => {
		const res = await post('/api/calculators/finance/compute', { msrp: 'x', fees: 'y' });
		const body = (await res.json()) as { message: string };

		expect(body.message).toBe('The msrp field must be a number. (and 1 more error)');
	});

	it('rejects booleans, because is_numeric() does', async () => {
		const res = await post('/api/calculators/finance/compute', { rebates: true });
		expect(res.status).toBe(422);
	});

	it('accepts an empty body', async () => {
		const res = await post('/api/calculators/finance/compute', {});
		expect(res.status).toBe(200);
	});

	it('treats a malformed body as an empty one rather than a parse error', async () => {
		const res = await app.request('/api/calculators/finance/compute', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: 'not json',
		});
		expect(res.status).toBe(200);
	});
});

describe('POST /api/calculators/lease/compute', () => {
	it('computes a lease', async () => {
		const res = await post('/api/calculators/lease/compute', {
			msrp: 45000,
			residual_percent: 58,
			money_factor: 0.00225,
			lease_term: 36,
			sales_tax_percent: 7,
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as { computed: Record<string, unknown> };
		expect(body.computed).toHaveProperty('lease_payment');
		expect(body.computed.interest_rate).toBeCloseTo(5.4, 10);
	});
});

describe('POST /api/calculators/mortgage/compute', () => {
	it('computes a mortgage with escrow', async () => {
		const res = await post('/api/calculators/mortgage/compute', {
			property_value: 450000,
			down_payment: 90000,
			loan_term_years: 30,
			interest_rate: 6.75,
			annual_property_tax: 5400,
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as { computed: Record<string, unknown> };
		expect(body.computed).toHaveProperty('monthly_payment_total');
		expect(body.computed).toHaveProperty('annual_amortization');
	});

	it('rejects a non-numeric property value', async () => {
		const res = await post('/api/calculators/mortgage/compute', { property_value: 'a lot' });
		expect(res.status).toBe(422);
	});
});

describe('every fixture case is servable over HTTP', () => {
	// Guards against a schema that rejects input the calculator handles happily.
	// Cases using masked strings are expected to 422 - the endpoint validates
	// strictly even though the calculator does not.
	// Verified against the running Laravel app: both of these 422 there too.
	// "masked currency strings" fails because is_numeric("$42,000") is false;
	// "boolean and null inputs" fails because is_numeric(true) is false.
	const REJECTED = new Set(['masked currency strings', 'boolean and null inputs']);

	for (const testCase of cases.finance) {
		it(testCase.name, async () => {
			const res = await post('/api/calculators/finance/compute', testCase.input);
			expect(res.status).toBe(REJECTED.has(testCase.name) ? 422 : 200);
		});
	}
});

describe('unknown routes', () => {
	it('returns a 404 with a message body', async () => {
		const res = await app.request('/api/nope');
		expect(res.status).toBe(404);
		expect((await res.json()) as { message: string }).toHaveProperty('message');
	});
});
