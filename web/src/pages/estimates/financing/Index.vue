<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import {
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
  ScaleIcon,
  EyeIcon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline'
import { FinanceCalculator } from '@/utils/financeCalculator'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime } from '@/utils/time'
import { financeApi } from '@/api/finance'

interface VehicleFinanceSheet {
  id: number
  sheet_name?: string
  dealership_name?: string
  msrp?: number
  down_payment?: number
  vehicle_year?: number
  vehicle_make?: string
  vehicle_model?: string
  vehicle_trim?: string
  interest_rate?: number
  finance_term?: number
  fees?: number
  discounts?: number
  rebates?: number
  sales_tax_percent?: number
  created_at?: string
  updated_at?: string
}

const router = useRouter()

const vehicleFinanceSheets = ref<VehicleFinanceSheet[]>([])
const loading = ref(true)
const expandedCards = ref<Set<number>>(new Set())
const selectedSheets = ref<Set<number>>(new Set())

const fetchSheets = async () => {
  try {
    const data = await financeApi.getAll()
    vehicleFinanceSheets.value = data as VehicleFinanceSheet[]
  } catch (error) {
    console.error('Error fetching finance sheets:', error)
  } finally {
    loading.value = false
  }
}

const deleteSheet = async (sheetId: number) => {
  if (confirm('Are you sure you want to delete this estimate?')) {
    try {
      await financeApi.delete(sheetId)
      await fetchSheets()
    } catch (error) {
      console.error('Error deleting sheet:', error)
    }
  }
}

const getSheetCalculations = (sheet: VehicleFinanceSheet) => {
  try {
    const calculator = new FinanceCalculator(sheet as any)
    const summary = calculator.getSummary()
    return {
      monthlyPayment: summary?.monthlyPayment || 0,
      totalInterest: summary?.interestAmount || 0,
      loanAmount: summary?.loanAmount || 0,
      purchasePrice: summary?.purchasePrice || 0,
    }
  } catch (error) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      loanAmount: 0,
      purchasePrice: 0,
    }
  }
}

const getVehicleTitle = (sheet: VehicleFinanceSheet) => {
  const parts = [
    sheet.vehicle_year,
    sheet.vehicle_make,
    sheet.vehicle_model,
    sheet.vehicle_trim,
  ].filter((part) => part && part.toString().trim())
  return parts.length > 0 ? parts.join(' ') : 'Vehicle'
}

const toggleCardDetails = (sheetId: number) => {
  if (expandedCards.value.has(sheetId)) {
    expandedCards.value.delete(sheetId)
  } else {
    expandedCards.value.add(sheetId)
  }
}

const isCardExpanded = (sheetId: number) => {
  return expandedCards.value.has(sheetId)
}

const toggleSelection = (sheetId: number) => {
  if (selectedSheets.value.has(sheetId)) {
    selectedSheets.value.delete(sheetId)
  } else {
    selectedSheets.value.add(sheetId)
  }
}

const isSelected = (sheetId: number) => {
  return selectedSheets.value.has(sheetId)
}

const startComparison = () => {
  if (selectedSheets.value.size >= 2) {
    const sheetIds = Array.from(selectedSheets.value).join(',')
    router.push(`/estimates/financing/compare?sheets=${sheetIds}`)
  }
}

