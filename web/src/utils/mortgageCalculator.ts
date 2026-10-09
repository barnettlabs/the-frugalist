import { MortgageFormData } from '@/types';

import { parseOrZero } from './formatters';

type Anyable = Partial<MortgageFormData> & Record<string, unknown>;

export class MortgageCalculator {
	data: Anyable;

	constructor(data: Anyable) {
		this.data = data;
	}

	propertyValue() {
		return parseOrZero(this.data.property_value as any);
	}

	downPayment() {
		return parseOrZero(this.data.down_payment as any);
	}

	downPaymentPercent() {
		const pv = this.propertyValue();
		return pv <= 0 ? 0 : (this.downPayment() / pv) * 100;
	}

	principal() {
		return Math.max(0, this.propertyValue() - this.downPayment());
	}

	loanTermMonths() {
		return Math.floor(parseOrZero(this.data.loan_term_years as any) * 12);
	}

	monthlyPrincipalAndInterest() {
		const pv = this.principal();
		const n = this.loanTermMonths();
		const rate = parseOrZero(this.data.interest_rate as any);

		if (pv <= 0 || n <= 0) return 0;
		if (rate <= 0) return pv / n;

		const r = rate / 100 / 12;
		return (pv * r) / (1 - Math.pow(1 + r, -n));
	}

	monthlyPropertyTax() {
		return parseOrZero(this.data.annual_property_tax as any) / 12;
	}

	monthlyInsurance() {
		return parseOrZero(this.data.annual_insurance as any) / 12;
	}

	monthlyHoa() {
		return parseOrZero(this.data.monthly_hoa as any);
	}

	parseExtraExpenses() {
		try {
			const raw = (this.data as any).extra_expenses_json;
			if (!raw) return [] as Array<{ label: string; amount: number; frequency: 'monthly' | 'annual' }>;
			const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
			return Array.isArray(parsed)
				? parsed.map((e: any) => ({
						label: String(e.label ?? 'Expense'),
						amount: parseOrZero(e.amount),
						frequency: e.frequency === 'annual' ? 'annual' : 'monthly',
					}))
				: [];
		} catch {
			return [];
		}
	}

	monthlyExtraExpenses() {
		return this.parseExtraExpenses().reduce((sum, e) => sum + (e.frequency === 'annual' ? e.amount / 12 : e.amount), 0);
	}

	monthlyEscrow() {
		return this.monthlyPropertyTax() + this.monthlyInsurance() + this.monthlyHoa() + this.monthlyExtraExpenses();
	}

	monthlyPaymentTotal() {
		return this.monthlyPrincipalAndInterest() + this.monthlyEscrow();
	}

