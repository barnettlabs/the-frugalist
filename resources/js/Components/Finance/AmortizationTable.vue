<template>
  <div class="futuristic-card bg-white p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900">Amortization Schedule</h3>
      <div class="flex items-center space-x-2">
        <button
          @click="showWithExtra = !showWithExtra"
          class="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
        >
          {{ showWithExtra ? 'Hide' : 'Show' }} Extra Payments
        </button>
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
    </div>

    <div v-if="amortization && amortization?.schedule?.length > 0">
      <!-- Summary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-sm text-blue-600 font-medium">Total Interest</div>
          <div class="text-lg font-bold text-blue-900">
            ${{ formatCurrency(amortization.totalInterest) }}
          </div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-sm text-green-600 font-medium">Total Principal</div>
          <div class="text-lg font-bold text-green-900">
            ${{ formatCurrency(amortization.totalPrincipal) }}
          </div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm text-purple-600 font-medium">Months to Pay</div>
          <div class="text-lg font-bold text-purple-900">{{ amortization.monthsPaid }}</div>
        </div>
        <div v-if="amortization.monthsSaved > 0" class="bg-yellow-50 p-4 rounded-lg">
          <div class="text-sm text-yellow-600 font-medium">Months Saved</div>
          <div class="text-lg font-bold text-yellow-900">{{ amortization.monthsSaved }}</div>
        </div>
      </div>

      <!-- Amortization Table -->
      <div v-if="expanded" class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-50">
              <th
                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Month
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment
              </th>
              <th
                v-if="showWithExtra"
                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Extra
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Principal
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Interest
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Balance
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in displayedPayments" :key="payment.month" class="hover:bg-gray-50">
              <td class="px-3 py-2 text-sm text-gray-900">{{ payment.month }}</td>
              <td class="px-3 py-2 text-sm text-gray-900">
                ${{ formatCurrency(payment.payment) }}
              </td>
              <td v-if="showWithExtra" class="px-3 py-2 text-sm text-green-600">
                ${{ formatCurrency(payment.extraPayment) }}
              </td>
              <td class="px-3 py-2 text-sm text-blue-600">
                ${{ formatCurrency(payment.principalPayment) }}
              </td>
              <td class="px-3 py-2 text-sm text-red-600">
                ${{ formatCurrency(payment.interestPayment) }}
              </td>
              <td class="px-3 py-2 text-sm text-gray-900">
                ${{ formatCurrency(payment.remainingBalance) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Show More/Less Button -->
        <div v-if="amortization.schedule.length > 12" class="mt-4 text-center">
          <button
            @click="showAllPayments = !showAllPayments"
            class="px-4 py-2 text-sm text-primary hover:text-primary-shade-1 font-medium"
          >
            {{
              showAllPayments ? 'Show Less' : `Show All ${amortization.schedule.length} Payments`
            }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p>Enter loan details to see amortization schedule</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FinanceCalculator } from '../../utils/financeCalculator.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const expanded = ref(false)
const showWithExtra = ref(false)
const showAllPayments = ref(false)

const amortization = computed(() => {
  const calculator = new FinanceCalculator(props.data)
  return calculator.calculateAmortization(showWithExtra.value)
})

const displayedPayments = computed(() => {
  if (!amortization.value || !amortization.value.schedule) return []

  const schedule = amortization.value.schedule
  return showAllPayments.value ? schedule : schedule.slice(0, 12)
})

import { formatCurrency } from '@/utils/formatters.js'
</script>
