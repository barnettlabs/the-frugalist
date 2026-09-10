import { z } from 'zod';
import { num } from '../money.js';
import { looseNumber } from './shared.js';

/** Port of App\Services\Calculators\LeaseCalculator. */

export const leaseInputSchema = z.object({
	msrp: looseNumber,
	residual_percent: looseNumber,
	money_factor: looseNumber,
	dealer_contribution: looseNumber,
	trade_in: looseNumber,
	doc_fee: looseNumber,
	acquisition_fee: looseNumber,
	misc_fees: looseNumber,
	lease_cash: looseNumber,
	down_payment: looseNumber,
	lease_term: looseNumber,
	sales_tax_percent: looseNumber,
});

export type LeaseInput = z.input<typeof leaseInputSchema>;

export type LeaseScheduleRow = {
	month: number;
	principal_payment: number;
	interest_payment: number;
	tax_payment: number;
	total_payment: number;
	remaining_principal: number;
};

export type LeaseSummary = {
	residual_amount: number;
	interest_rate: number;
	final_dealer_price: number;
	gross_cap_cost: number;
	net_cap_cost: number;
	principal_amount: number;
	monthly_principal_payment: number;
	residual_monthly_interest_payment: number;
	total_sales_tax: number;
	monthly_sales_tax: number;
	lease_payment: number;
	cash_due_at_signing: number;
	total_lease_cost: number;
	schedule: LeaseScheduleRow[] | null;
};

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

	residualAmount(): number {
		return this.n('msrp') * (this.n('residual_percent') / 100);
	}

	/** Money factor to APR: the standard x2400 conversion. */
	interestRate(): number {
		return this.n('money_factor') * 2400;
	}

	finalDealerPrice(): number {
		return this.n('msrp') - this.n('dealer_contribution') - this.n('trade_in');
	}

	grossCapCost(): number {
		return (
			this.finalDealerPrice() +
			this.n('doc_fee') +
			this.n('acquisition_fee') +
			this.n('misc_fees')
		);
	}

	netCapCost(): number {
		return this.grossCapCost() - this.n('lease_cash') - this.n('down_payment');
	}

	principalAmount(): number {
		return this.netCapCost() - this.residualAmount();
	}

	residualMonthlyInterestPayment(): number {
		return (this.residualAmount() * this.interestRate()) / 100 / 12;
	}

	monthlyPrincipalPayment(): number {
		const pv = this.principalAmount();
		const n = this.n('lease_term');
		const apr = this.interestRate();

		if (apr <= 0 || n <= 0) return 0;

		const r = apr / 1200;
		const paymentPI = (pv * r) / (1 - Math.pow(1 + r, -n));

		return paymentPI + this.residualMonthlyInterestPayment();
	}

	totalSalesTax(): number {
		const multiplier = this.n('sales_tax_percent') / 100;
		const term = this.n('lease_term');
		const monthlyBeforeTax =
			this.monthlyPrincipalPayment() + this.residualMonthlyInterestPayment();

		const taxOnRebates = this.n('lease_cash') * multiplier;
		const taxOnDown = this.n('down_payment') * multiplier;
		const taxOnMonthly = monthlyBeforeTax * multiplier * term;

		return taxOnRebates + taxOnDown + taxOnMonthly;
	}

	monthlySalesTax(): number {
		const term = this.n('lease_term');
		return term <= 0 ? 0 : this.totalSalesTax() / term;
	}

	leasePayment(): number {
		return (
			this.monthlyPrincipalPayment() +
			this.residualMonthlyInterestPayment() +
			this.monthlySalesTax()
		);
	}

	cashDueAtSigning(): number {
		return this.n('down_payment') + this.leasePayment();
	}

	totalLeaseCost(): number {
		return this.leasePayment() * this.n('lease_term') + this.cashDueAtSigning();
	}

	schedule(): LeaseScheduleRow[] {
		const term = Math.trunc(this.n('lease_term'));
		const monthlyPrincipal = this.monthlyPrincipalPayment();
		const residualInterest = this.residualMonthlyInterestPayment();
		const monthlyTax = this.monthlySalesTax();
		const payment = this.leasePayment();

		let remaining = this.principalAmount();
		const schedule: LeaseScheduleRow[] = [];

		for (let month = 1; month <= term; month++) {
			remaining -= monthlyPrincipal;

			schedule.push({
				month,
				principal_payment: monthlyPrincipal,
				interest_payment: residualInterest,
				tax_payment: monthlyTax,
				total_payment: payment,
				remaining_principal: Math.max(0, remaining),
			});
		}

		return schedule;
	}

	summary(includeSchedule = true): LeaseSummary {
		return {
			residual_amount: this.residualAmount(),
			interest_rate: this.interestRate(),
			final_dealer_price: this.finalDealerPrice(),
			gross_cap_cost: this.grossCapCost(),
			net_cap_cost: this.netCapCost(),
			principal_amount: this.principalAmount(),
			monthly_principal_payment: this.monthlyPrincipalPayment(),
			residual_monthly_interest_payment: this.residualMonthlyInterestPayment(),
			total_sales_tax: this.totalSalesTax(),
			monthly_sales_tax: this.monthlySalesTax(),
			lease_payment: this.leasePayment(),
			cash_due_at_signing: this.cashDueAtSigning(),
			total_lease_cost: this.totalLeaseCost(),
			schedule: includeSchedule ? this.schedule() : null,
		};
	}
}

export function computeLease(input: Record<string, unknown>, includeSchedule = true): LeaseSummary {
	return LeaseCalculator.fromObject(input).summary(includeSchedule);
}
