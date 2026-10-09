import { describe, expect, it } from 'vitest';

import { computeLease } from './lease.js';

/**
 * Hand-derived lease expectations, independent of the Laravel snapshot.
 *
 * The Laravel calculator added the residual rent charge twice and counted the
 * first payment twice in the total, so its golden vectors cannot be the
 * reference for these figures. Each value below comes from the closed-form
 * lease annuity, worked separately from this code:
 *
 *   pre-tax payment = (cap - res * (1 + r)^-n) * r / (1 - (1 + r)^-n),  r = MF * 2400 / 1200
 *   with r = 0:       (cap - res) / n
 *   total cost      = down payment + payment * n
 */
describe('lease calculator - hand-derived', () => {
	it('typical lease: residual rent charge is counted once', () => {
		// cap = 45000 - 2000 + 599 + 895 + 300 - 1500 - 3000 = 40294, res = 26100, r = 0.0045
		const s = computeLease({
			msrp: 45000,
			residual_percent: 58,
			money_factor: 0.00225,
			dealer_contribution: 2000,
			trade_in: 0,
			doc_fee: 599,
			acquisition_fee: 895,
			misc_fees: 300,
			lease_cash: 1500,
			down_payment: 3000,
			lease_term: 36,
			sales_tax_percent: 7,
		});

		expect(s.monthly_principal_payment + s.residual_monthly_interest_payment).toBeCloseTo(545.41, 2);
		expect(s.lease_payment).toBeCloseTo(592.34, 2);
		expect(s.cash_due_at_signing).toBeCloseTo(3592.34, 2);
		expect(s.total_lease_cost).toBeCloseTo(24324.22, 2);
	});

	it('zero money factor still charges depreciation', () => {
		// cap = 40000 - 1000 + 500 + 800 = 40300, res = 24000, (cap - res) / 36 = 452.78
		const s = computeLease({
			msrp: 40000,
			residual_percent: 60,
			money_factor: 0,
			dealer_contribution: 1000,
			doc_fee: 500,
			acquisition_fee: 800,
			lease_term: 36,
			sales_tax_percent: 6,
		});

		expect(s.monthly_principal_payment).toBeCloseTo(452.78, 2);
		expect(s.residual_monthly_interest_payment).toBe(0);
		expect(s.lease_payment).toBeCloseTo(479.94, 2);
		expect(s.total_lease_cost).toBeCloseTo(17278, 2);
	});

	it('schedule rows add up to the payment', () => {
		const s = computeLease({ msrp: 30000, residual_percent: 55, money_factor: 0.002, lease_term: 24 });
		const row = s.schedule![0]!;

		expect(row.principal_payment + row.interest_payment + row.tax_payment).toBeCloseTo(row.total_payment, 8);
	});
});
