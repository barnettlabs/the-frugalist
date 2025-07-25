import { describe, it, expect } from 'vitest'
import { FinanceCalculator } from '@/utils/financeCalculator'
import { VehicleType, type FinanceFormData } from '@/types'

describe('FinanceCalculator', () => {
  const mockFinanceData: FinanceFormData = {
    msrp: 30000,
    fees: 1500,
    discounts: 2000,
    rebates: 500,
    down_payment: 5000,
    sales_tax_percent: 8.5,
    interest_rate: 4.5,
    finance_term: 60,
    extra_payments_json: null,
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
    it('should calculate purchase price correctly', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const purchasePrice = calculator.calculatePurchasePrice()

      // MSRP (30000) - discounts (2000) - rebates (500) = 27500
      expect(purchasePrice).toBe(27500)
    })

    it('should calculate sales tax amount correctly', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const salesTaxAmount = calculator.calculateSalesTaxAmount()

      // Taxable amount: MSRP (30000) - discounts (2000) = 28000
      // Tax: 28000 * 8.5% = 2380
      expect(salesTaxAmount).toBe(2380)
    })

    it('should calculate loan amount correctly', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const loanAmount = calculator.calculateLoanAmount()

      // Purchase price (27500) + fees (1500) + tax (2380) - down payment (5000) = 26380
      expect(loanAmount).toBe(26380)
    })

    it('should calculate monthly payment correctly', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const monthlyPayment = calculator.calculateMonthlyPayment()

      // Using loan formula with 4.5% APR, 60 months, loan amount 26380
      expect(monthlyPayment).toBeCloseTo(491.80, 1)
    })

    it('should handle zero interest rate', () => {
      const zeroInterestData = { ...mockFinanceData, interest_rate: 0 }
      const calculator = new FinanceCalculator(zeroInterestData)
      const monthlyPayment = calculator.calculateMonthlyPayment()

      // Should be loan amount / term
      expect(monthlyPayment).toBeCloseTo(26380 / 60, 2)
    })

    it('should calculate total interest amount', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const interestAmount = calculator.calculateInterestAmount()
      const monthlyPayment = calculator.calculateMonthlyPayment()
      const loanAmount = calculator.calculateLoanAmount()

      // Total payments - loan amount
      const expectedInterest = (monthlyPayment * 60) - loanAmount
      expect(interestAmount).toBeCloseTo(expectedInterest, 2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative loan amount', () => {
      const negativeData = {
        ...mockFinanceData,
        down_payment: 50000 // More than total cost
      }
      const calculator = new FinanceCalculator(negativeData)
      const monthlyPayment = calculator.calculateMonthlyPayment()

      expect(monthlyPayment).toBe(0)
    })

    it('should handle zero finance term', () => {
      const zeroTermData = { ...mockFinanceData, finance_term: 0 }
      const calculator = new FinanceCalculator(zeroTermData)
      const monthlyPayment = calculator.calculateMonthlyPayment()

      expect(monthlyPayment).toBe(0)
    })

    it('should handle string inputs', () => {
      const stringData = {
        ...mockFinanceData,
        msrp: '30000' as any,
        interest_rate: '4.5' as any
      }
      const calculator = new FinanceCalculator(stringData)
      const purchasePrice = calculator.calculatePurchasePrice()

      expect(purchasePrice).toBe(27500)
    })
  })

  describe('Extra Payments', () => {
    it('should parse extra payments JSON correctly', () => {
      const extraPaymentsData = {
        ...mockFinanceData,
        extra_payments_json: JSON.stringify([
          { startMonth: 12, endMonth: 12, paymentAmount: 1000 },
          { startMonth: 24, endMonth: 24, paymentAmount: 1500 }
        ])
      }

      const calculator = new FinanceCalculator(extraPaymentsData)
      const extraPayments = calculator.parseExtraPayments()

      expect(extraPayments).toHaveLength(2)
      expect(extraPayments[0].paymentAmount).toBe(1000)
    })

    it('should calculate extra payment for specific month', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const extraPayments = [
        { startMonth: 10, endMonth: 15, paymentAmount: 500 },
        { startMonth: 12, endMonth: 12, paymentAmount: 1000 }
      ]

      const extraForMonth12 = calculator.getExtraPaymentForMonth(12, extraPayments)
      expect(extraForMonth12).toBe(1500) // 500 + 1000

      const extraForMonth20 = calculator.getExtraPaymentForMonth(20, extraPayments)
      expect(extraForMonth20).toBe(0)
    })

    it('should generate amortization with extra payments', () => {
      const extraPaymentsData = {
        ...mockFinanceData,
        extra_payments_json: JSON.stringify([
          { startMonth: 12, endMonth: 12, paymentAmount: 1000 }
        ])
      }

      const calculator = new FinanceCalculator(extraPaymentsData)
      const amortization = calculator.calculateAmortization(true)

      expect(amortization).toBeTruthy()
      expect(amortization!.schedule[11].extraPayment).toBe(1000) // Month 12 (0-indexed)
      expect(amortization!.monthsSaved).toBeGreaterThan(0)
    })
  })

  describe('Amortization Schedule', () => {
    it('should generate complete amortization schedule', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const amortization = calculator.calculateAmortization()

      expect(amortization).toBeTruthy()
      expect(amortization!.schedule).toHaveLength(60)
      expect(amortization!.schedule[0].month).toBe(1)
      expect(amortization!.schedule[59].remainingBalance).toBeCloseTo(0, 2)
    })

    it('should have decreasing balance over time', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const amortization = calculator.calculateAmortization()

      const schedule = amortization!.schedule
      expect(schedule[0].remainingBalance).toBeGreaterThan(schedule[29].remainingBalance)
      expect(schedule[29].remainingBalance).toBeGreaterThan(schedule[59].remainingBalance)
    })

    it('should calculate total interest correctly in amortization', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const amortization = calculator.calculateAmortization()
      const calculatedInterest = calculator.calculateInterestAmount()

      expect(amortization!.totalInterest).toBeCloseTo(calculatedInterest, 2)
    })
  })

  describe('Summary and Breakdown', () => {
    it('should provide complete summary', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const summary = calculator.getSummary()

      expect(summary).toHaveProperty('purchasePrice')
      expect(summary).toHaveProperty('salesTaxAmount')
      expect(summary).toHaveProperty('loanAmount')
      expect(summary).toHaveProperty('monthlyPayment')
      expect(summary).toHaveProperty('interestAmount')
      expect(summary).toHaveProperty('amortization')
    })

    it('should provide payment breakdown', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const breakdown = calculator.getPaymentBreakdown()

      expect(breakdown).toHaveProperty('principal')
      expect(breakdown).toHaveProperty('interest')
      expect(breakdown).toHaveProperty('extraPayments')
    })

    it('should provide chart data', () => {
      const calculator = new FinanceCalculator(mockFinanceData)
      const chartData = calculator.getChartData()

      expect(chartData).toHaveProperty('labels')
      expect(chartData).toHaveProperty('datasets')
      expect(chartData!.datasets).toHaveLength(3) // Principal, Interest, Extra Payments
    })
  })
})
