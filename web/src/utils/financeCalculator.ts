/**
 * Finance Calculator - Comprehensive vehicle finance calculations
 * Based on the old calculator implementation with enhanced features
 */

import { FinanceFormData } from '@/types';

import { parseOrZero } from './formatters';

export class FinanceCalculator {
	data: FinanceFormData;

	constructor(data: FinanceFormData) {
		this.data = data;
	}

	// Calculate purchase price (MSRP - discounts - rebates)
	calculatePurchasePrice() {
		const msrp = parseOrZero(this.data.msrp);
		const discounts = parseOrZero(this.data.discounts);
		const rebates = parseOrZero(this.data.rebates);

		return msrp - discounts - rebates;
	}

	calculateTaxableAmount() {
		const msrp = parseOrZero(this.data.msrp);
		const discounts = parseOrZero(this.data.discounts);

		return msrp - discounts;
	}

	// Calculate sales tax amount
	calculateSalesTaxAmount() {
		const taxableAmount = this.calculateTaxableAmount();
		const salesTaxPercent = parseOrZero(this.data.sales_tax_percent);

		return taxableAmount * (salesTaxPercent / 100);
	}

	// Calculate loan amount
	calculateLoanAmount() {
		const purchasePrice = this.calculatePurchasePrice();
		const fees = parseOrZero(this.data.fees);
		const salesTaxAmount = this.calculateSalesTaxAmount();
		const downPayment = parseOrZero(this.data.down_payment);

		return purchasePrice + fees + salesTaxAmount - downPayment;
	}

	// Calculate monthly payment using standard loan formula
	calculateMonthlyPayment() {
		const loanAmount = this.calculateLoanAmount();
		const interestRate = parseOrZero(this.data.interest_rate);
		const financeTerm = parseOrZero(this.data.finance_term);

		if (loanAmount <= 0 || financeTerm <= 0) {
			return 0;
		}

		const R = interestRate / 100 / 12;
		const n = financeTerm;
		const pv = loanAmount;

		if (!interestRate) {
			return pv / n;
		}

		const payment = (pv * R) / (1 - Math.pow(1 + R, n * -1));

		return payment;
	}

	// Calculate total interest amount
	calculateInterestAmount() {
		const paymentsTotal = this.calculatePaymentsTotal();
		const loanAmount = this.calculateLoanAmount();

		return paymentsTotal - loanAmount;
	}

	// Calculate total of all payments
	calculatePaymentsTotal() {
		const monthlyPayment = this.calculateMonthlyPayment();
		const financeTerm = parseOrZero(this.data.finance_term);

		return monthlyPayment * financeTerm;
	}

	calculateGrandTotal() {
		const paymentsTotal = this.calculatePaymentsTotal();
		const downPayment = parseOrZero(this.data.down_payment);

		return paymentsTotal + downPayment;
	}

	calculateMonthlyInterestAmount(currentBalance: number) {
		const interestRate = parseOrZero(this.data.interest_rate);
		const interestAmount = (currentBalance * interestRate) / 100 / 12;

		return interestAmount;
	}

	calculateMonthlyPrincipalAmount(monthlyInterestAmount: number, totalPaidForMonth: number) {
		const principalAmount = totalPaidForMonth - monthlyInterestAmount;

		return principalAmount;
	}

