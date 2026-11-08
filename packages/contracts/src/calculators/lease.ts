import { z } from 'zod';
import { num } from '../money.js';
import { decodeJsonish, looseNumber } from './shared.js';

/**
 * Closed-end vehicle lease, figured the way lessors disclose it.
 *
 * The method is the one every US lease contract prints under "your scheduled
 * payment is determined as shown below" (Consumer Leasing Act, Reg M):
 *
 *   A  gross capitalized cost     agreed value + capitalized taxes, fees,
 *                                 prior balance and add-on products
 *   B  capitalized cost reduction cash down + rebates + positive net trade-in
 *   C  adjusted capitalized cost  A - B
 *   D  residual value
 *   E  depreciation               C - D
 *   F  rent charge                G - E
 *   G  total of base payments     I * H
 *   H  number of payments
 *   I  base payment               E / H + (C + D) * money factor, to the cent
 *   J  sales/use tax              I * rate, when tax is charged monthly
 *   M  total scheduled payment    I + J
 *
 * The base payment is rounded to the cent before G and F are derived from it,
 * as contracts do, so a sheet filled in from a contract reproduces its figures
 * exactly rather than to within a few cents.
 *
 * This replaces an annuity method (depreciation amortised like a loan at the
 * money factor's APR), which no lessor uses; on a typical 36-month lease it ran
 * one to two dollars a month high.
 */

const looseFlag = z.union([z.boolean(), z.number(), z.string(), z.null()]).optional();

export const leaseAddOnSchema = z.object({
	name: z.union([z.string(), z.null()]).optional(),
	amount: looseNumber,
});

export type LeaseAddOn = { name: string; amount: number };

export const LEASE_TAX_METHODS = ['monthly', 'upfront'] as const;
export type LeaseTaxMethod = (typeof LEASE_TAX_METHODS)[number];

export const leaseInputSchema = z.object({
	msrp: looseNumber,
	/** The negotiated selling price. Absent on older sheets: MSRP less dealer_contribution. */
	agreed_value: looseNumber,
	dealer_contribution: looseNumber,

	/** In dollars. When absent, residual_percent of MSRP. */
	residual_amount: looseNumber,
	residual_percent: looseNumber,
	money_factor: looseNumber,
	lease_term: looseNumber,

	// Gross capitalized cost add-ons. A fee marked *_upfront is paid at signing
	// instead of being rolled into the lease.
	capitalized_taxes: looseNumber,
	acquisition_fee: looseNumber,
	acquisition_fee_upfront: looseFlag,
	doc_fee: looseNumber,
	doc_fee_upfront: looseFlag,
	title_registration_fees: looseNumber,
	title_registration_fees_upfront: looseFlag,
	misc_fees: looseNumber,
	misc_fees_upfront: looseFlag,
	prior_balance: looseNumber,
	add_ons_json: z.union([z.string(), z.array(leaseAddOnSchema), z.null()]).optional(),

	// Capitalized cost reductions.
	down_payment: looseNumber,
	lease_cash: looseNumber,
	/** Gross trade-in allowance; the payoff is subtracted from it. */
	trade_in: looseNumber,
	trade_in_payoff: looseNumber,

	sales_tax_percent: looseNumber,
	tax_method: z.union([z.string(), z.null()]).optional(),
	security_deposit: looseNumber,

	// End of lease.
	purchase_option_fee: looseNumber,
	disposition_fee: looseNumber,
	miles_per_year: looseNumber,
	excess_mile_rate: looseNumber,
});

export type LeaseInput = z.input<typeof leaseInputSchema>;

export type LeaseScheduleRow = {
	month: number;
	/** Depreciation portion of the base payment. */
	principal_payment: number;
	/** Rent charge portion of the base payment. */
	interest_payment: number;
	tax_payment: number;
	total_payment: number;
	/** Depreciation still to be paid after this month. */
	remaining_principal: number;
};

export type LeaseSummary = {
	msrp: number;
	agreed_value: number;
	residual_amount: number;
	/** The residual as a percent of MSRP, however it was entered. */
	residual_percent: number;
	money_factor: number;
	/** Money factor x 2400, the APR it is usually quoted against. */
	interest_rate: number;
	lease_term: number;
	tax_method: LeaseTaxMethod;

	capitalized_fees: number;
	add_ons_total: number;
	/** Trade-in allowance less payoff; negative is negative equity. */
	net_trade_in: number;
	/** A */
	gross_cap_cost: number;
	/** B */
	cap_cost_reduction: number;
	/** C */
	net_cap_cost: number;
	/** E */
	depreciation: number;
	/** F */
	rent_charge: number;
	/** G */
	total_base_payments: number;
	/** I */
	base_payment: number;
	monthly_depreciation: number;
	monthly_rent_charge: number;
	/** J */
	monthly_sales_tax: number;
	/** M */
	lease_payment: number;

	cap_cost_reduction_tax: number;
	upfront_fees: number;
	security_deposit: number;
	/** Everything due at signing, however it is paid - the contract's item 2. */
	amount_due_at_signing: number;
	/** The part of it paid in cash: rebates and the trade-in pay the rest. */
	cash_due_at_signing: number;
	/** The contract's item 5: due at signing, every payment, the turn-in fee, less refundables. */
	total_of_payments: number;
	/** What the lease costs out of pocket: total of payments less rebates and trade-in equity. */
	total_lease_cost: number;
	total_sales_tax: number;

	purchase_option_price: number;
	disposition_fee: number;
	mileage_allowance: number;
	excess_mile_rate: number;

	// Earlier names for the same figures, still read by the mobile app.
	final_dealer_price: number;
	principal_amount: number;
	monthly_principal_payment: number;
	residual_monthly_interest_payment: number;

	schedule: LeaseScheduleRow[] | null;
};

