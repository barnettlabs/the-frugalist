<script setup lang="ts">
import { ref, computed } from 'vue'
import { LeaseCalculator } from '../../utils/leaseCalculator.js'
import { formatCurrency } from '@/utils/formatters.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const chartType = ref('pie')

const summary = computed(() => {
  const calculator = new LeaseCalculator(props.data)
  return calculator.getSummary()
})

const paymentBreakdown = computed(() => {
  if (!summary.value) return null

  return {
    principal: summary.value.monthlyPrincipalPayment * parseInt(props.data.lease_term || 0),
    interest: summary.value.residualMonthlyInterestPayment * parseInt(props.data.lease_term || 0),
    salesTax: summary.value.monthlySalesTax * parseInt(props.data.lease_term || 0),
  }
})

const totalAmount = computed(() => {
  if (!paymentBreakdown.value) return 0
  return (
    paymentBreakdown.value.principal +
    paymentBreakdown.value.interest +
    paymentBreakdown.value.salesTax
  )
})

const principalPercentage = computed(() => {
  if (!paymentBreakdown.value || totalAmount.value === 0) return 0
  return (paymentBreakdown.value.principal / totalAmount.value) * 100
})

const interestPercentage = computed(() => {
  if (!paymentBreakdown.value || totalAmount.value === 0) return 0
  return (paymentBreakdown.value.interest / totalAmount.value) * 100
})

const salesTaxPercentage = computed(() => {
  if (!paymentBreakdown.value || totalAmount.value === 0) return 0
  return (paymentBreakdown.value.salesTax / totalAmount.value) * 100
})
</script>

<template>
  <div class="futuristic-card bg-white p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900">Payment Analysis</h3>
      <div class="flex items-center space-x-2">
        <button
          @click="chartType = 'line'"
          :class="chartType === 'line' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700'"
          class="px-3 py-1 text-sm rounded-lg transition-colors"
        >
          Line Chart
        </button>
        <button
          @click="chartType = 'pie'"
          :class="chartType === 'pie' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700'"
          class="px-3 py-1 text-sm rounded-lg transition-colors"
        >
          Pie Chart
        </button>
      </div>
    </div>

    <div v-if="paymentBreakdown">
      <!-- Line Chart -->
      <div v-if="chartType === 'line'" class="mb-6">
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <svg
              class="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
            <p class="text-sm text-gray-500">Monthly Payment Breakdown</p>
            <p class="text-xs text-gray-400">Chart visualization would go here</p>
          </div>
        </div>
      </div>

      <!-- Pie Chart -->
      <div v-if="chartType === 'pie'" class="mb-6">
        <div class="h-64 flex items-center justify-center">
          <div class="grid grid-cols-1 gap-4 w-full max-w-md">
            <!-- Manual pie chart representation -->
            <div class="relative">
              <div class="flex items-center justify-center h-48">
                <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                  <!-- Principal segment -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="20"
                    :stroke-dasharray="`${principalPercentage * 2.51} 251`"
                    stroke-dashoffset="0"
                  />
                  <!-- Interest segment -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#EF4444"
                    stroke-width="20"
                    :stroke-dasharray="`${interestPercentage * 2.51} 251`"
                    :stroke-dashoffset="`-${principalPercentage * 2.51}`"
                  />
                  <!-- Sales Tax segment -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F59E0B"
                    stroke-width="20"
                    :stroke-dasharray="`${salesTaxPercentage * 2.51} 251`"
                    :stroke-dashoffset="`-${(principalPercentage + interestPercentage) * 2.51}`"
                  />
                </svg>
              </div>
            </div>

            <!-- Legend -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span class="text-sm text-gray-700">Principal (Depreciation)</span>
                </div>
                <div class="text-sm font-medium">
                  ${{ formatCurrency(paymentBreakdown.principal) }} ({{
                    principalPercentage.toFixed(1)
                  }}%)
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <span class="text-sm text-gray-700">Interest</span>
                </div>
                <div class="text-sm font-medium">
                  ${{ formatCurrency(paymentBreakdown.interest) }} ({{
                    interestPercentage.toFixed(1)
                  }}%)
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span class="text-sm text-gray-700">Sales Tax</span>
                </div>
                <div class="text-sm font-medium">
                  ${{ formatCurrency(paymentBreakdown.salesTax) }} ({{
                    salesTaxPercentage.toFixed(1)
                  }}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm text-blue-600 font-medium">Total Depreciation</div>
          <div class="text-lg font-bold text-blue-900">
            ${{ formatCurrency(paymentBreakdown.principal) }}
          </div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <div class="text-sm text-red-600 font-medium">Total Interest</div>
          <div class="text-lg font-bold text-red-900">
            ${{ formatCurrency(paymentBreakdown.interest) }}
          </div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-sm text-yellow-600 font-medium">Total Sales Tax</div>
          <div class="text-lg font-bold text-yellow-900">
            ${{ formatCurrency(paymentBreakdown.salesTax) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p>Enter lease details to see payment analysis</p>
    </div>
  </div>
</template>
