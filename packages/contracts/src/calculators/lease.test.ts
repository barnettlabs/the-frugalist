import { describe, expect, it } from 'vitest';

import { computeLease } from './lease.js';

/**
 * Lease expectations derived independently of this code.
 *
 * The first case is a real closed-end lease contract (a 2025 Honda Pilot,
 * 36 months), entered the way a user would copy it off the paperwork: every
 * figure asserted is printed on that contract. The others are worked by hand
 * from the disclosure method the contract uses:
 *
 *   base payment  = (C - D) / n + (C + D) * MF, rounded to the cent
 *   rent charge   = base payment * n - (C - D)
 *   due at signing = cap cost reduction + tax on cash and rebates
 *                    + first payment + upfront fees + security deposit
 */
describe('lease calculator - the contract', () => {
	const contract = {
		agreed_value: 47509.14,
		residual_amount: 33828.3,
		money_factor: 0.002,
		lease_term: 36,
		capitalized_taxes: 1325.61,
		acquisition_fee: 595,
		doc_fee: 250,
		doc_fee_upfront: true,
		title_registration_fees: 122,
		title_registration_fees_upfront: true,
		misc_fees: 50,
		misc_fees_upfront: true,
		lease_cash: 500,
		sales_tax_percent: 6.75,
		tax_method: 'upfront',
		disposition_fee: 350,
		purchase_option_fee: 0,
		miles_per_year: 12000,
		excess_mile_rate: 0.2,
	};

	it('reproduces item 7, the scheduled payment, to the cent', () => {
		const s = computeLease(contract, false);

		expect(s.gross_cap_cost).toBeCloseTo(49429.75, 2); // A
		expect(s.cap_cost_reduction).toBeCloseTo(500, 2); // B
		expect(s.net_cap_cost).toBeCloseTo(48929.75, 2); // C
		expect(s.residual_amount).toBeCloseTo(33828.3, 2); // D
		expect(s.depreciation).toBeCloseTo(15101.45, 2); // E
		expect(s.rent_charge).toBeCloseTo(5958.55, 2); // F
		expect(s.total_base_payments).toBeCloseTo(21060, 2); // G
		expect(s.base_payment).toBeCloseTo(585, 2); // I
		expect(s.monthly_sales_tax).toBe(0); // J: taxed upfront
		expect(s.lease_payment).toBeCloseTo(585, 2); // M
	});

	it('reproduces the amount due at signing and the total of payments', () => {
		const s = computeLease(contract, false);

		expect(s.cap_cost_reduction_tax).toBeCloseTo(33.75, 2);
		expect(s.amount_due_at_signing).toBeCloseTo(1540.75, 2); // item 2
		expect(s.cash_due_at_signing).toBeCloseTo(1040.75, 2); // 6B3: the rebate pays the rest
		expect(s.total_of_payments).toBeCloseTo(22365.75, 2); // item 5
		expect(s.purchase_option_price).toBeCloseTo(33828.3, 2); // item 9
		expect(s.mileage_allowance).toBe(36000);
	});
});

