import { z } from 'zod';
import { num } from '../money.js';
import {
	decodeJsonish,
	extraExpensesJson,
	extraForMonth,
	extraPaymentsJson,
	looseNumber,
	type ParsedExtraPayment,
} from './shared.js';

/** Port of App\Services\Calculators\MortgageCalculator. */

export const mortgageInputSchema = z.object({
	property_value: looseNumber,
	down_payment: looseNumber,
	loan_term_years: looseNumber,
	interest_rate: looseNumber,
	annual_property_tax: looseNumber,
	annual_insurance: looseNumber,
	monthly_hoa: looseNumber,
	extra_payments_json: extraPaymentsJson,
	extra_expenses_json: extraExpensesJson,
});

export type MortgageInput = z.input<typeof mortgageInputSchema>;

export type ExtraExpenseItem = {
	label: string;
	amount: number;
	frequency: string;
	monthly: number;
};

export type ExtraExpensesBreakdown = {
	monthly: number;
	annual: number;
	items: ExtraExpenseItem[];
};

export type MortgageScheduleRow = {
	month: number;
	payment: number;
	extra_payment: number;
	escrow_payment: number;
	total_payment: number;
	principal_payment: number;
	interest_payment: number;
	remaining_balance: number;
};

export type MortgageAmortization = {
	schedule: MortgageScheduleRow[];
	total_interest: number;
	total_principal: number;
	total_extra: number;
	total_escrow: number;
	months_paid: number;
	months_saved: number;
};

export type MortgageAnnualRow = {
	year: number;
	start_month: number;
	end_month: number;
	payment: number;
	extra_payment: number;
	escrow_payment: number;
	total_payment: number;
	principal_payment: number;
	interest_payment: number;
	remaining_balance: number;
};

export class MortgageCalculator {
	private readonly data: Record<string, unknown>;

	constructor(data: Record<string, unknown>) {
		this.data = data;
	}

	static fromObject(data: Record<string, unknown>): MortgageCalculator {
		return new MortgageCalculator(data);
	}

	private n(key: string): number {
		return num(this.data[key]);
	}

	propertyValue(): number {
		return this.n('property_value');
	}

	downPayment(): number {
		return this.n('down_payment');
	}

	downPaymentPercent(): number {
		const pv = this.propertyValue();
		return pv <= 0 ? 0 : (this.downPayment() / pv) * 100;
	}

	principal(): number {
		return Math.max(0, this.propertyValue() - this.downPayment());
	}

	loanTermMonths(): number {
		return Math.trunc(this.n('loan_term_years') * 12);
	}

	monthlyPrincipalAndInterest(): number {
		const pv = this.principal();
		const n = this.loanTermMonths();
		const rate = this.n('interest_rate');

		if (pv <= 0 || n <= 0) return 0;
		if (rate <= 0) return pv / n;

		const r = rate / 100 / 12;
		return (pv * r) / (1 - Math.pow(1 + r, -n));
	}

	monthlyPropertyTax(): number {
		return this.n('annual_property_tax') / 12;
	}

	monthlyInsurance(): number {
		return this.n('annual_insurance') / 12;
	}

	monthlyHoa(): number {
		return this.n('monthly_hoa');
	}

	extraExpensesBreakdown(): ExtraExpensesBreakdown {
		const items = this.parseExtraExpenses();
		let monthly = 0;
		const detailed: ExtraExpenseItem[] = [];

		for (const item of items) {
			const perMonth = item.frequency === 'annual' ? item.amount / 12 : item.amount;
			monthly += perMonth;

			detailed.push({
				label: item.label,
				amount: item.amount,
				frequency: item.frequency,
				monthly: perMonth,
			});
		}

		return { monthly, annual: monthly * 12, items: detailed };
	}

	monthlyExtraExpenses(): number {
		return this.extraExpensesBreakdown().monthly;
	}

	monthlyEscrow(): number {
		return (
			this.monthlyPropertyTax() +
			this.monthlyInsurance() +
			this.monthlyHoa() +
			this.monthlyExtraExpenses()
		);
	}

	monthlyPaymentTotal(): number {
		return this.monthlyPrincipalAndInterest() + this.monthlyEscrow();
	}

