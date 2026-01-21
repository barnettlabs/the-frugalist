<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import {
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  ScaleIcon,
  EyeIcon,
  BookOpenIcon,
  ChevronDownIcon,
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

// Confirmation dialog state
const showDeleteDialog = ref(false)
const selectedSheet = ref<VehicleLeaseSheet | null>(null)
const actionLoading = ref(false)

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

const openDeleteDialog = (sheet: VehicleLeaseSheet) => {
  selectedSheet.value = sheet
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedSheet.value) return
  actionLoading.value = true
  try {
    await leaseApi.delete(selectedSheet.value.id)
    await fetchSheets()
    showDeleteDialog.value = false
    selectedSheet.value = null
  } catch (error) {
    console.error('Error deleting sheet:', error)
  } finally {
    actionLoading.value = false
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

const getResidualValue = (sheet: VehicleLeaseSheet) => {
  if (!sheet.msrp || !sheet.residual_percent) return 0
  return sheet.msrp * (sheet.residual_percent / 100)
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
  <div class="min-h-screen">
    <!-- Hero Section -->
    <header class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-blue-900"></div>
      <div class="dotted-background relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="max-w-2xl">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-white/20 rounded-lg mr-3">
                <CurrencyDollarIcon class="h-6 w-6 text-white" />
              </div>
              <span class="text-white/70 text-sm font-medium">Lease Calculator</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-medium text-white mb-4 tracking-tight">
              Understand your lease
            </h1>
            <p class="text-lg text-white/80 leading-relaxed">
              Understand lease terms, money factors, and residual values before signing.
            </p>
            <RouterLink
              to="/learning/leasing"
              class="inline-flex items-center gap-2 mt-4 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              <BookOpenIcon class="h-4 w-4" />
              <span>Learn about leasing terms</span>
            </RouterLink>
          </div>
          <div class="flex-shrink-0 flex items-center gap-3">
            <button
              v-if="selectedSheets.size >= 2"
              @click="startComparison"
              class="bg-success hover:bg-success/80 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2"
            >
              <ScaleIcon class="h-5 w-5" />
              <span>Compare ({{ selectedSheets.size }})</span>
            </button>
            <RouterLink to="/estimates/leasing/create">
              <button class="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 border border-white/20">
                <PlusIcon class="h-5 w-5" />
                <span>New Estimate</span>
              </button>
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <main class="py-8 lg:py-12 flex-1">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <Spinner size="lg" color="accent" />
        </div>

        <!-- Empty State -->
        <Card v-else-if="!vehicleLeaseSheets.length" class="text-center" padding="lg">
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
        </Card>

        <!-- Sheets Grid -->
        <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="sheet in vehicleLeaseSheets"
            :key="sheet.id"
            class="relative group"
          >
            <Card variant="interactive" padding="none" class="overflow-hidden h-full">
              <div class="p-4">
                <!-- Top Row: Compare Checkbox & Actions -->
                <div class="flex items-center justify-between mb-3">
                  <label
                    class="flex items-center gap-2 cursor-pointer select-none"
                    @click.stop
                  >
                    <input
                      type="checkbox"
                      :checked="isSelected(sheet.id)"
                      @change="toggleSelection(sheet.id)"
                      class="w-4 h-4 text-accent border-2 border-border rounded focus:ring-0 focus:outline-none bg-surface cursor-pointer"
                    />
                    <span class="text-xs font-medium" :class="isSelected(sheet.id) ? 'text-accent' : 'text-text-muted'">
                      Compare
                    </span>
                  </label>
                  <div class="flex items-center gap-1" @click.stop>
                    <button
                      @click="toggleCardDetails(sheet.id)"
                      class="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                      :title="isCardExpanded(sheet.id) ? 'Show less' : 'Show more'"
                    >
                      <ChevronDownIcon :class="['h-4 w-4 transition-transform', isCardExpanded(sheet.id) && 'rotate-180']" />
                    </button>
                    <button
                      @click="openDeleteDialog(sheet)"
                      class="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Delete estimate"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <!-- Metadata Row -->
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs text-text-muted">{{ sheet.dealership_name || 'No dealership' }}</span>
                  <span v-if="sheet.updated_at" class="text-xs text-text-muted">·</span>
                  <span v-if="sheet.updated_at" class="text-xs text-text-muted">{{ formatRelativeTime(sheet.updated_at) }}</span>
                </div>

                <RouterLink :to="`/estimates/leasing/${sheet.id}/edit`" class="block">

                  <!-- Vehicle Name -->
                  <h3 class="font-medium text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-3">
                    {{ getVehicleTitle(sheet) }}
                  </h3>

                  <!-- Monthly Payment -->
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xs text-text-muted uppercase tracking-wide block mb-1">Monthly Payment</span>
                      <span class="text-2xl font-semibold text-success">
                        ${{ formatCurrency(getMonthlyPayment(sheet)) }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-xs text-text-muted block">{{ sheet.lease_term || 0 }} mo</span>
                      <span class="text-xs text-text-muted">{{ sheet.residual_percent || 0 }}% residual</span>
                    </div>
                  </div>

                </RouterLink>

                <!-- Expanded Details -->
                <div v-if="isCardExpanded(sheet.id)" class="mt-4 pt-4 border-t border-border space-y-3">
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span class="text-text-muted text-xs uppercase tracking-wide block">MSRP</span>
                      <div class="font-medium text-primary">${{ formatCurrency(sheet.msrp || 0) }}</div>
                    </div>
                    <div>
                      <span class="text-text-muted text-xs uppercase tracking-wide block">Cap Cost</span>
                      <div class="font-medium text-primary">${{ formatCurrency(sheet.capitalized_cost || 0) }}</div>
                    </div>
                    <div>
                      <span class="text-text-muted text-xs uppercase tracking-wide block">Money Factor</span>
                      <div class="font-medium text-primary">{{ sheet.money_factor || 0 }}</div>
                    </div>
                    <div>
                      <span class="text-text-muted text-xs uppercase tracking-wide block">Residual Value</span>
                      <div class="font-medium text-primary">${{ formatCurrency(getResidualValue(sheet)) }}</div>
                    </div>
                  </div>
                  <div class="bg-background rounded-lg p-3">
                    <div class="flex justify-between text-sm">
                      <span class="text-text-muted">Down Payment</span>
                      <span class="font-medium text-primary">${{ formatCurrency(sheet.down_payment || 0) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span class="text-xs text-text-muted">
                    ${{ formatCurrency(sheet.msrp || 0) }} MSRP
                  </span>
                  <RouterLink :to="`/estimates/leasing/${sheet.id}/edit`">
                    <button class="text-xs font-medium text-accent hover:text-accent-dark flex items-center gap-1 transition-colors">
                      <span>View Details</span>
                      <EyeIcon class="h-3.5 w-3.5" />
                    </button>
                  </RouterLink>
                </div>
              </div>
            </Card>
          </div>

          <!-- Add New Card -->
          <RouterLink to="/estimates/leasing/create" class="block">
            <Card variant="interactive" class="h-full min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-accent/30 hover:border-accent bg-transparent" padding="lg">
              <PlusIcon class="h-8 w-8 text-accent mb-2" />
              <span class="font-medium text-primary">New Estimate</span>
            </Card>
          </RouterLink>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Estimate"
      :message="`Are you sure you want to delete the estimate for '${selectedSheet ? getVehicleTitle(selectedSheet) : 'this vehicle'}'? This action cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      :loading="actionLoading"
      @confirm="confirmDelete"
      @close="showDeleteDialog = false"
    />
  </div>
</template>