const cents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

/** Set means present and not blank - a cleared form field arrives as "". */
const isSet = (value: unknown): boolean => value !== null && value !== undefined && value !== '';

/** Form checkboxes, JSON booleans and the 0/1 strings older clients send. */
function flag(value: unknown): boolean {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
	return false;
}

const FEES = [
	['acquisition_fee', 'acquisition_fee_upfront'],
	['doc_fee', 'doc_fee_upfront'],
	['title_registration_fees', 'title_registration_fees_upfront'],
	['misc_fees', 'misc_fees_upfront'],
] as const;

export class LeaseCalculator {
	private readonly data: Record<string, unknown>;

	constructor(data: Record<string, unknown>) {
		this.data = data;
	}

	static fromObject(data: Record<string, unknown>): LeaseCalculator {
		return new LeaseCalculator(data);
	}

	private n(key: string): number {
		return num(this.data[key]);
	}

	term(): number {
		return Math.max(0, Math.trunc(this.n('lease_term')));
	}

	taxMethod(): LeaseTaxMethod {
		return this.data['tax_method'] === 'upfront' ? 'upfront' : 'monthly';
	}

	agreedValue(): number {
		if (isSet(this.data['agreed_value'])) return this.n('agreed_value');
		return this.n('msrp') - this.n('dealer_contribution');
	}

	residualAmount(): number {
		if (isSet(this.data['residual_amount'])) return this.n('residual_amount');
		return this.n('msrp') * (this.n('residual_percent') / 100);
	}

	residualPercent(): number {
		const msrp = this.n('msrp');
		return msrp > 0 ? (this.residualAmount() / msrp) * 100 : 0;
	}

	/** Money factor to APR: the standard x2400 conversion. */
	interestRate(): number {
		return this.n('money_factor') * 2400;
	}

	addOns(): LeaseAddOn[] {
		return decodeJsonish<Record<string, unknown>>(this.data['add_ons_json'])
			.map((item) => ({ name: String(item?.['name'] ?? ''), amount: num(item?.['amount']) }))
			.filter((item) => item.amount !== 0 || item.name !== '');
	}

	addOnsTotal(): number {
		return this.addOns().reduce((sum, item) => sum + item.amount, 0);
	}

	capitalizedFees(): number {
		return FEES.reduce((sum, [fee, upfront]) => (flag(this.data[upfront]) ? sum : sum + this.n(fee)), 0);
	}

	upfrontFees(): number {
		return FEES.reduce((sum, [fee, upfront]) => (flag(this.data[upfront]) ? sum + this.n(fee) : sum), 0);
	}

	netTradeIn(): number {
		return this.n('trade_in') - this.n('trade_in_payoff');
	}

	/** A. Negative trade-in equity is rolled in here, as a prior balance would be. */
	grossCapCost(): number {
		return (
			this.agreedValue() +
			this.n('capitalized_taxes') +
			this.capitalizedFees() +
			this.n('prior_balance') +
			this.addOnsTotal() +
			Math.max(0, -this.netTradeIn())
		);
	}

	/** B */
	capCostReduction(): number {
		return this.n('down_payment') + this.n('lease_cash') + Math.max(0, this.netTradeIn());
	}

	/** C */
	netCapCost(): number {
		return this.grossCapCost() - this.capCostReduction();
	}

	/** E */
	depreciation(): number {
		return this.netCapCost() - this.residualAmount();
	}

	/** I, rounded to the cent as the contract rounds it. */
	basePayment(): number {
		const term = this.term();
		if (term === 0) return 0;

		const monthlyDepreciation = this.depreciation() / term;
		const monthlyRent = (this.netCapCost() + this.residualAmount()) * this.n('money_factor');
		return cents(monthlyDepreciation + monthlyRent);
	}

	/** G */
	totalBasePayments(): number {
		return cents(this.basePayment() * this.term());
	}

	/** F, derived from G as the contract derives it. */
	rentCharge(): number {
		return cents(this.totalBasePayments() - this.depreciation());
	}

	monthlyDepreciation(): number {
		const term = this.term();
		return term === 0 ? 0 : this.depreciation() / term;
	}

