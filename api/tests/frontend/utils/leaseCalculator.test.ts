import { describe, it, expect } from 'vitest'
import { LeaseCalculator } from '@/utils/leaseCalculator'
import { VehicleType, type LeaseFormData } from '@/types'

describe('LeaseCalculator', () => {
  const mockLeaseData: LeaseFormData = {
    msrp: 45000,
    dealer_contribution: 1000,
    trade_in: 5000,
    doc_fee: 500,
    acquisition_fee: 800,
    misc_fees: 200,
    lease_cash: 2000,
    down_payment: 3000,
    money_factor: 0.00125,
    sales_tax_percent: 9.25,
    residual_percent: 60.0,
    lease_term: 36,
    sheet_name: '',
    sales_consultant: '',
    dealership_name: '',
    vehicle_type: VehicleType.CAR,
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_trim: '',
    start_date: '',
    contact_email: '',
    contact_phone: '',
    notes: ''
  }

  describe('Basic Calculations', () => {
    it('should calculate residual amount correctly', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const residualAmount = calculator.calculateResidualAmount()

      // MSRP (45000) * residual% (60%) = 27000
      expect(residualAmount).toBe(27000)
    })

    it('should convert money factor to interest rate', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const interestRate = calculator.calculateInterestRate()

      // Money factor (0.00125) * 2400 = 3.0%
      expect(interestRate).toBe(3.0)
    })

    it('should calculate final dealer price correctly', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const finalDealerPrice = calculator.calculateFinalDealerPrice()

      // MSRP (45000) - dealer contribution (1000) - trade-in (5000) = 39000
      expect(finalDealerPrice).toBe(39000)
    })

    it('should calculate gross cap cost correctly', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const grossCapCost = calculator.calculateGrossCapCost()

      // Final dealer price (39000) + doc fee (500) + acquisition fee (800) + misc fees (200) = 40500
      expect(grossCapCost).toBe(40500)
    })

    it('should calculate net cap cost correctly', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const netCapCost = calculator.calculateNetCapCost()

      // Gross cap cost (40500) - lease cash (2000) - down payment (3000) = 35500
      expect(netCapCost).toBe(35500)
    })

    it('should calculate principal amount correctly', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const principalAmount = calculator.calculatePrincipalAmount()

      // Net cap cost (35500) - residual amount (27000) = 8500
      expect(principalAmount).toBe(8500)
    })
  })

  describe('Payment Calculations', () => {
    it('should calculate monthly principal payment', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const monthlyPrincipalPayment = calculator.calculateMonthlyPrincipalPayment()

      // Should be a reasonable lease payment amount
      expect(monthlyPrincipalPayment).toBeGreaterThan(250)
      expect(monthlyPrincipalPayment).toBeLessThan(400)
    })

    it('should calculate residual monthly interest payment', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const residualInterestPayment = calculator.calculateResidualMonthlyInterestPayment()

      // Residual amount (27000) * interest rate (3%) / 12 = 67.5
      expect(residualInterestPayment).toBeCloseTo(67.5, 1)
    })

    it('should calculate monthly sales tax', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const monthlySalesTax = calculator.calculateMonthlySalesTax()

      // Should be positive and reasonable
      expect(monthlySalesTax).toBeGreaterThan(0)
      expect(monthlySalesTax).toBeLessThan(100)
    })

    it('should calculate final lease payment', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const leasePayment = calculator.calculateLeasePayment()

      // Should be sum of principal + interest + tax
      const principalPayment = calculator.calculateMonthlyPrincipalPayment()
      const interestPayment = calculator.calculateResidualMonthlyInterestPayment()
      const taxPayment = calculator.calculateMonthlySalesTax()

      expect(leasePayment).toBeCloseTo(principalPayment + interestPayment + taxPayment, 2)
    })

    it('should calculate cash due at signing', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const cashDue = calculator.calculateCashDueAtSigning()
      const leasePayment = calculator.calculateLeasePayment()

      // Down payment (3000) + first month payment
      expect(cashDue).toBeCloseTo(3000 + leasePayment, 2)
    })

    it('should calculate total lease cost', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const totalCost = calculator.calculateTotalLeaseCost()
      const leasePayment = calculator.calculateLeasePayment()
      const cashDue = calculator.calculateCashDueAtSigning()

      // (Monthly payment * term) + cash due at signing
      const expected = (leasePayment * 36) + cashDue
      expect(totalCost).toBeCloseTo(expected, 2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero money factor', () => {
      const zeroFactorData = { ...mockLeaseData, money_factor: 0 }
      const calculator = new LeaseCalculator(zeroFactorData)
      const interestRate = calculator.calculateInterestRate()

      expect(interestRate).toBe(0)
    })

    it('should handle 100% residual', () => {
      const highResidualData = { ...mockLeaseData, residual_percent: 100 }
      const calculator = new LeaseCalculator(highResidualData)
      const principalAmount = calculator.calculatePrincipalAmount()

      // Should be negative (net cap cost - full MSRP)
      expect(principalAmount).toBeLessThan(0)
    })

    it('should handle zero lease term', () => {
      const zeroTermData = { ...mockLeaseData, lease_term: 0 }
      const calculator = new LeaseCalculator(zeroTermData)
      const monthlyPayment = calculator.calculateMonthlyPrincipalPayment()

      expect(monthlyPayment).toBe(0)
    })

    it('should handle string inputs', () => {
      const stringData = {
        ...mockLeaseData,
        msrp: '45000' as any,
        money_factor: '0.00125' as any
      }
      const calculator = new LeaseCalculator(stringData)
      const residualAmount = calculator.calculateResidualAmount()

      expect(residualAmount).toBe(27000)
    })
  })

  describe('Lease Schedule Generation', () => {
    it('should generate complete lease schedule', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const schedule = calculator.generateLeaseSchedule()

      expect(schedule).toHaveLength(36)
      expect(schedule[0].month).toBe(1)
      expect(schedule[35].month).toBe(36)
    })

    it('should have consistent payment amounts', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const schedule = calculator.generateLeaseSchedule()
      const leasePayment = calculator.calculateLeasePayment()

      // All payments should be the same in a lease
      schedule.forEach(payment => {
        expect(payment.totalPayment).toBeCloseTo(leasePayment, 2)
      })
    })

    it('should have decreasing remaining principal', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const schedule = calculator.generateLeaseSchedule()

      expect(schedule[0].remainingPrincipal).toBeGreaterThan(schedule[17].remainingPrincipal)
      expect(schedule[17].remainingPrincipal).toBeGreaterThan(schedule[35].remainingPrincipal)
      expect(schedule[35].remainingPrincipal).toBeCloseTo(0, 1)
    })
  })

  describe('Payment Breakdown and Analysis', () => {
    it('should provide payment breakdown', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const breakdown = calculator.getPaymentBreakdown()

      expect(breakdown).toHaveProperty('principal')
      expect(breakdown).toHaveProperty('interest')
      expect(breakdown).toHaveProperty('tax')

      expect(breakdown.principal).toBeGreaterThan(0)
      expect(breakdown.interest).toBeGreaterThan(0)
      expect(breakdown.tax).toBeGreaterThan(0)
    })

    it('should provide complete summary', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const summary = calculator.getSummary()

      expect(summary).toHaveProperty('residualAmount')
      expect(summary).toHaveProperty('interestRate')
      expect(summary).toHaveProperty('leasePayment')
      expect(summary).toHaveProperty('cashDueAtSigning')
      expect(summary).toHaveProperty('totalLeaseCost')
      expect(summary).toHaveProperty('paymentBreakdown')
      expect(summary).toHaveProperty('schedule')
    })
  })

  describe('Money Factor Conversions', () => {
    it('should convert common money factors correctly', () => {
      const testCases = [
        { moneyFactor: 0.001, expectedAPR: 2.4 },
        { moneyFactor: 0.00125, expectedAPR: 3.0 },
        { moneyFactor: 0.002, expectedAPR: 4.8 },
        { moneyFactor: 0.0025, expectedAPR: 6.0 }
      ]

      testCases.forEach(({ moneyFactor, expectedAPR }) => {
        const testData = { ...mockLeaseData, money_factor: moneyFactor }
        const calculator = new LeaseCalculator(testData)
        const interestRate = calculator.calculateInterestRate()

        expect(interestRate).toBeCloseTo(expectedAPR, 1)
      })
    })
  })

  describe('Tax Calculations', () => {
    it('should calculate total sales tax correctly', () => {
      const calculator = new LeaseCalculator(mockLeaseData)
      const totalTax = calculator.calculateTotalSalesTax()

      // Should be positive and reasonable for the lease amount
      expect(totalTax).toBeGreaterThan(0)
      expect(totalTax).toBeLessThan(5000) // Sanity check
    })

    it('should handle zero tax rate', () => {
      const noTaxData = { ...mockLeaseData, sales_tax_percent: 0 }
      const calculator = new LeaseCalculator(noTaxData)
      const totalTax = calculator.calculateTotalSalesTax()
      const monthlyTax = calculator.calculateMonthlySalesTax()

      expect(totalTax).toBe(0)
      expect(monthlyTax).toBe(0)
    })
  })
})
