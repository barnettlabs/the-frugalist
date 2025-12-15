<script setup lang="ts">
import { ref, computed } from 'vue'
import { FinanceCalculator } from '../../utils/financeCalculator.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const expanded = ref(false)

const summary = computed(() => {
  const calculator = new FinanceCalculator(props.data)
  return calculator.getSummary()
})

const hasExtraPayments = computed(() => {
  return props.data.extra_payments_json && props.data.extra_payments_json !== ''
})

const interestRatio = computed(() => {
  if (!summary.value || summary.value.paymentsTotal === 0) return 0
  return ((summary.value.interestAmount / summary.value.paymentsTotal) * 100).toFixed(1)
})

const principalRatio = computed(() => {
  if (!summary.value || summary.value.paymentsTotal === 0) return 0
  return ((summary.value.loanAmount / summary.value.paymentsTotal) * 100).toFixed(1)
})

const totalCost = computed(() => {
  if (!summary.value) return 0
  return summary.value.paymentsTotal + parseFloat(props.data.down_payment || 0)
})

const costVsMsrpRatio = computed(() => {
  const msrp = parseFloat(props.data.msrp || 0)
  if (msrp === 0) return 0
  return ((totalCost.value / msrp) * 100).toFixed(1)
})

const timeSaved = computed(() => {
  if (!hasExtraPayments.value || !summary.value || !summary.value.amortization) return 0
  return summary.value.amortization.monthsSaved || 0
})

const interestSaved = computed(() => {
  if (!hasExtraPayments.value) return 0

  const dataWithoutExtra = { ...props.data, extra_payments_json: '' }

  const calculatorWithoutExtra = new FinanceCalculator(dataWithoutExtra)
  const calculatorWithExtra = new FinanceCalculator(props.data)

  const amortizationWithoutExtra = calculatorWithoutExtra.calculateAmortization(false)
  const amortizationWithExtra = calculatorWithExtra.calculateAmortization(true)

  if (!amortizationWithoutExtra || !amortizationWithExtra) {
    return 0
  }

  const diff = amortizationWithoutExtra.totalInterest - amortizationWithExtra.totalInterest

  return Math.max(0, diff)
})

const totalExtraPayments = computed(() => {
  if (!hasExtraPayments.value || !summary.value.paymentBreakdown) return 0
  return summary.value.paymentBreakdown.extraPayments || 0
})

import { formatCurrency } from '@/utils/formatters.js'
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm bg-white p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900">Advanced Calculations</h3>
      <button
        @click="expanded = !expanded"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg
          class="w-5 h-5 text-gray-600"
          :class="{ 'rotate-180': expanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
    </div>

    <div v-if="summary">
      <!-- Basic Summary (Always Visible) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-primary/10 p-4 rounded-lg">
          <div class="text-sm text-primary font-medium">Monthly Payment</div>
          <div class="text-xl font-bold text-primary-shade-4">
            ${{ formatCurrency(summary.monthlyPayment) }}
          </div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm text-purple-600 font-medium">Due at Signing</div>
          <div class="text-xl font-bold text-purple-900">
            ${{ formatCurrency(parseFloat(data.down_payment || 0)) }}
          </div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-sm text-red-600 font-medium">Total Interest</div>
          <div class="text-xl font-bold text-red-900">
            ${{ formatCurrency(summary.interestAmount) }}
          </div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm text-blue-600 font-medium">Total Paid</div>
          <div class="text-xl font-bold text-blue-900">
            ${{ formatCurrency(summary.paymentsTotal + parseFloat(data.down_payment || 0)) }}
          </div>
        </div>
      </div>

      <!-- Detailed Calculations (Expandable) -->
      <div v-if="expanded" class="space-y-6">
        <!-- Purchase Breakdown -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">Purchase Breakdown</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">MSRP</span>
              <span class="text-sm font-medium">${{ formatCurrency(data.msrp) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Discounts</span>
              <span class="text-sm font-medium text-green-600"
                >-${{ formatCurrency(data.discounts) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Rebates</span>
              <span class="text-sm font-medium text-green-600"
                >-${{ formatCurrency(data.rebates) }}</span
              >
            </div>
            <div class="border-t pt-2">
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-900">Purchase Price</span>
                <span class="text-sm font-bold text-gray-900"
                  >${{ formatCurrency(summary.purchasePrice) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Loan Breakdown -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">Loan Breakdown</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Purchase Price</span>
              <span class="text-sm font-medium">${{ formatCurrency(summary.purchasePrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Fees</span>
              <span class="text-sm font-medium">${{ formatCurrency(data.fees) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Sales Tax</span>
              <span class="text-sm font-medium">${{ formatCurrency(summary.salesTaxAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Down Payment</span>
              <span class="text-sm font-medium text-green-600"
                >-${{ formatCurrency(data.down_payment) }}</span
              >
            </div>
            <div class="border-t pt-2">
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-900">Amount Financed</span>
                <span class="text-sm font-bold text-gray-900"
                  >${{ formatCurrency(summary.loanAmount) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Analysis -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">Payment Analysis</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Monthly Payment</span>
              <span class="text-sm font-medium">${{ formatCurrency(summary.monthlyPayment) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Number of Payments</span>
              <span class="text-sm font-medium">{{ data.finance_term }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total of Payments</span>
              <span class="text-sm font-medium">${{ formatCurrency(summary.paymentsTotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total Interest</span>
              <span class="text-sm font-medium text-red-600"
                >${{ formatCurrency(summary.interestAmount) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Advanced Metrics -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">Advanced Metrics</h4>
          <div class="grid grid-cols-1 gap-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Interest Rate</span>
              <span class="text-sm font-medium">{{ data.interest_rate }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Sales Tax Rate</span>
              <span class="text-sm font-medium">{{ data.sales_tax_percent }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Loan Term</span>
              <span class="text-sm font-medium">{{ data.finance_term }} months</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Interest vs Principal</span>
              <span class="text-sm font-medium">{{ interestRatio }}% / {{ principalRatio }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total Cost</span>
              <span class="text-sm font-medium">${{ formatCurrency(totalCost) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Cost vs MSRP</span>
              <span class="text-sm font-medium">{{ costVsMsrpRatio }}%</span>
            </div>
          </div>
        </div>

        <!-- Extra Payments Impact -->
        <div v-if="hasExtraPayments" class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-3">Extra Payments Impact</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-green-700">Total Extra Payments</span>
              <span class="text-sm font-medium text-green-900"
                >${{ formatCurrency(totalExtraPayments) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-green-700">Interest Saved</span>
              <span class="text-sm font-medium text-green-900"
                >${{ formatCurrency(interestSaved) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-green-700">Time Saved</span>
              <span class="text-sm font-medium text-green-900">{{ timeSaved }} months</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p>Enter loan details to see advanced calculations</p>
    </div>
  </div>
</template>
