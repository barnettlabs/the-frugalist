import { z } from 'zod';
import { num } from '../money.js';
import {
	decodeJsonish,
	extraForMonth,
	extraPaymentsJson,
	looseNumber,
	type ParsedExtraPayment,
} from './shared.js';

/** Port of App\Services\Calculators\FinanceCalculator. */

export const financeInputSchema = z.object({
	msrp: looseNumber,
	discounts: looseNumber,
	rebates: looseNumber,
	sales_tax_percent: looseNumber,
	fees: looseNumber,
	down_payment: looseNumber,
	finance_term: looseNumber,
	interest_rate: looseNumber,
	extra_payments_json: extraPaymentsJson,
});

export type FinanceInput = z.input<typeof financeInputSchema>;

export type FinanceScheduleRow = {
	month: number;
	payment: number;
	extra_payment: number;
	total_payment: number;
	principal_payment: number;
	interest_payment: number;
	remaining_balance: number;
};

export type FinanceAmortization = {
	schedule: FinanceScheduleRow[];
	total_interest: number;
	total_principal: number;
	months_paid: number;
	months_saved: number;
};

export type FinanceSummary = {
	purchase_price: number;
	taxable_amount: number;
	sales_tax_amount: number;
	loan_amount: number;
	monthly_payment: number;
	interest_amount: number;
	payments_total: number;
	grand_total: number;
	amortization: FinanceAmortization | null;
};

export class FinanceCalculator {
	private readonly data: Record<string, unknown>;

	constructor(data: Record<string, unknown>) {
		this.data = data;
	}

	static fromObject(data: Record<string, unknown>): FinanceCalculator {
		return new FinanceCalculator(data);
	}

	private n(key: string): number {
		return num(this.data[key]);
	}

	purchasePrice(): number {
		return this.n('msrp') - this.n('discounts') - this.n('rebates');
	}

	taxableAmount(): number {
		return this.n('msrp') - this.n('discounts');
	}

	salesTaxAmount(): number {
		return this.taxableAmount() * (this.n('sales_tax_percent') / 100);
	}

	loanAmount(): number {
		return (
			this.purchasePrice() + this.n('fees') + this.salesTaxAmount() - this.n('down_payment')
		);
	}

	monthlyPayment(): number {
		const pv = this.loanAmount();
		const n = this.n('finance_term');
		const rate = this.n('interest_rate');

		if (pv <= 0 || n <= 0) return 0;
		if (rate <= 0) return pv / n;

		const r = rate / 100 / 12;
		return (pv * r) / (1 - Math.pow(1 + r, -n));
	}

	paymentsTotal(): number {
		return this.monthlyPayment() * this.n('finance_term');
	}

	interestAmount(): number {
		return this.paymentsTotal() - this.loanAmount();
	}

	grandTotal(): number {
		return this.paymentsTotal() + this.n('down_payment');
	}

	amortization(withExtraPayments = false): FinanceAmortization | null {
		const loanAmount = this.loanAmount();
		const rate = this.n('interest_rate');
		const term = Math.trunc(this.n('finance_term'));
		const monthlyPayment = this.monthlyPayment();

		if (loanAmount <= 0 || rate <= 0 || term <= 0) return null;

		const schedule: FinanceScheduleRow[] = [];
		let remaining = loanAmount;
		let totalInterest = 0;
		let totalPrincipal = 0;
		const extras = this.parseExtraPayments();

		for (let month = 1; month <= term && remaining > 0; month++) {
			const interestPayment = (remaining * rate) / 100 / 12;
			let principalPayment = monthlyPayment - interestPayment;

			let extraPayment = 0;
			if (withExtraPayments && extras.length > 0) {
				extraPayment = extraForMonth(month, extras);
			}

			if (principalPayment + extraPayment > remaining) {
				principalPayment = remaining;
				extraPayment = 0;
			}

			const totalPayment = monthlyPayment + extraPayment;
			remaining -= principalPayment + extraPayment;
			totalInterest += interestPayment;
			totalPrincipal += principalPayment + extraPayment;

			schedule.push({
				month,
				payment: monthlyPayment,
				extra_payment: extraPayment,
				total_payment: totalPayment,
				principal_payment: principalPayment + extraPayment,
				interest_payment: interestPayment,
				remaining_balance: Math.max(0, remaining),
			});

			if (remaining <= 0) break;
		}

		return {
			schedule,
			total_interest: totalInterest,
			total_principal: totalPrincipal,
			months_paid: schedule.length,
			months_saved: Math.max(0, term - schedule.length),
		};
	}

	summary(includeSchedule = true): FinanceSummary {
		const amort = includeSchedule ? this.amortization(true) : null;

		return {
			purchase_price: this.purchasePrice(),
			taxable_amount: this.taxableAmount(),
			sales_tax_amount: this.salesTaxAmount(),
			loan_amount: this.loanAmount(),
			monthly_payment: this.monthlyPayment(),
			interest_amount: this.interestAmount(),
			payments_total: this.paymentsTotal(),
			grand_total: this.grandTotal(),
			amortization: amort,
		};
	}

	/**
	 * Note the asymmetry with the mortgage calculator: here a missing `endMonth`
	 * falls back to `startMonth` (a one-month payment), whereas mortgage falls
	 * back to the full term. That difference exists in the PHP and is preserved.
	 */
	private parseExtraPayments(): ParsedExtraPayment[] {
		const raw = this.data['extra_payments_json'];
		const parsed = decodeJsonish<Record<string, unknown>>(raw);

		return parsed.map((p) => {
			const startMonth = Math.trunc(num(p?.['startMonth'] ?? 1));
			const endSource = p?.['endMonth'] ?? p?.['startMonth'] ?? 1;
			return {
				startMonth,
				endMonth: Math.trunc(num(endSource)),
				paymentAmount: num(p?.['paymentAmount'] ?? 0),
			};
		});
	}
}

export function computeFinance(
	input: Record<string, unknown>,
	includeSchedule = true,
): FinanceSummary {
	return FinanceCalculator.fromObject(input).summary(includeSchedule);
}