	parseExtraPayments() {
		try {
			const raw = (this.data as any).extra_payments_json;
			if (!raw) return [];
			const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	private extraForMonth(month: number, extras: any[]) {
		const term = this.loanTermMonths();
		let total = 0;
		for (const e of extras) {
			const start = Math.max(1, parseInt(String(e.startMonth)) || 1);
			const endRaw = e.endMonth;
			const end = endRaw === '' || endRaw === null || endRaw === undefined ? term : parseInt(String(endRaw)) || start;
			const amount = parseOrZero(e.paymentAmount);
			if (month >= start && month <= end) total += amount;
		}
		return total;
	}

	calculateAmortization(withExtraPayments = false) {
		const principal = this.principal();
		const term = this.loanTermMonths();
		const rate = parseOrZero(this.data.interest_rate as any);
		const monthlyPi = this.monthlyPrincipalAndInterest();
		const escrow = this.monthlyEscrow();

		if (principal <= 0 || term <= 0) return null;

		const schedule: any[] = [];
		let remaining = principal;
		let totalInterest = 0;
		let totalPrincipalPaid = 0;
		let totalExtra = 0;
		let totalEscrow = 0;
		const extras = this.parseExtraPayments();

		for (let month = 1; month <= term && remaining > 0; month++) {
			const interestPayment = rate > 0 ? (remaining * rate) / 100 / 12 : 0;

			// Scheduled principal first, then any extra up to what is still owed, so
			// the final month charges only interest plus the remaining balance - see
			// packages/contracts mortgage.ts.
			const principalPayment = Math.min(monthlyPi - interestPayment, remaining);
			const extraPayment =
				withExtraPayments && extras.length > 0
					? Math.max(0, Math.min(this.extraForMonth(month, extras), remaining - principalPayment))
					: 0;

			const payment = interestPayment + principalPayment;
			const totalPayment = payment + extraPayment + escrow;
			remaining -= principalPayment + extraPayment;
			totalInterest += interestPayment;
			totalPrincipalPaid += principalPayment + extraPayment;
			totalExtra += extraPayment;
			totalEscrow += escrow;

			schedule.push({
				month,
				payment,
				extraPayment,
				escrowPayment: escrow,
				totalPayment,
				principalPayment: principalPayment + extraPayment,
				interestPayment,
				remainingBalance: Math.max(0, remaining),
			});

			if (remaining <= 0) break;
		}

		return {
			schedule,
			totalInterest,
			totalPrincipal: totalPrincipalPaid,
			totalExtra,
			totalEscrow,
			monthsPaid: schedule.length,
			monthsSaved: Math.max(0, term - schedule.length),
		};
	}

	calculateAnnualAmortization(withExtraPayments = false) {
		const amort = this.calculateAmortization(withExtraPayments);
		if (!amort) return null;

		const years: Record<number, any> = {};
		for (const row of amort.schedule) {
			const year = Math.ceil(row.month / 12);
			years[year] ??= {
				year,
				startMonth: row.month,
				endMonth: row.month,
				payment: 0,
				extraPayment: 0,
				escrowPayment: 0,
				totalPayment: 0,
				principalPayment: 0,
				interestPayment: 0,
				remainingBalance: row.remainingBalance,
			};
			const y = years[year];
			y.endMonth = row.month;
			y.payment += row.payment;
			y.extraPayment += row.extraPayment;
			y.escrowPayment += row.escrowPayment;
			y.totalPayment += row.totalPayment;
			y.principalPayment += row.principalPayment;
			y.interestPayment += row.interestPayment;
			y.remainingBalance = row.remainingBalance;
		}

		return Object.values(years);
	}

	getPaymentBreakdown() {
		const amort = this.calculateAmortization(true);
		if (!amort || amort.schedule.length === 0) return null;
		return {
			principal: amort.totalPrincipal - amort.totalExtra,
			interest: amort.totalInterest,
			extraPayments: amort.totalExtra,
			escrow: amort.totalEscrow,
		};
	}

	getSummary() {
		const amort = this.calculateAmortization(true);
		const monthlyPi = this.monthlyPrincipalAndInterest();
		const escrow = this.monthlyEscrow();
		const termMonths = this.loanTermMonths();

		// Closed-form figures when there is no schedule, so the totals never leave
		// interest out - see packages/contracts mortgage.ts.
		const totalInterest = amort?.totalInterest ?? Math.max(0, monthlyPi * termMonths - this.principal());
		const totalPrincipal = amort?.totalPrincipal ?? this.principal();
		const totalEscrow = amort?.totalEscrow ?? escrow * termMonths;

		return {
			propertyValue: this.propertyValue(),
			downPayment: this.downPayment(),
			downPaymentPercent: this.downPaymentPercent(),
			principal: this.principal(),
			loanTermMonths: this.loanTermMonths(),
			monthlyPrincipalInterest: monthlyPi,
			monthlyPropertyTax: this.monthlyPropertyTax(),
			monthlyInsurance: this.monthlyInsurance(),
			monthlyHoa: this.monthlyHoa(),
			monthlyExtraExpenses: this.monthlyExtraExpenses(),
			monthlyEscrow: escrow,
			monthlyPaymentTotal: monthlyPi + escrow,
			totalInterest,
			totalPrincipal,
			totalExtraPayments: amort?.totalExtra ?? 0,
			totalEscrow,
			paymentsTotal: totalInterest + totalPrincipal,
			grandTotal: this.downPayment() + totalInterest + totalPrincipal + totalEscrow,
			monthsPaid: amort?.monthsPaid ?? this.loanTermMonths(),
			monthsSaved: amort?.monthsSaved ?? 0,
			amortization: amort,
		};
	}
}
