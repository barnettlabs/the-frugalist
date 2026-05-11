/**
 * Lease Calculator - Comprehensive vehicle lease calculations
 * Based on the old calculator implementation with enhanced features
 */

import { LeaseFormData } from '@/types';

import { parseOrZero } from './formatters';

export class LeaseCalculator {
	data: LeaseFormData;

	constructor(data: LeaseFormData) {
		this.data = data;
	}

	// Calculate residual amount (MSRP × residual percentage)
	calculateResidualAmount() {
		const msrp = parseOrZero(this.data.msrp);
		const residualPercent = parseOrZero(this.data.residual_percent);

		return msrp * (residualPercent / 100);
	}

	// Calculate interest rate from money factor
	calculateInterestRate() {
		const moneyFactor = parseOrZero(this.data.money_factor);
		return moneyFactor * 2400;
	}

	// Calculate final dealer price (MSRP - dealer contribution - trade-in)
	calculateFinalDealerPrice() {
		const msrp = parseOrZero(this.data.msrp);
		const dealerContribution = parseOrZero(this.data.dealer_contribution);
		const tradeIn = parseOrZero(this.data.trade_in);

		return msrp - dealerContribution - tradeIn;
	}

	// Calculate gross capitalized cost (final dealer price + fees)
	calculateGrossCapCost() {
		const finalDealerPrice = this.calculateFinalDealerPrice();
		const docFee = parseOrZero(this.data.doc_fee);
		const acquisitionFee = parseOrZero(this.data.acquisition_fee);
		const miscFees = parseOrZero(this.data.misc_fees);

		return finalDealerPrice + docFee + acquisitionFee + miscFees;
	}

	// Calculate net capitalized cost (gross cap cost - down payment - lease cash)
	calculateNetCapCost() {
		const grossCapCost = this.calculateGrossCapCost();
		const leaseCash = parseOrZero(this.data.lease_cash);
		const downPayment = parseOrZero(this.data.down_payment);

		return grossCapCost - leaseCash - downPayment;
	}

	// Calculate principal amount (net cap cost - residual amount)
	calculatePrincipalAmount() {
		const netCapCost = this.calculateNetCapCost();
		const residualAmount = this.calculateResidualAmount();

		return netCapCost - residualAmount;
	}

	// Calculate monthly principal payment
	calculateMonthlyPrincipalPayment() {
		const pv = this.calculatePrincipalAmount();
		const n = parseOrZero(this.data.lease_term);
		const apr = this.calculateInterestRate();
		const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();

		if (apr <= 0 || n <= 0) return 0;

		const R = apr / 1200;
		const paymentPandI = (pv * R) / (1 - Math.pow(1 + R, n * -1));

		return paymentPandI + residualMonthlyInterestPayment;
	}

	// Calculate residual monthly interest payment
	calculateResidualMonthlyInterestPayment() {
		const residualAmount = this.calculateResidualAmount();
		const interestRate = this.calculateInterestRate();

		return (residualAmount * interestRate) / 100 / 12;
	}

	// Calculate total sales tax
	calculateTotalSalesTax() {
		const salesTaxMultiplier = parseOrZero(this.data.sales_tax_percent) / 100;

		const downPayment = parseOrZero(this.data.down_payment);
		const leaseCash = parseOrZero(this.data.lease_cash);
		const leaseTerm = parseOrZero(this.data.lease_term);
		const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
		const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();

		// Tax on rebates/incentives
		const taxOnRebates = leaseCash * salesTaxMultiplier;

		// Tax on down payment
		const taxOnDownPayment = downPayment * salesTaxMultiplier;

		// Tax on monthly payments
		const monthlyPaymentBeforeTax = monthlyPrincipalPayment + residualMonthlyInterestPayment;
		const taxOnMonthlyPayments = monthlyPaymentBeforeTax * salesTaxMultiplier * leaseTerm;

		return taxOnRebates + taxOnDownPayment + taxOnMonthlyPayments;
	}

	// Calculate monthly sales tax
	calculateMonthlySalesTax() {
		const totalSalesTax = this.calculateTotalSalesTax();
		const leaseTerm = parseOrZero(this.data.lease_term);

		return totalSalesTax / leaseTerm;
	}

	// Calculate final lease payment (principal + interest + tax)
	calculateLeasePayment() {
		const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
		const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();
		const monthlySalesTax = this.calculateMonthlySalesTax();

		return monthlyPrincipalPayment + residualMonthlyInterestPayment + monthlySalesTax;
	}

	// Calculate cash due at signing
	calculateCashDueAtSigning() {
		const downPayment = parseOrZero(this.data.down_payment);
		const leasePayment = this.calculateLeasePayment();

		return downPayment + leasePayment;
	}

	// Calculate total lease cost
	calculateTotalLeaseCost() {
		const leasePayment = this.calculateLeasePayment();
		const leaseTerm = parseOrZero(this.data.lease_term);
		const cashDueAtSigning = this.calculateCashDueAtSigning();

		return leasePayment * leaseTerm + cashDueAtSigning;
	}

	// Generate lease payment schedule
	generateLeaseSchedule() {
		const leaseTerm = parseOrZero(this.data.lease_term);
		const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
		const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();
		const monthlySalesTax = this.calculateMonthlySalesTax();
		const leasePayment = this.calculateLeasePayment();

		const schedule = [];
		let remainingPrincipal = this.calculatePrincipalAmount();

		for (let month = 1; month <= leaseTerm; month++) {
			const principalPayment = monthlyPrincipalPayment;
			const interestPayment = residualMonthlyInterestPayment;
			const taxPayment = monthlySalesTax;

			remainingPrincipal -= principalPayment;

			schedule.push({
				month,
				principalPayment,
				interestPayment,
				taxPayment,
				totalPayment: leasePayment,
				remainingPrincipal: Math.max(0, remainingPrincipal),
			});
		}

		return schedule;
	}

	// Get payment breakdown for charts
	getPaymentBreakdown() {
		const leaseTerm = parseOrZero(this.data.lease_term);
		const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
		const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();
		const monthlySalesTax = this.calculateMonthlySalesTax();

		return {
			principal: monthlyPrincipalPayment * leaseTerm,
			interest: residualMonthlyInterestPayment * leaseTerm,
			tax: monthlySalesTax * leaseTerm,
		};
	}

	// Get all calculated values as a summary
	getSummary() {
		const residualAmount = this.calculateResidualAmount();
		const interestRate = this.calculateInterestRate();
		const finalDealerPrice = this.calculateFinalDealerPrice();
		const grossCapCost = this.calculateGrossCapCost();
		const netCapCost = this.calculateNetCapCost();
		const principalAmount = this.calculatePrincipalAmount();
		const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
		const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();
		const totalSalesTax = this.calculateTotalSalesTax();
		const monthlySalesTax = this.calculateMonthlySalesTax();
		const leasePayment = this.calculateLeasePayment();
		const cashDueAtSigning = this.calculateCashDueAtSigning();
		const totalLeaseCost = this.calculateTotalLeaseCost();
		const paymentBreakdown = this.getPaymentBreakdown();
		const schedule = this.generateLeaseSchedule();

		return {
			residualAmount,
			interestRate,
			finalDealerPrice,
			grossCapCost,
			netCapCost,
			principalAmount,
			monthlyPrincipalPayment,
			residualMonthlyInterestPayment,
			totalSalesTax,
			monthlySalesTax,
			leasePayment,
			cashDueAtSigning,
			totalLeaseCost,
			paymentBreakdown,
			schedule,
		};
	}
}
