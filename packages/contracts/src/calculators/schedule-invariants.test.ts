import { describe, expect, it } from 'vitest';

import { computeFinance } from './finance.js';
import { computeMortgage } from './mortgage.js';

/**
 * Properties every amortisation schedule must have, whatever the inputs.
 *
 * These pin the final-month and no-schedule fixes independently of the golden
 * vectors, which were re-baselined for them: the rows are what the borrower
 * pays, so they must add up to the totals the summary reports.
 */

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const mortgage = {
	property_value: 400000,
	down_payment: 80000,
	loan_term_years: 30,
	interest_rate: 6.5,
	annual_property_tax: 4800,
	annual_insurance: 1800,
};

describe('mortgage schedule', () => {
	it.each([
		['no extras', {}],
		[
			'500 a month extra to the end',
			{ extra_payments_json: JSON.stringify([{ startMonth: 1, endMonth: '', paymentAmount: 500 }]) },
		],
		[
			'one huge extra',
			{ extra_payments_json: JSON.stringify([{ startMonth: 100, endMonth: 100, paymentAmount: 400000 }]) },
		],
	])('rows add up to the grand total (%s)', (_label, extra) => {
		const s = computeMortgage({ ...mortgage, ...extra });
		const rows = s.amortization!.schedule;

		expect(s.down_payment + sum(rows.map((r) => r.total_payment))).toBeCloseTo(s.grand_total, 6);
		expect(sum(rows.map((r) => r.principal_payment))).toBeCloseTo(s.principal, 6);
		expect(rows.at(-1)!.remaining_balance).toBe(0);
	});

	it('never charges more P&I than is owed in the final month', () => {
		const s = computeMortgage({
			...mortgage,
			extra_payments_json: JSON.stringify([{ startMonth: 1, endMonth: '', paymentAmount: 500 }]),
		});
		const last = s.amortization!.schedule.at(-1)!;

		// Every dollar of the final payment goes to interest or the balance.
		expect(last.payment + last.extra_payment).toBeCloseTo(last.interest_payment + last.principal_payment, 8);
		expect(last.payment).toBeLessThan(s.monthly_principal_interest);
	});

	it('reports the same totals with and without a schedule', () => {
		const withSchedule = computeMortgage(mortgage, true);
		const without = computeMortgage(mortgage, false);

		expect(without.total_interest).toBeCloseTo(withSchedule.total_interest, 2);
		expect(without.payments_total).toBeCloseTo(withSchedule.payments_total, 2);
		expect(without.grand_total).toBeCloseTo(withSchedule.grand_total, 2);
	});
});

describe('finance schedule', () => {
	const loan = { msrp: 30000, down_payment: 3000, interest_rate: 6, finance_term: 60 };

	it('keeps a final-month extra payment and charges only what is owed', () => {
		const s = computeFinance({
			...loan,
			extra_payments_json: JSON.stringify([{ startMonth: 1, endMonth: 60, paymentAmount: 400 }]),
		});
		const rows = s.amortization!.schedule;
		const last = rows.at(-1)!;

		expect(sum(rows.map((r) => r.principal_payment))).toBeCloseTo(s.loan_amount, 6);
		expect(last.total_payment).toBeCloseTo(last.interest_payment + last.principal_payment, 8);
		expect(last.remaining_balance).toBe(0);
	});

	it('amortises a 0% loan rather than returning no schedule', () => {
		const s = computeFinance({ ...loan, interest_rate: 0 });
		const rows = s.amortization!.schedule;

		expect(rows).toHaveLength(60);
		expect(s.amortization!.total_interest).toBe(0);
		expect(rows[0]!.payment).toBeCloseTo(27000 / 60, 8);
	});

	it.each([['blank', ''], ['zero', 0]])('treats a %s end month as a one-month payment', (_label, endMonth) => {
		const s = computeFinance({
			...loan,
			extra_payments_json: JSON.stringify([{ startMonth: 6, endMonth, paymentAmount: 1000 }]),
		});
		const extras = s.amortization!.schedule.filter((r) => r.extra_payment > 0);

		expect(extras.map((r) => [r.month, r.extra_payment])).toEqual([[6, 1000]]);
	});
});
