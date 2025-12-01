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

const expanded = ref(false)

const summary = computed(() => {
  const calculator = new LeaseCalculator(props.data)
  return calculator.getSummary()
})

// Calculate buyout price at lease end
const endOfLeaseBuyout = computed(() => {
  if (!summary.value) return 0
  return summary.value.residualAmount
})

interface BuyoutScenario {
  monthsElapsed: number
  remainingMonths: number
  buyoutPrice: number
  estimatedMarketValue: number
  equity: number
  totalPaidSoFar: number
}

// Calculate early buyout scenarios
const earlyBuyoutScenarios = computed((): BuyoutScenario[] => {
  if (!summary.value || !props.data.lease_term) return []

  const leaseTerm = parseInt(props.data.lease_term)
  const monthlyPayment = summary.value.leasePayment
  const residualAmount = summary.value.residualAmount
  const msrp = parseFloat(props.data.msrp || 0)

  const scenarios: BuyoutScenario[] = []

  // Calculate for 6 months, 12 months, 18 months, and 24 months into lease
  const timePoints = [6, 12, 18, 24].filter((months) => months < leaseTerm)

  timePoints.forEach((monthsElapsed) => {
    const remainingPayments = leaseTerm - monthsElapsed
    const remainingPaymentValue = remainingPayments * monthlyPayment

    // Typical early buyout calculation: Residual + remaining payments (often with some discount)
    const earlyBuyoutPrice = residualAmount + remainingPaymentValue * 0.5 // 50% of remaining payments

    // Calculate depreciation rate for market value estimation
    const depreciationRate = (100 - parseFloat(props.data.residual_percent || 0)) / 100
    const additionalDepreciation = (monthsElapsed / leaseTerm) * depreciationRate * 0.1 // Additional 10% depreciation
    const estimatedMarketValue =
      msrp * (1 - depreciationRate * (monthsElapsed / leaseTerm) - additionalDepreciation)

    scenarios.push({
      monthsElapsed,
      remainingMonths: remainingPayments,
      buyoutPrice: earlyBuyoutPrice,
      estimatedMarketValue,
      equity: Math.max(0, estimatedMarketValue - earlyBuyoutPrice),
      totalPaidSoFar: monthsElapsed * monthlyPayment + parseFloat(props.data.down_payment || 0),
    })
  })

  return scenarios
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm bg-white p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900">Buyout Analysis</h3>
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
      <!-- Basic Buyout Summary (Always Visible) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm text-green-600 font-medium">End-of-Lease Buyout</div>
          <div class="text-2xl font-bold text-green-900">
            ${{ formatCurrency(endOfLeaseBuyout) }}
          </div>
          <div class="text-xs text-green-700 mt-1">{{ props.data.residual_percent }}% of MSRP</div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm text-blue-600 font-medium">Residual Percentage</div>
          <div class="text-2xl font-bold text-blue-900">
            {{ props.data.residual_percent || 0 }}%
          </div>
          <div class="text-xs text-blue-700 mt-1">of Original MSRP</div>
        </div>
      </div>

      <!-- Detailed Analysis (Expandable) -->
      <div v-if="expanded" class="space-y-6">
        <!-- End of Lease Options -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">End-of-Lease Options</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Return Vehicle</span>
              <span class="text-sm font-medium text-gray-900"
                >$0 (subject to excess wear/mileage)</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Purchase Vehicle</span>
              <span class="text-sm font-medium text-gray-900"
                >${{ formatCurrency(endOfLeaseBuyout) }}</span
              >
            </div>
            <div class="border-t pt-2">
              <div class="text-xs text-gray-500">
                * Buyout price is typically the residual value plus any applicable fees
              </div>
            </div>
          </div>
        </div>

        <!-- Early Buyout Scenarios -->
        <div v-if="earlyBuyoutScenarios.length > 0" class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-3">Early Buyout Scenarios</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 text-gray-600">Months In</th>
                  <th class="text-left py-2 text-gray-600">Buyout Price</th>
                  <th class="text-left py-2 text-gray-600">Est. Market Value</th>
                  <th class="text-left py-2 text-gray-600">Equity</th>
                  <th class="text-left py-2 text-gray-600">Total Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="scenario in earlyBuyoutScenarios"
                  :key="scenario.monthsElapsed"
                  class="border-b border-gray-100"
                >
                  <td class="py-2 font-medium">{{ scenario.monthsElapsed }}</td>
                  <td class="py-2">${{ formatCurrency(scenario.buyoutPrice) }}</td>
                  <td class="py-2">${{ formatCurrency(scenario.estimatedMarketValue) }}</td>
                  <td class="py-2" :class="scenario.equity > 0 ? 'text-green-600' : 'text-red-600'">
                    ${{ formatCurrency(scenario.equity) }}
                  </td>
                  <td class="py-2">${{ formatCurrency(scenario.totalPaidSoFar) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3 text-xs text-gray-500">
            * Early buyout prices are estimates and may vary by leasing company. Market values are
            approximations and based on a linear depreciation rate which is not always accurate.
          </div>
        </div>

        <!-- Considerations -->
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h4 class="font-semibold text-yellow-800 mb-3">Buyout Considerations</h4>
          <div class="space-y-2 text-sm text-yellow-700">
            <div class="flex items-start space-x-2">
              <div class="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Check actual market value before buying - consider getting appraisals</p>
            </div>
            <div class="flex items-start space-x-2">
              <div class="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Factor in sales tax, registration, and title fees for purchase</p>
            </div>
            <div class="flex items-start space-x-2">
              <div class="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Consider warranty coverage differences between leased and owned vehicles</p>
            </div>
            <div class="flex items-start space-x-2">
              <div class="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Early buyout may require paying disposition fees and remaining payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p>Enter lease details to see buyout analysis</p>
    </div>
  </div>
</template>