onMounted(() => {
  fetchSheets()
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <!-- Header -->
      <PageHeader
        title="Vehicle Finance Calculator"
        description="Track interest rates, rebates, dealer fees, and incentives to get the best deal"
        back-link="/dashboard"
        back-label="Dashboard"
      >
        <template #subtitle>
          <RouterLink
            to="/learning/financing"
            class="inline-flex items-center gap-2 mt-3 text-primary hover:text-primary-shade-1 transition-colors text-sm font-medium"
          >
            <BookOpenIcon class="h-4 w-4" />
            <span>Learn about financing terms</span>
          </RouterLink>
        </template>
        <template #actions>
          <button
            v-if="selectedSheets.size >= 2"
            @click="startComparison"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2"
          >
            <ScaleIcon class="h-5 w-5" />
            <span>Compare</span>
          </button>

          <RouterLink to="/estimates/financing/create">
            <button
              class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2"
            >
              <PlusIcon class="h-5 w-5" />
              <span>New Estimate</span>
            </button>
          </RouterLink>
        </template>
      </PageHeader>

      <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6">
        <div class="grid grid-cols-1 gap-2 lg:col-span-2">
          <section aria-labelledby="finance-estimates-overview-title">
            <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Loading state -->
              <div v-if="loading" class="col-span-full">
                <div class="flex items-center justify-center p-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else-if="!vehicleFinanceSheets.length" class="col-span-full">
                <div
                  class="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center"
                >
                  <div
                    class="p-4 rounded-xl bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  >
                    <BanknotesIcon class="h-8 w-8 text-primary" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">No finance estimates yet</h3>
                  <p class="text-gray-600 mb-6">
                    Start your first vehicle financing calculation to outsmart dealers
                  </p>
                  <RouterLink to="/estimates/financing/create">
                    <button
                      class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 mx-auto"
                    >
                      <PlusIcon class="h-5 w-5" />
                      <span>Create First Estimate</span>
                    </button>
                  </RouterLink>
                </div>
              </div>

              <!-- Sheets list -->
              <template v-else>
                <li
                  v-for="sheet in vehicleFinanceSheets"
                  :key="sheet.id"
                  class="list-none"
                >
                  <div
                    class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
                  >
                    <!-- Header -->
                    <div class="flex items-start space-x-3 mb-3">
                      <input
                        type="checkbox"
                        :checked="isSelected(sheet.id)"
                        @change="toggleSelection(sheet.id)"
                        class="w-4 h-4 text-primary border border-gray-300 rounded focus:ring-0 focus:outline-none mt-1"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2 mb-1">
                          <h3
                            class="text-base font-bold text-gray-900 group-hover:text-primary transition-colors truncate"
                          >
                            {{ getVehicleTitle(sheet) }}
                          </h3>
                          <span
                            v-if="sheet.updated_at"
                            class="flex-shrink-0 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ml-2"
                          >
                            {{ formatRelativeTime(sheet.updated_at) }}
                          </span>
                        </div>
                        <p class="text-xs text-gray-500 truncate">
                          {{ sheet.dealership_name || 'No dealership specified' }}
                        </p>
                      </div>
                    </div>

                    <!-- Monthly Payment -->
                    <div class="bg-gray-50 rounded-lg p-3 mb-3">
                      <div class="text-center">
                        <span class="text-gray-500 text-xs uppercase tracking-wide block mb-1"
                          >Monthly Payment</span
                        >
                        <div class="font-bold text-green-600 text-xl">
                          ${{ formatCurrency(getSheetCalculations(sheet).monthlyPayment) }}
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-3 gap-2">
                      <RouterLink :to="`/estimates/financing/${sheet.id}/edit`">
                        <button
                          class="w-full bg-primary hover:bg-primary-shade-1 text-white px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center space-x-1"
                        >
                          <EyeIcon class="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                      </RouterLink>
                      <button
                        @click="deleteSheet(sheet.id)"
                        class="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center space-x-1"
                      >
                        <TrashIcon class="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                      <button
                        @click="toggleCardDetails(sheet.id)"
                        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>{{ isCardExpanded(sheet.id) ? 'Less' : 'More' }}</span>
                        <svg
                          class="w-3 h-3 transition-transform"
                          :class="{ 'rotate-180': isCardExpanded(sheet.id) }"
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

                    <!-- Expanded Details -->
                    <div v-if="isCardExpanded(sheet.id)" class="space-y-4 mt-4">
                      <div>
                        <h4 class="font-semibold text-gray-900 text-sm mb-2">Vehicle Information</h4>
                        <div class="text-sm text-gray-600 space-y-1">
                          <div class="flex justify-between">
                            <span>MSRP:</span>
                            <span class="font-medium">${{ formatCurrency(sheet.msrp || 0) }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span>Purchase Price:</span>
                            <span class="font-medium">${{ formatCurrency(getSheetCalculations(sheet).purchasePrice) }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="bg-gray-50 rounded-lg p-3">
                        <h4 class="font-semibold text-gray-900 text-sm mb-2">Financing Terms</h4>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span class="text-gray-500 text-xs uppercase tracking-wide block">Interest Rate</span>
                            <div class="font-bold text-gray-900">{{ sheet.interest_rate || 0 }}%</div>
                          </div>
                          <div>
                            <span class="text-gray-500 text-xs uppercase tracking-wide block">Loan Term</span>
                            <div class="font-bold text-gray-900">{{ sheet.finance_term || 0 }} mo</div>
                          </div>
                          <div>
                            <span class="text-gray-500 text-xs uppercase tracking-wide block">Down Payment</span>
                            <div class="font-bold text-gray-900">${{ formatCurrency(sheet.down_payment || 0) }}</div>
                          </div>
                          <div>
                            <span class="text-gray-500 text-xs uppercase tracking-wide block">Amount Financed</span>
                            <div class="font-bold text-gray-900">${{ formatCurrency(getSheetCalculations(sheet).loanAmount) }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <!-- Add new sheet -->
                <li class="list-none">
                  <RouterLink to="/estimates/financing/create">
                    <div
                      class="bg-white rounded-lg p-8 text-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
                    >
                      <div class="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <PlusIcon class="h-8 w-8 text-primary" />
                      </div>
                      <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        Create New Estimate
                      </h3>
                      <p class="text-gray-600 text-sm">Start a new vehicle financing calculation</p>
                    </div>
                  </RouterLink>
                </li>
              </template>
            </ul>
          </section>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Quick Stats -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Estimates</span>
                <span class="font-bold text-primary">{{ vehicleFinanceSheets.length }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Recent Activity</span>
                <span class="text-xs text-gray-500">{{ vehicleFinanceSheets.length ? 'Active' : 'No activity' }}</span>
              </div>
            </div>
          </div>

          <!-- Pro Tips -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Smart Shopping Tips</h3>
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-sm text-gray-600">Always negotiate the total price before discussing financing terms</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-sm text-gray-600">Compare multiple financing scenarios to find the best deal</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-sm text-gray-600">Know your credit score and get pre-approved before shopping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
