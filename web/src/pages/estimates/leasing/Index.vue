<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import {
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  ScaleIcon,
  EyeIcon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime } from '@/utils/time'
import { leaseApi } from '@/api/lease'
import { LeaseCalculator } from '@/utils/leaseCalculator'

interface VehicleLeaseSheet {
  id: number
  sheet_name?: string
  dealership_name?: string
  msrp?: number
  capitalized_cost?: number
  down_payment?: number
  vehicle_year?: number
  vehicle_make?: string
  vehicle_model?: string
  vehicle_trim?: string
  money_factor?: number
  lease_term?: number
  residual_percent?: number
  monthly_payment?: number
  created_at?: string
  updated_at?: string
}

const router = useRouter()

const vehicleLeaseSheets = ref<VehicleLeaseSheet[]>([])
const loading = ref(true)
const expandedCards = ref<Set<number>>(new Set())
const selectedSheets = ref<Set<number>>(new Set())

const fetchSheets = async () => {
  try {
    const data = await leaseApi.getAll()
    vehicleLeaseSheets.value = data as VehicleLeaseSheet[]
  } catch (error) {
    console.error('Error fetching lease sheets:', error)
  } finally {
    loading.value = false
  }
}

const deleteSheet = async (sheetId: number) => {
  if (confirm('Are you sure you want to delete this estimate?')) {
    try {
      await leaseApi.delete(sheetId)
      await fetchSheets()
    } catch (error) {
      console.error('Error deleting sheet:', error)
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

const getMonthlyPayment = (sheet: VehicleLeaseSheet) => {
  const calculator = new LeaseCalculator(sheet as any)
  return calculator.calculateLeasePayment()
}

const startComparison = () => {
  if (selectedSheets.value.size >= 2) {
    const sheetIds = Array.from(selectedSheets.value).join(',')
    router.push(`/estimates/leasing/compare?sheets=${sheetIds}`)
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
        title="Lease Calculator"
        description="Understand lease terms, money factors, and residual values"
        back-link="/dashboard"
        back-label="Dashboard"
      >
        <template #subtitle>
          <RouterLink
            to="/learning/leasing"
            class="inline-flex items-center gap-2 mt-3 text-accent hover:text-accent-dark transition-colors text-sm font-medium"
          >
            <BookOpenIcon class="h-4 w-4" />
            <span>Learn about leasing terms</span>
          </RouterLink>
        </template>
        <template #actions>
          <button
            v-if="selectedSheets.size >= 2"
            @click="startComparison"
            class="bg-success hover:bg-success/80 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2"
          >
            <ScaleIcon class="h-5 w-5" />
            <span>Compare</span>
          </button>

          <RouterLink to="/estimates/leasing/create">
            <button
              class="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2"
            >
              <PlusIcon class="h-5 w-5" />
              <span>New Estimate</span>
            </button>
          </RouterLink>
        </template>
      </PageHeader>

      <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6">
        <div class="grid grid-cols-1 gap-2 lg:col-span-2">
          <section aria-labelledby="lease-estimates-overview-title">
            <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Loading state -->
              <div v-if="loading" class="col-span-full">
                <div class="flex items-center justify-center p-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else-if="!vehicleLeaseSheets.length" class="col-span-full">
                <div class="bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-12 text-center">
                  <div class="p-4 rounded-xl bg-success/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CurrencyDollarIcon class="h-8 w-8 text-success" />
                  </div>
                  <h3 class="text-lg font-medium text-primary mb-2">No lease estimates yet</h3>
                  <p class="text-text-muted mb-6">Calculate monthly payments and understand lease terms</p>
                  <RouterLink to="/estimates/leasing/create">
                    <button class="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 mx-auto">
                      <PlusIcon class="h-5 w-5" />
                      <span>Create First Estimate</span>
                    </button>
                  </RouterLink>
                </div>
              </div>

              <!-- Sheets list -->
              <template v-else>
                <li v-for="sheet in vehicleLeaseSheets" :key="sheet.id" class="list-none">
                  <div class="bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:border-accent/30 transition-all group">
                    <!-- Header -->
                    <div class="flex items-start space-x-3 mb-3">
                      <input
                        type="checkbox"
                        :checked="isSelected(sheet.id)"
                        @change="toggleSelection(sheet.id)"
                        class="w-4 h-4 text-accent border border-border rounded focus:ring-0 focus:outline-none mt-1"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2 mb-1">
                          <h3 class="text-base font-medium text-primary group-hover:text-accent transition-colors truncate">
                            {{ getVehicleTitle(sheet) }}
                          </h3>
                          <span
                            v-if="sheet.updated_at"
                            class="flex-shrink-0 bg-background text-text-muted text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ml-2"
                          >
                            {{ formatRelativeTime(sheet.updated_at) }}
                          </span>
                        </div>
                        <p class="text-xs text-text-muted truncate">
                          {{ sheet.dealership_name || 'No dealership specified' }}
                        </p>
                      </div>
                    </div>

                    <!-- Monthly Payment -->
                    <div class="bg-background rounded-lg p-3 mb-3">
                      <div class="text-center">
                        <span class="text-text-muted text-xs uppercase tracking-wide block mb-1">Monthly Payment</span>
                        <div class="font-medium text-success text-xl">
                          ${{ formatCurrency(getMonthlyPayment(sheet)) }}
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-3 gap-2">
                      <RouterLink :to="`/estimates/leasing/${sheet.id}/edit`">
                        <button class="w-full bg-accent hover:bg-accent-dark text-white px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center space-x-1">
                          <EyeIcon class="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                      </RouterLink>
                      <button
                        @click="deleteSheet(sheet.id)"
                        class="w-full bg-danger hover:bg-danger/80 text-white px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center space-x-1"
                      >
                        <TrashIcon class="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                      <button
                        @click="toggleCardDetails(sheet.id)"
                        class="w-full bg-background hover:bg-border text-text-muted px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>{{ isCardExpanded(sheet.id) ? 'Less' : 'More' }}</span>
                        <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': isCardExpanded(sheet.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                    </div>

                    <!-- Expanded Details -->
                    <div v-if="isCardExpanded(sheet.id)" class="space-y-4 mt-4">
                      <div class="bg-background rounded-lg p-3">
                        <h4 class="font-medium text-primary text-sm mb-2">Lease Terms</h4>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span class="text-text-muted text-xs uppercase tracking-wide block">MSRP</span>
                            <div class="font-medium text-primary">${{ formatCurrency(sheet.msrp || 0) }}</div>
                          </div>
                          <div>
                            <span class="text-text-muted text-xs uppercase tracking-wide block">Term</span>
                            <div class="font-medium text-primary">{{ sheet.lease_term || 0 }} mo</div>
                          </div>
                          <div>
                            <span class="text-text-muted text-xs uppercase tracking-wide block">Money Factor</span>
                            <div class="font-medium text-primary">{{ sheet.money_factor || 0 }}</div>
                          </div>
                          <div>
                            <span class="text-text-muted text-xs uppercase tracking-wide block">Residual</span>
                            <div class="font-medium text-primary">{{ sheet.residual_percent || 0 }}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <!-- Add new sheet -->
                <li class="list-none">
                  <RouterLink to="/estimates/leasing/create">
                    <div class="bg-surface/60 backdrop-blur-sm rounded-lg p-8 text-center border-2 border-dashed border-accent/20 hover:border-accent/40 transition-colors cursor-pointer group">
                      <div class="p-3 rounded-xl bg-accent/10 w-fit mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                        <PlusIcon class="h-8 w-8 text-accent" />
                      </div>
                      <h3 class="text-lg font-medium text-primary mb-2 group-hover:text-accent transition-colors">
                        Create New Estimate
                      </h3>
                      <p class="text-text-muted text-sm">Start a new vehicle leasing calculation</p>
                    </div>
                  </RouterLink>
                </li>
              </template>
            </ul>
          </section>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Quick Stats -->
          <div class="bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-6">
            <h3 class="text-lg font-medium text-primary mb-4">Overview</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-text-muted">Total Estimates</span>
                <span class="font-medium text-accent">{{ vehicleLeaseSheets.length }}</span>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div class="bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-6">
            <h3 class="text-lg font-medium text-primary mb-4">Tips</h3>
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-sm text-text-muted">Negotiate the capitalized cost before discussing monthly payments</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-sm text-text-muted">A lower money factor means less interest paid over the term</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-sm text-text-muted">Consider your annual mileage needs when comparing leases</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