	// Generate amortization schedule
	calculateAmortization(withExtraPayments = false) {
		const loanAmount = this.calculateLoanAmount();
		const interestRate = parseOrZero(this.data.interest_rate);
		const financeTerm = parseOrZero(this.data.finance_term);
		const monthlyPayment = this.calculateMonthlyPayment();

		if (loanAmount <= 0 || interestRate <= 0 || financeTerm <= 0) {
			return null;
		}

		const schedule = [];
		let remainingBalance = loanAmount;
		let totalInterest = 0;
		let totalPrincipal = 0;

		// Parse extra payments if provided
		const extraPayments = this.parseExtraPayments();

		for (let month = 1; month <= financeTerm && remainingBalance > 0; month++) {
			const interestPayment = this.calculateMonthlyInterestAmount(remainingBalance);
			let principalPayment = this.calculateMonthlyPrincipalAmount(interestPayment, monthlyPayment);

			// Add extra payment if applicable
			let extraPayment = 0;
			if (withExtraPayments && extraPayments.length > 0) {
				extraPayment = this.getExtraPaymentForMonth(month, extraPayments);
			}

			// Ensure we don't pay more than remaining balance
			if (principalPayment + extraPayment > remainingBalance) {
				principalPayment = remainingBalance;
				extraPayment = 0;
			}

			const totalPayment = monthlyPayment + extraPayment;
			remainingBalance -= principalPayment + extraPayment;
			totalInterest += interestPayment;
			totalPrincipal += principalPayment + extraPayment;

			schedule.push({
				month,
				payment: monthlyPayment,
				extraPayment,
				totalPayment,
				principalPayment: principalPayment + extraPayment,
				interestPayment,
				remainingBalance: Math.max(0, remainingBalance),
			});

			if (remainingBalance <= 0) break;
		}

		return {
			schedule,
			totalInterest,
			totalPrincipal,
			monthsPaid: schedule.length,
			monthsSaved: Math.max(0, financeTerm - schedule.length),
		};
	}

	// Parse extra payments from JSON
	parseExtraPayments() {
		try {
			const extraPaymentsJson = this.data.extra_payments_json;
			if (!extraPaymentsJson) return [];

			const parsed = typeof extraPaymentsJson === 'string' ? JSON.parse(extraPaymentsJson) : extraPaymentsJson;

			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			console.error('Error parsing extra payments:', error);
			return [];
		}
	}

	// Get extra payment amount for a specific month
	getExtraPaymentForMonth(month: number, extraPayments: any[]) {
		let totalExtra = 0;

		for (const payment of extraPayments) {
			const startMonth = parseInt(payment.startMonth) || 1;
			const endMonth = parseInt(payment.endMonth) || startMonth;
			const amount = parseOrZero(payment.paymentAmount);

			if (month >= startMonth && month <= endMonth) {
				totalExtra += amount;
			}
		}

		return totalExtra;
	}

	// Get payment breakdown for charts
	getPaymentBreakdown() {
		const amortization = this.calculateAmortization(true);
		const schedule = amortization?.schedule;

		if (!schedule || schedule.length === 0) return null;

		const breakdown = {
			principal: amortization.totalPrincipal,
			interest: amortization.totalInterest,
			extraPayments: schedule.reduce((sum, payment) => sum + payment.extraPayment, 0),
		};

		return breakdown;
	}

	// Get chart data for line chart
	getChartData() {
		const amortization = this.calculateAmortization(true);
		const schedule = amortization?.schedule;

		if (!schedule || schedule.length === 0) return null;

		return {
			labels: schedule.map(payment => `Month ${payment.month}`),
			datasets: [
				{
					label: 'Principal',
					data: schedule.map(payment => payment.principalPayment - payment.extraPayment),
					borderColor: 'rgb(59, 130, 246)',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					fill: true,
				},
				{
					label: 'Interest',
					data: schedule.map(payment => payment.interestPayment),
					borderColor: 'rgb(239, 68, 68)',
					backgroundColor: 'rgba(239, 68, 68, 0.1)',
					fill: true,
				},
				{
					label: 'Extra Payments',
					data: schedule.map(payment => payment.extraPayment),
					borderColor: 'rgb(34, 197, 94)',
					backgroundColor: 'rgba(34, 197, 94, 0.1)',
					fill: true,
				},
			],
		};
	}

	// Get all calculated values as a summary
	getSummary() {
		const purchasePrice = this.calculatePurchasePrice();
		const salesTaxAmount = this.calculateSalesTaxAmount();
		const loanAmount = this.calculateLoanAmount();
		const monthlyPayment = this.calculateMonthlyPayment();
		const interestAmount = this.calculateInterestAmount();
		const paymentsTotal = this.calculatePaymentsTotal();
		const amortization = this.calculateAmortization(true);
		const paymentBreakdown = this.getPaymentBreakdown();

		return {
			purchasePrice,
			salesTaxAmount,
			loanAmount,
			monthlyPayment,
			interestAmount,
			paymentsTotal,
			amortization,
			paymentBreakdown,
		};
	}
}
