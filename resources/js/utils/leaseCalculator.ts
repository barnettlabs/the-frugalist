/**
 * Lease Calculator - Comprehensive vehicle lease calculations
 * Based on the old calculator implementation with enhanced features
 */

export class LeaseCalculator {
    constructor(data) {
        this.data = data;
    }

    // Parse value or return zero
    parseOrZero(value) {
        const parsed = parseFloat(value) || 0;
        return isNaN(parsed) ? 0 : parsed;
    }

    // Calculate residual amount (MSRP × residual percentage)
    calculateResidualAmount() {
        const msrp = this.parseOrZero(this.data.msrp);
        const residualPercent = this.parseOrZero(this.data.residual_percent);
        
        return msrp * (residualPercent / 100);
    }

    // Calculate interest rate from money factor
    calculateInterestRate() {
        const moneyFactor = this.parseOrZero(this.data.money_factor);
        return moneyFactor * 2400;
    }

    // Calculate final dealer price (MSRP - dealer contribution - trade-in)
    calculateFinalDealerPrice() {
        const msrp = this.parseOrZero(this.data.msrp);
        const dealerContribution = this.parseOrZero(this.data.dealer_contribution);
        const tradeIn = this.parseOrZero(this.data.trade_in);
        
        return msrp - dealerContribution - tradeIn;
    }

    // Calculate gross capitalized cost (final dealer price + fees)
    calculateGrossCapCost() {
        const finalDealerPrice = this.calculateFinalDealerPrice();
        const docFee = this.parseOrZero(this.data.doc_fee);
        const acquisitionFee = this.parseOrZero(this.data.acquisition_fee);
        const miscFees = this.parseOrZero(this.data.misc_fees);
        
        return finalDealerPrice + docFee + acquisitionFee + miscFees;
    }

    // Calculate net capitalized cost (gross cap cost - down payment - lease cash)
    calculateNetCapCost() {
        const grossCapCost = this.calculateGrossCapCost();
        const downPayment = this.parseOrZero(this.data.down_payment);
        const leaseCash = this.parseOrZero(this.data.lease_cash);
        
        return grossCapCost - downPayment - leaseCash;
    }

    // Calculate principal amount (net cap cost - residual amount)
    calculatePrincipalAmount() {
        const netCapCost = this.calculateNetCapCost();
        const residualAmount = this.calculateResidualAmount();
        
        return netCapCost - residualAmount;
    }

    // Calculate monthly principal payment
    calculateMonthlyPrincipalPayment() {
        const principalAmount = this.calculatePrincipalAmount();
        const leaseTerm = this.parseOrZero(this.data.lease_term);
        
        if (leaseTerm === 0) return 0;
        
        return principalAmount / leaseTerm;
    }

    // Calculate residual monthly interest payment
    calculateResidualMonthlyInterestPayment() {
        const netCapCost = this.calculateNetCapCost();
        const residualAmount = this.calculateResidualAmount();
        const moneyFactor = this.parseOrZero(this.data.money_factor);
        
        return (netCapCost + residualAmount) * moneyFactor;
    }

    // Calculate total sales tax
    calculateTotalSalesTax() {
        const downPayment = this.parseOrZero(this.data.down_payment);
        const leaseCash = this.parseOrZero(this.data.lease_cash);
        const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
        const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();
        const leaseTerm = this.parseOrZero(this.data.lease_term);
        const salesTaxPercent = this.parseOrZero(this.data.sales_tax_percent);
        
        // Tax on rebates/incentives
        const taxOnRebates = (leaseCash) * (salesTaxPercent / 100);
        
        // Tax on down payment
        const taxOnDownPayment = downPayment * (salesTaxPercent / 100);
        
        // Tax on monthly payments
        const monthlyPaymentBeforeTax = monthlyPrincipalPayment + residualMonthlyInterestPayment;
        const taxOnMonthlyPayments = monthlyPaymentBeforeTax * (salesTaxPercent / 100) * leaseTerm;
        
        return taxOnRebates + taxOnDownPayment + taxOnMonthlyPayments;
    }

    // Calculate monthly sales tax
    calculateMonthlySalesTax() {
        const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
        const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();
        const salesTaxPercent = this.parseOrZero(this.data.sales_tax_percent);
        
        const monthlyPaymentBeforeTax = monthlyPrincipalPayment + residualMonthlyInterestPayment;
        return monthlyPaymentBeforeTax * (salesTaxPercent / 100);
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
        const downPayment = this.parseOrZero(this.data.down_payment);
        const docFee = this.parseOrZero(this.data.doc_fee);
        const acquisitionFee = this.parseOrZero(this.data.acquisition_fee);
        const leasePayment = this.calculateLeasePayment();
        const downPaymentTax = downPayment * (this.parseOrZero(this.data.sales_tax_percent) / 100);
        
        return downPayment + docFee + acquisitionFee + leasePayment + downPaymentTax;
    }

    // Calculate total lease cost
    calculateTotalLeaseCost() {
        const leasePayment = this.calculateLeasePayment();
        const leaseTerm = this.parseOrZero(this.data.lease_term);
        const cashDueAtSigning = this.calculateCashDueAtSigning();
        
        return (leasePayment * leaseTerm) + cashDueAtSigning;
    }

    // Generate lease payment schedule
    generateLeaseSchedule() {
        const leaseTerm = this.parseOrZero(this.data.lease_term);
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
                remainingPrincipal: Math.max(0, remainingPrincipal)
            });
        }
        
        return schedule;
    }

    // Get payment breakdown for charts
    getPaymentBreakdown() {
        const leaseTerm = this.parseOrZero(this.data.lease_term);
        const monthlyPrincipalPayment = this.calculateMonthlyPrincipalPayment();
        const residualMonthlyInterestPayment = this.calculateResidualMonthlyInterestPayment();
        const monthlySalesTax = this.calculateMonthlySalesTax();
        
        return {
            principal: monthlyPrincipalPayment * leaseTerm,
            interest: residualMonthlyInterestPayment * leaseTerm,
            tax: monthlySalesTax * leaseTerm
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
            paymentBreakdown: this.getPaymentBreakdown(),
            schedule: this.generateLeaseSchedule()
        };
    }
}