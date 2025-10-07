<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FinanceCalculator } from '../../utils/financeCalculator.js'
import { formatCurrency, parseOrZero } from '@/utils/formatters.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    required: true,
  },
})

interface ExtraPayment {
  paymentAmount: string
  startMonth: number
  endMonth: number
}

const emit = defineEmits(['update:modelValue'])

const extraPayments = ref<ExtraPayment[]>([])
const financeTerm = computed(() => parseInt(props.data.finance_term) || 0)

// Initialize extra payments from modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      try {
        const parsed = JSON.parse(newValue)
        extraPayments.value = Array.isArray(parsed) ? parsed : []
      } catch (error) {
        extraPayments.value = []
      }
    } else {
      extraPayments.value = []
    }
  },
  { immediate: true }
)

const addExtraPayment = () => {
  extraPayments.value.push({
    paymentAmount: '',
    startMonth: 1,
    endMonth: 1,
  })
  updateExtraPayments()
}

const removeExtraPayment = (index: number) => {
  extraPayments.value.splice(index, 1)
  updateExtraPayments()
}

const updateExtraPayments = () => {
  const jsonString = JSON.stringify(extraPayments.value)
  emit('update:modelValue', jsonString)
}

const getTotalExtraForPayment = (payment: ExtraPayment) => {
  const amount = parseOrZero(payment.paymentAmount) || 0
  const startMonth = parseOrZero(payment.startMonth) || 1
  const endMonth = parseOrZero(payment.endMonth) || startMonth
  const months = Math.max(0, endMonth - startMonth + 1)
  return amount * months
}

const getTotalExtraPayments = () => {
  return extraPayments.value.reduce((total, payment) => {
    return total + getTotalExtraForPayment(payment)
  }, 0)
}

const getInterestSavings = () => {
  const dataWithoutExtra = { ...props.data, extra_payments_json: '' }
  const dataWithExtra = { ...props.data, extra_payments_json: JSON.stringify(extraPayments.value) }

  const calculatorWithoutExtra = new FinanceCalculator(dataWithoutExtra)
  const calculatorWithExtra = new FinanceCalculator(dataWithExtra)

  const amortizationWithoutExtra = calculatorWithoutExtra.calculateAmortization(false)
  const amortizationWithExtra = calculatorWithExtra.calculateAmortization(true)

  if (!amortizationWithoutExtra || !amortizationWithExtra) {
    return 0
  }

  console.log('getInterestSavings', {
    amortizationWithoutExtra,
    amortizationWithExtra,
  })

  const diff = amortizationWithoutExtra.totalInterest - amortizationWithExtra.totalInterest

  return Math.max(0, diff)
}

const getTimeSavings = () => {
  const dataWithoutExtra = { ...props.data, extra_payments_json: '' }
  const dataWithExtra = { ...props.data, extra_payments_json: JSON.stringify(extraPayments.value) }

  const calculatorWithoutExtra = new FinanceCalculator(dataWithoutExtra)
  const calculatorWithExtra = new FinanceCalculator(dataWithExtra)

  const amortizationWithoutExtra = calculatorWithoutExtra.calculateAmortization(false)
  const amortizationWithExtra = calculatorWithExtra.calculateAmortization(true)

  if (!amortizationWithoutExtra || !amortizationWithExtra) {
    return 0
  }

  return Math.max(0, amortizationWithoutExtra.monthsPaid - amortizationWithExtra.monthsPaid)
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm bg-white p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900">Extra Payments</h3>
      <button
        @click="addExtraPayment"
        class="bg-primary hover:bg-primary-shade-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        <span>Add Extra Payment</span>
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="(payment, index) in extraPayments" :key="index" class="bg-gray-50 p-4 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >$</span
              >
              <input
                v-model="payment.paymentAmount"
                type="number"
                step="0.01"
                min="0"
                class="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="0.00"
                @input="updateExtraPayments"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Month</label>
            <input
              v-model="payment.startMonth"
              type="number"
              min="1"
              :max="financeTerm"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="1"
              @input="updateExtraPayments"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Month</label>
            <input
              v-model="payment.endMonth"
              type="number"
              min="1"
              :max="financeTerm"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="1"
              @input="updateExtraPayments"
            />
          </div>

          <div class="flex items-end">
            <button
              @click="removeExtraPayment(index)"
              class="w-full bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              <span>Remove</span>
            </button>
          </div>
        </div>

        <div class="mt-3 text-sm text-gray-600">
          <div class="flex items-center space-x-4">
            <span
              >Duration: {{ payment.startMonth || 1 }} -
              {{ payment.endMonth || payment.startMonth || 1 }} months</span
            >
            <span>•</span>
            <span>Total: ${{ formatCurrency(getTotalExtraForPayment(payment)) }}</span>
          </div>
        </div>
      </div>

      <div v-if="extraPayments.length === 0" class="text-center py-8 text-gray-500">
        <div class="mb-4">
          <svg
            class="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            ></path>
          </svg>
        </div>
        <p class="text-sm">No extra payments configured</p>
        <p class="text-xs text-gray-400">
          Add extra payments to reduce your loan term and save on interest
        </p>
      </div>
    </div>

    <div v-if="extraPayments.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="flex items-center mb-2">
          <svg
            class="w-5 h-5 text-green-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-sm font-medium text-green-800">Extra Payment Benefits</span>
        </div>
        <div class="text-sm text-green-700">
          <div class="flex justify-between">
            <span>Total Extra Payments:</span>
            <span class="font-medium">${{ formatCurrency(getTotalExtraPayments()) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Interest Savings:</span>
            <span class="font-medium">${{ formatCurrency(getInterestSavings()) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Time Saved:</span>
            <span class="font-medium">{{ getTimeSavings() }} months</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