describe('lease calculator - hand-derived', () => {
	it('typical lease with monthly tax', () => {
		// A = 43000 + 599 + 895 + 300 = 44794, B = 3000 + 1500 = 4500, C = 40294
		// D = 26100, E = 14194; I = 14194 / 36 + 66394 * 0.00225 = 543.66
		// J = 543.66 * 7% = 38.06, M = 581.72
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

		expect(s.agreed_value).toBe(43000);
		expect(s.base_payment).toBeCloseTo(543.66, 2);
		expect(s.rent_charge).toBeCloseTo(5377.76, 2);
		expect(s.monthly_sales_tax).toBeCloseTo(38.06, 2);
		expect(s.lease_payment).toBeCloseTo(581.72, 2);
		// 4500 reduction + 315 tax on it + 581.72 first payment
		expect(s.amount_due_at_signing).toBeCloseTo(5396.72, 2);
		expect(s.cash_due_at_signing).toBeCloseTo(3896.72, 2);
		// 5396.72 + 581.72 * 35
		expect(s.total_of_payments).toBeCloseTo(25756.92, 2);
		expect(s.total_lease_cost).toBeCloseTo(24256.92, 2);
	});

	it('zero money factor charges depreciation only', () => {
		// C = 40300, D = 24000, I = 16300 / 36 = 452.78, J = 27.17
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

		expect(s.base_payment).toBeCloseTo(452.78, 2);
		expect(s.lease_payment).toBeCloseTo(479.95, 2);
		// Rounding the payment up leaves 8 cents over 36 months, as a contract would.
		expect(s.rent_charge).toBeCloseTo(0.08, 2);
	});

	it('rolls negative trade-in equity into the gross cap cost', () => {
		// Allowance 10000 against a 13000 payoff: 3000 owed, added to A, nothing off B.
		const s = computeLease({
			agreed_value: 30000,
			residual_amount: 18000,
			money_factor: 0.0015,
			lease_term: 36,
			trade_in: 10000,
			trade_in_payoff: 13000,
		});

		expect(s.net_trade_in).toBe(-3000);
		expect(s.gross_cap_cost).toBe(33000);
		expect(s.cap_cost_reduction).toBe(0);
	});

	it('applies positive trade-in equity as a reduction that is not paid in cash', () => {
		const s = computeLease({
			agreed_value: 30000,
			residual_amount: 18000,
			money_factor: 0.0015,
			lease_term: 36,
			trade_in: 5000,
			trade_in_payoff: 2000,
		});

		expect(s.cap_cost_reduction).toBe(3000);
		expect(s.amount_due_at_signing - s.cash_due_at_signing).toBeCloseTo(3000, 2);
	});

	it('moves a fee paid at signing out of the cap cost', () => {
		const base = { agreed_value: 30000, residual_amount: 18000, money_factor: 0.0015, lease_term: 36 };
		const rolled = computeLease({ ...base, doc_fee: 600 }, false);
		const upfront = computeLease({ ...base, doc_fee: 600, doc_fee_upfront: '1' }, false);

		expect(rolled.gross_cap_cost - upfront.gross_cap_cost).toBe(600);
		expect(upfront.upfront_fees).toBe(600);
		expect(upfront.base_payment).toBeLessThan(rolled.base_payment);
	});

	it('adds optional products to the cap cost', () => {
		const s = computeLease({
			agreed_value: 30000,
			residual_amount: 18000,
			lease_term: 36,
			add_ons_json: JSON.stringify([
				{ name: 'Service contract', amount: 1200 },
				{ name: 'GAP', amount: '$650' },
			]),
		});

		expect(s.add_ons_total).toBe(1850);
		expect(s.gross_cap_cost).toBe(31850);
	});

	it('prefers a residual in dollars and reports it as a percent of MSRP', () => {
		const s = computeLease({ msrp: 50000, residual_amount: 30000, residual_percent: 40, lease_term: 36 });

		expect(s.residual_amount).toBe(30000);
		expect(s.residual_percent).toBeCloseTo(60, 8);
	});

	it('treats a blank residual amount or agreed value as not entered', () => {
		const s = computeLease({
			msrp: 50000,
			dealer_contribution: 2000,
			agreed_value: '',
			residual_amount: '',
			residual_percent: 60,
			lease_term: 36,
		});

		expect(s.agreed_value).toBe(48000);
		expect(s.residual_amount).toBe(30000);
	});

	it('charges nothing for a lease with no term', () => {
		const s = computeLease({ agreed_value: 30000, residual_amount: 18000, lease_term: 0, down_payment: 2000 });

		expect(s.lease_payment).toBe(0);
		expect(s.amount_due_at_signing).toBe(0);
		expect(s.total_of_payments).toBe(0);
		expect(s.schedule).toEqual([]);
	});

	it('schedule rows add up to the payment and pay off the depreciation', () => {
		const s = computeLease({ msrp: 30000, residual_percent: 55, money_factor: 0.002, lease_term: 24, sales_tax_percent: 6 });
		const rows = s.schedule!;

		for (const row of rows) {
			expect(row.principal_payment + row.interest_payment + row.tax_payment).toBeCloseTo(row.total_payment, 8);
		}
		expect(rows.reduce((sum, row) => sum + row.principal_payment, 0)).toBeCloseTo(s.depreciation, 6);
		expect(rows.at(-1)!.remaining_principal).toBeCloseTo(0, 6);
	});
});