	amortization(withExtraPayments = false): MortgageAmortization | null {
		const principal = this.principal();
		const rate = this.n('interest_rate');
		const term = this.loanTermMonths();
		const monthlyPi = this.monthlyPrincipalAndInterest();
		const escrow = this.monthlyEscrow();

		if (principal <= 0 || term <= 0) return null;

		const schedule: MortgageScheduleRow[] = [];
		let remaining = principal;
		let totalInterest = 0;
		let totalPrincipalPaid = 0;
		let totalExtra = 0;
		let totalEscrow = 0;
		const extras = this.parseExtraPayments();

		for (let month = 1; month <= term && remaining > 0; month++) {
			const interestPayment = rate > 0 ? (remaining * rate) / 100 / 12 : 0;
			let principalPayment = monthlyPi - interestPayment;

			let extraPayment = 0;
			if (withExtraPayments && extras.length > 0) {
				extraPayment = extraForMonth(month, extras);
			}

			// Final-month trim. Unlike the finance calculator, which zeroes the
			// extra outright, this reduces the extra first and only then clamps
			// the scheduled principal - so a large final extra does not vanish.
			if (principalPayment + extraPayment > remaining) {
				const overage = principalPayment + extraPayment - remaining;
				if (extraPayment >= overage) {
					extraPayment -= overage;
				} else {
					principalPayment = Math.max(0, remaining - extraPayment);
					if (principalPayment + extraPayment > remaining) {
						extraPayment = Math.max(0, remaining - principalPayment);
					}
				}
			}

			const totalPayment = monthlyPi + extraPayment + escrow;
			remaining -= principalPayment + extraPayment;
			totalInterest += interestPayment;
			totalPrincipalPaid += principalPayment + extraPayment;
			totalExtra += extraPayment;
			totalEscrow += escrow;

			schedule.push({
				month,
				payment: monthlyPi,
				extra_payment: extraPayment,
				escrow_payment: escrow,
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
			total_principal: totalPrincipalPaid,
			total_extra: totalExtra,
			total_escrow: totalEscrow,
			months_paid: schedule.length,
			months_saved: Math.max(0, term - schedule.length),
		};
	}

	annualAmortization(withExtraPayments = false): MortgageAnnualRow[] | null {
		const amort = this.amortization(withExtraPayments);
		if (!amort) return null;

		const years = new Map<number, MortgageAnnualRow>();

		for (const row of amort.schedule) {
			const year = Math.ceil(row.month / 12);
			let bucket = years.get(year);

			if (!bucket) {
				bucket = {
					year,
					start_month: row.month,
					end_month: row.month,
					payment: 0,
					extra_payment: 0,
					escrow_payment: 0,
					total_payment: 0,
					principal_payment: 0,
					interest_payment: 0,
					remaining_balance: row.remaining_balance,
				};
				years.set(year, bucket);
			}

			bucket.end_month = row.month;
			bucket.payment += row.payment;
			bucket.extra_payment += row.extra_payment;
			bucket.escrow_payment += row.escrow_payment;
			bucket.total_payment += row.total_payment;
			bucket.principal_payment += row.principal_payment;
			bucket.interest_payment += row.interest_payment;
			bucket.remaining_balance = row.remaining_balance;
		}

		return [...years.values()];
	}

	summary(includeSchedule = true) {
		const amort = includeSchedule ? this.amortization(true) : null;
		const annual = includeSchedule ? this.annualAmortization(true) : null;

		const monthlyPi = this.monthlyPrincipalAndInterest();
		const escrow = this.monthlyEscrow();
		const termMonths = this.loanTermMonths();

		return {
			property_value: this.propertyValue(),
			down_payment: this.downPayment(),
			down_payment_percent: this.downPaymentPercent(),
			principal: this.principal(),
			loan_term_months: termMonths,

			monthly_principal_interest: monthlyPi,
			monthly_property_tax: this.monthlyPropertyTax(),
			monthly_insurance: this.monthlyInsurance(),
			monthly_hoa: this.monthlyHoa(),
			monthly_extra_expenses: this.monthlyExtraExpenses(),
			monthly_escrow: escrow,
			monthly_payment_total: monthlyPi + escrow,

			total_interest:
				amort?.total_interest ?? Math.max(0, monthlyPi * termMonths - this.principal()),
			total_principal: amort?.total_principal ?? this.principal(),
			total_extra_payments: amort?.total_extra ?? 0,
			total_escrow: amort?.total_escrow ?? escrow * termMonths,
			payments_total: (amort?.total_interest ?? 0) + (amort?.total_principal ?? this.principal()),
			grand_total:
				this.downPayment() +
				(amort?.total_interest ?? 0) +
				(amort?.total_principal ?? this.principal()) +
				(amort?.total_escrow ?? escrow * termMonths),

			months_paid: amort?.months_paid ?? termMonths,
			months_saved: amort?.months_saved ?? 0,

			extra_expenses: this.extraExpensesBreakdown(),

			amortization: amort,
			annual_amortization: annual,
		};
	}

	/**
	 * Unlike finance, a missing or empty `endMonth` here means "to the end of the
	 * term", and `startMonth` is floored at 1. Both differences are in the PHP.
	 */
	private parseExtraPayments(): ParsedExtraPayment[] {
		const parsed = decodeJsonish<Record<string, unknown>>(this.data['extra_payments_json']);
		const term = this.loanTermMonths();

		return parsed.map((p) => {
			const start = Math.trunc(num(p?.['startMonth'] ?? 1));
			const endRaw = p?.['endMonth'] ?? null;
			const end =
				endRaw === null || endRaw === undefined || endRaw === ''
					? term > 0
						? term
						: start
					: Math.trunc(num(endRaw));

			return {
				startMonth: Math.max(1, start),
				endMonth: end,
				paymentAmount: num(p?.['paymentAmount'] ?? 0),
			};
		});
	}

	private parseExtraExpenses(): { label: string; amount: number; frequency: string }[] {
		const parsed = decodeJsonish<Record<string, unknown>>(this.data['extra_expenses_json']);

		return parsed.map((e) => {
			const rawFreq = String(e?.['frequency'] ?? 'monthly').toLowerCase();
			const frequency = rawFreq === 'monthly' || rawFreq === 'annual' ? rawFreq : 'monthly';

			return {
				label: String(e?.['label'] ?? 'Expense'),
				amount: num(e?.['amount'] ?? 0),
				frequency,
			};
		});
	}
}

export type MortgageSummary = ReturnType<MortgageCalculator['summary']>;

export function computeMortgage(input: Record<string, unknown>, includeSchedule = true) {
	return MortgageCalculator.fromObject(input).summary(includeSchedule);
}
