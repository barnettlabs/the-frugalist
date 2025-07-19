<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { CurrencyDollarIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { LeaseCalculator } from '@/utils/leaseCalculator'
import { formatCurrency } from '@/utils/formatters'
import axios from 'axios'
import type { VehicleLeaseSheet, User, Profile } from '@/types'

interface Props {
  user: User
  profile?: Profile
  sheetIds: string
}

const props = defineProps<Props>()

const sheets = ref<VehicleLeaseSheet[]>([])
const loading = ref(true)

const breadcrumbs = computed(() => [
  {
    name: 'Lease Renegade',
    href: '/estimates/leasing'
  },
  {
    name: 'Compare Estimates',
    current: true
  }
])

const fetchSheets = async () => {
  try {
    const ids = props.sheetIds.split(',').map(id => parseInt(id.trim()))
    const promises = ids.map(id => axios.get(`/api/vehicle-lease-sheets/${id}`))
    const responses = await Promise.all(promises)
    sheets.value = responses.map(response => response.data)
  } catch (error) {
    console.error('Error fetching sheets for comparison:', error)
  } finally {
    loading.value = false
  }
}

const getSheetCalculations = (sheet: VehicleLeaseSheet) => {
  try {
    const calculator = new LeaseCalculator(sheet)
    const summary = calculator.getSummary()
    const netCapCost = calculator.calculateNetCapCost()
    const msrp = Number(sheet.msrp) || 0
    const residualPercent = Number(sheet.residual_percent) || 0
    const residualValue = msrp * (residualPercent / 100)
    const downPayment = Number(sheet.down_payment) || 0
    const dealerContribution = Number(sheet.dealer_contribution) || 0
    const totalDueAtSigning = downPayment + dealerContribution
    const monthlyPayment = summary?.monthlyPayment || 0
    const leaseTerm = Number(sheet.lease_term) || 0
    const moneyFactor = Number(sheet.money_factor) || 0
    
    return {
      monthlyPayment: monthlyPayment,
      netCapCost: netCapCost || 0,
      residualValue: residualValue,
      totalPaid: monthlyPayment * leaseTerm,
      totalDueAtSigning: totalDueAtSigning,
      interestRate: (moneyFactor * 2400).toFixed(2),
    }
  } catch (error) {
    console.error('Error calculating sheet:', error)
    return {
      monthlyPayment: 0,
      netCapCost: 0,
      residualValue: 0,
      totalPaid: 0,
      totalDueAtSigning: 0,
      interestRate: '0.00',
    }
  }
}

const getVehicleTitle = (sheet: VehicleLeaseSheet) => {
  const parts = [
    sheet.vehicle_year,
    sheet.vehicle_make,
    sheet.vehicle_model,
    sheet.vehicle_trim,
  ].filter((part) => part && part.toString().trim())
  return parts.length > 0 ? parts.join(' ') : 'Vehicle'
}

// Find the best value for each metric
const getBestMetric = (metric: string) => {
  if (!sheets.value.length) return null
  const values = sheets.value.map(sheet => {
    const calc = getSheetCalculations(sheet)
    return calc[metric as keyof typeof calc] as number
  })
  
  // For most metrics, lower is better
  const isLowerBetter = ['monthlyPayment', 'totalPaid', 'totalDueAtSigning', 'netCapCost'].includes(metric)
  return isLowerBetter ? Math.min(...values) : Math.max(...values)
}

const isBestValue = (sheet: VehicleLeaseSheet, metric: string) => {
  const calc = getSheetCalculations(sheet)
  const value = calc[metric as keyof typeof calc] as number
  const bestValue = getBestMetric(metric)
  return value === bestValue
}

onMounted(() => {
  fetchSheets()
})
</script>

<template>
  <Head title="Compare Lease Estimates" />

  <AuthenticatedLayout :user="props.user" :breadcrumbs="breadcrumbs">
    <main class="-mt-24 pb-8 flex-1">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Hero Header -->
        <div class="mb-8">
          <div class="glass rounded-2xl p-8 text-gray-900 bg-white/80 relative overflow-hidden">
            <div class="relative text-center lg:text-left">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div class="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div class="p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/20">
                    <CurrencyDollarIcon class="h-12 w-12 text-secondary" />
                  </div>
                  <div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">Compare Lease Estimates</h1>
                    <p class="text-lg text-gray-600">
                      Side-by-side comparison of your leasing scenarios
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    @click="router.visit('/estimates/leasing')"
                    class="bg-secondary hover:bg-secondary-shade-1 text-white px-4 py-2 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2"
                  >
                    <XMarkIcon class="h-4 w-4" />
                    <span>Back</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>

        <!-- Comparison Table -->
        <div v-else-if="sheets.length" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                    Metric
                  </th>
                  <th 
                    v-for="sheet in sheets" 
                    :key="sheet.id"
                    class="px-6 py-4 text-center text-sm font-medium text-gray-900 min-w-[200px]"
                  >
                    <div>
                      <div class="font-bold text-secondary">{{ getVehicleTitle(sheet) }}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ sheet.dealership_name || 'No dealership' }}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <!-- Key Metrics -->
                <tr class="bg-yellow-50">
                  <td class="px-6 py-4 text-sm font-bold text-gray-900 sticky left-0 bg-yellow-50">
                    Monthly Payment
                  </td>
                  <td 
                    v-for="sheet in sheets" 
                    :key="`monthly-${sheet.id}`"
                    :class="[
                      'px-6 py-4 text-center text-sm font-bold',
                      isBestValue(sheet, 'monthlyPayment') ? 'text-green-600 bg-green-50' : 'text-gray-900'
                    ]"
                  >
                    ${{ formatCurrency(getSheetCalculations(sheet).monthlyPayment) }}
                  </td>
                </tr>

                <tr class="bg-yellow-50">
                  <td class="px-6 py-4 text-sm font-bold text-gray-900 sticky left-0 bg-yellow-50">
                    Total Paid (All Payments)
                  </td>
                  <td 
                    v-for="sheet in sheets" 
                    :key="`total-${sheet.id}`"
                    :class="[
                      'px-6 py-4 text-center text-sm font-bold',
                      isBestValue(sheet, 'totalPaid') ? 'text-green-600 bg-green-50' : 'text-gray-900'
                    ]"
                  >
                    ${{ formatCurrency(getSheetCalculations(sheet).totalPaid) }}
                  </td>
                </tr>

                <tr class="bg-yellow-50">
                  <td class="px-6 py-4 text-sm font-bold text-gray-900 sticky left-0 bg-yellow-50">
                    Total Due at Signing
                  </td>
                  <td 
                    v-for="sheet in sheets" 
                    :key="`signing-${sheet.id}`"
                    :class="[
                      'px-6 py-4 text-center text-sm font-bold',
                      isBestValue(sheet, 'totalDueAtSigning') ? 'text-green-600 bg-green-50' : 'text-gray-900'
                    ]"
                  >
                    ${{ formatCurrency(getSheetCalculations(sheet).totalDueAtSigning) }}
                  </td>
                </tr>

                <tr class="bg-yellow-50">
                  <td class="px-6 py-4 text-sm font-bold text-gray-900 sticky left-0 bg-yellow-50">
                    Net Capitalized Cost
                  </td>
                  <td 
                    v-for="sheet in sheets" 
                    :key="`netcap-${sheet.id}`"
                    :class="[
                      'px-6 py-4 text-center text-sm font-bold',
                      isBestValue(sheet, 'netCapCost') ? 'text-green-600 bg-green-50' : 'text-gray-900'
                    ]"
                  >
                    ${{ formatCurrency(getSheetCalculations(sheet).netCapCost) }}
                  </td>
                </tr>

                <!-- Vehicle Details -->
                <tr>
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">MSRP</td>
                  <td v-for="sheet in sheets" :key="`msrp-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    ${{ formatCurrency(Number(sheet.msrp) || 0) }}
                  </td>
                </tr>

                <tr class="bg-gray-50">
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">Residual Value</td>
                  <td v-for="sheet in sheets" :key="`residual-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    ${{ formatCurrency(getSheetCalculations(sheet).residualValue) }}
                  </td>
                </tr>

                <!-- Lease Terms -->
                <tr>
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">Money Factor</td>
                  <td v-for="sheet in sheets" :key="`mf-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    {{ Number(sheet.money_factor) || 0 }} ({{ getSheetCalculations(sheet).interestRate }}%)
                  </td>
                </tr>

                <tr class="bg-gray-50">
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">Residual Percentage</td>
                  <td v-for="sheet in sheets" :key="`respct-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    {{ Number(sheet.residual_percent) || 0 }}%
                  </td>
                </tr>

                <tr>
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">Lease Term</td>
                  <td v-for="sheet in sheets" :key="`term-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    {{ Number(sheet.lease_term) || 0 }} months
                  </td>
                </tr>

                <tr class="bg-gray-50">
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">Down Payment</td>
                  <td v-for="sheet in sheets" :key="`down-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    ${{ formatCurrency(Number(sheet.down_payment) || 0) }}
                  </td>
                </tr>

                <tr>
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">Dealer Contribution</td>
                  <td v-for="sheet in sheets" :key="`dealer-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    ${{ formatCurrency(Number(sheet.dealer_contribution) || 0) }}
                  </td>
                </tr>

                <tr class="bg-gray-50">
                  <td class="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">Trade-in Value</td>
                  <td v-for="sheet in sheets" :key="`trade-${sheet.id}`" class="px-6 py-3 text-center text-sm text-gray-900">
                    ${{ formatCurrency(Number(sheet.trade_in) || 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center justify-center space-x-6 text-sm">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span class="text-gray-600">Key Metrics</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span class="text-gray-600">Best Value</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </AuthenticatedLayout>
</template>