	monthlyRentCharge(): number {
		return this.basePayment() - this.monthlyDepreciation();
	}

	private rate(): number {
		return this.n('sales_tax_percent') / 100;
	}

	/** J. Under the upfront method the tax is in capitalized_taxes instead. */
	monthlySalesTax(): number {
		return this.taxMethod() === 'monthly' ? cents(this.basePayment() * this.rate()) : 0;
	}

	/** M */
	leasePayment(): number {
		return this.basePayment() + this.monthlySalesTax();
	}

	/** Tax on the cash and rebates that reduce the cap cost, due at signing. */
	capCostReductionTax(): number {
		return cents((this.n('down_payment') + this.n('lease_cash')) * this.rate());
	}

	amountDueAtSigning(): number {
		if (this.term() === 0) return 0;

		return (
			this.capCostReduction() +
			this.capCostReductionTax() +
			this.leasePayment() +
			this.upfrontFees() +
			this.n('security_deposit')
		);
	}

	cashDueAtSigning(): number {
		if (this.term() === 0) return 0;
		return this.amountDueAtSigning() - this.n('lease_cash') - Math.max(0, this.netTradeIn());
	}

	/**
	 * The first payment is inside the amount due at signing, so it is not
	 * counted again, and the security deposit comes back.
	 */
	totalOfPayments(): number {
		if (this.term() === 0) return 0;

		return (
			this.amountDueAtSigning() +
			this.leasePayment() * (this.term() - 1) +
			this.n('disposition_fee') -
			this.n('security_deposit')
		);
	}

	totalLeaseCost(): number {
		if (this.term() === 0) return 0;
		return this.totalOfPayments() - this.n('lease_cash') - Math.max(0, this.netTradeIn());
	}

	totalSalesTax(): number {
		return this.monthlySalesTax() * this.term() + this.capCostReductionTax() + this.n('capitalized_taxes');
	}

	purchaseOptionPrice(): number {
		return this.residualAmount() + this.n('purchase_option_fee');
	}

	mileageAllowance(): number {
		return this.n('miles_per_year') * (this.term() / 12);
	}

	schedule(): LeaseScheduleRow[] {
		const term = this.term();
		const depreciation = this.monthlyDepreciation();
		const rent = this.monthlyRentCharge();
		const tax = this.monthlySalesTax();
		const payment = this.leasePayment();

		let remaining = this.depreciation();
		const schedule: LeaseScheduleRow[] = [];

		for (let month = 1; month <= term; month++) {
			remaining -= depreciation;

			schedule.push({
				month,
				principal_payment: depreciation,
				interest_payment: rent,
				tax_payment: tax,
				total_payment: payment,
				remaining_principal: Math.max(0, remaining),
			});
		}

		return schedule;
	}

	summary(includeSchedule = true): LeaseSummary {
		return {
			msrp: this.n('msrp'),
			agreed_value: this.agreedValue(),
			residual_amount: this.residualAmount(),
			residual_percent: this.residualPercent(),
			money_factor: this.n('money_factor'),
			interest_rate: this.interestRate(),
			lease_term: this.term(),
			tax_method: this.taxMethod(),

			capitalized_fees: this.capitalizedFees(),
			add_ons_total: this.addOnsTotal(),
			net_trade_in: this.netTradeIn(),
			gross_cap_cost: this.grossCapCost(),
			cap_cost_reduction: this.capCostReduction(),
			net_cap_cost: this.netCapCost(),
			depreciation: this.depreciation(),
			rent_charge: this.rentCharge(),
			total_base_payments: this.totalBasePayments(),
			base_payment: this.basePayment(),
			monthly_depreciation: this.monthlyDepreciation(),
			monthly_rent_charge: this.monthlyRentCharge(),
			monthly_sales_tax: this.monthlySalesTax(),
			lease_payment: this.leasePayment(),

			cap_cost_reduction_tax: this.capCostReductionTax(),
			upfront_fees: this.upfrontFees(),
			security_deposit: this.n('security_deposit'),
			amount_due_at_signing: this.amountDueAtSigning(),
			cash_due_at_signing: this.cashDueAtSigning(),
			total_of_payments: this.totalOfPayments(),
			total_lease_cost: this.totalLeaseCost(),
			total_sales_tax: this.totalSalesTax(),

			purchase_option_price: this.purchaseOptionPrice(),
			disposition_fee: this.n('disposition_fee'),
			mileage_allowance: this.mileageAllowance(),
			excess_mile_rate: this.n('excess_mile_rate'),

			final_dealer_price: this.agreedValue(),
			principal_amount: this.depreciation(),
			monthly_principal_payment: this.monthlyDepreciation(),
			residual_monthly_interest_payment: this.monthlyRentCharge(),

			schedule: includeSchedule ? this.schedule() : null,
		};
	}
}

export function computeLease(input: Record<string, unknown>, includeSchedule = true): LeaseSummary {
	return LeaseCalculator.fromObject(input).summary(includeSchedule);
}
