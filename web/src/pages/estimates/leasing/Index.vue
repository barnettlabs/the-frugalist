<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import {
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  ScaleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ArrowUpRightIcon,
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
  <div class="pb-16">
    <SectionHeader
      eyebrow="Compute · Leasing"
      title="Read the lease before you sign it."
      description="Money factor → APR. Residual mechanics. The fees that quietly add up. The math the salesperson hopes you’ll skip."
      :icon="CurrencyDollarIcon"
      :index="vehicleLeaseSheets.length || 0"
    >
      <template #aside>
        <div class="mt-4 flex items-center gap-2">
          <RouterLink
            to="/learning/leasing"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-accent-dark transition-colors"
          >
            <BookOpenIcon class="h-3.5 w-3.5" />
            Read the leasing guide
          </RouterLink>
        </div>
      </template>

      <template #actions>
        <button
          v-if="selectedSheets.size >= 2"
          @click="startComparison"
          class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-signal text-white text-sm font-medium hover:bg-signal-dark transition-colors"
        >
          <ScaleIcon class="h-4 w-4" />
          Compare ({{ selectedSheets.size }})
        </button>
        <RouterLink
          to="/estimates/leasing/create"
          class="group inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <PlusIcon class="h-4 w-4" />
          New estimate
        </RouterLink>
      </template>
    </SectionHeader>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Spinner size="lg" color="accent" />
      </div>

      <!-- Empty -->
      <section v-else-if="!vehicleLeaseSheets.length" class="surface-ink paper-grain rounded-md border border-primary-dark/40 p-10 sm:p-14 relative overflow-hidden">
        <div class="grid grid-cols-12 gap-6 items-center relative z-10">
          <div class="col-span-12 lg:col-span-8">
            <p class="eyebrow text-white/60 mb-4">No lease estimates yet</p>
            <h2 class="font-display font-medium text-white tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
              Type the offer in. <span class="italic text-signal-light">Watch it tell on itself.</span>
            </h2>
            <p class="mt-5 text-sm text-white/70 max-w-md">
              Money factor, residual, term, fees. Every variable in the lease formula, made plain.
            </p>
          </div>
          <div class="col-span-12 lg:col-span-4 lg:text-right">
            <RouterLink
              to="/estimates/leasing/create"
              class="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 bg-surface text-primary text-sm font-medium hover:bg-tan transition-colors"
            >
              <PlusIcon class="h-4 w-4" />
              Create first estimate
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Sheets Grid -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="sheet in vehicleLeaseSheets"
          :key="sheet.id"
          class="card h-full overflow-hidden flex flex-col group"
        >
          <div class="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
            <label class="flex items-center gap-2 cursor-pointer select-none" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(sheet.id)"
                @change="toggleSelection(sheet.id)"
                class="w-3.5 h-3.5 text-primary border-2 border-border rounded-sm focus:ring-0 focus:outline-none bg-surface cursor-pointer"
              />
              <span class="eyebrow !text-[0.625rem]" :class="isSelected(sheet.id) ? 'text-primary' : ''">
                Compare
              </span>
            </label>
            <div class="flex items-center gap-0.5" @click.stop>
              <button
                @click="toggleCardDetails(sheet.id)"
                class="p-1.5 rounded text-text-muted hover:text-primary hover:bg-surface-dark transition-colors"
              >
                <ChevronDownIcon :class="['h-3.5 w-3.5 transition-transform', isCardExpanded(sheet.id) && 'rotate-180']" />
              </button>
              <button
                @click="openDeleteDialog(sheet)"
                class="p-1.5 rounded text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <TrashIcon class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <RouterLink :to="`/estimates/leasing/${sheet.id}/edit`" class="flex-1 flex flex-col p-4">
            <p class="eyebrow mb-2">{{ sheet.dealership_name || 'No dealership' }}</p>

            <h3 class="font-display text-2xl text-primary tracking-tight leading-tight group-hover:text-accent-dark transition-colors">
              <span class="numeral text-base text-text-muted/80 mr-1">{{ sheet.vehicle_year || '·' }}</span>
              {{ sheet.vehicle_make }}
              <span class="italic text-text-muted/80">{{ sheet.vehicle_model }}</span>
            </h3>

            <div class="mt-6 flex items-baseline justify-between">
              <div>
                <p class="eyebrow mb-1.5">Monthly</p>
                <p class="figure text-4xl text-primary leading-none">
                  ${{ formatCurrency(getMonthlyPayment(sheet)) }}
                </p>
              </div>
              <div class="text-right">
                <p class="numeral text-xs text-text-muted">{{ sheet.lease_term || 0 }} mo</p>
                <p class="numeral text-xs text-text-muted">{{ sheet.residual_percent || 0 }}% res</p>
              </div>
            </div>

            <div v-if="isCardExpanded(sheet.id)" class="mt-5 pt-5 border-t border-border space-y-3 text-sm" @click.stop>
              <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p class="eyebrow !text-[0.625rem]">MSRP</p>
                  <p class="numeral text-primary">${{ formatCurrency(sheet.msrp || 0) }}</p>
                </div>
                <div>
                  <p class="eyebrow !text-[0.625rem]">Cap cost</p>
                  <p class="numeral text-primary">${{ formatCurrency(sheet.capitalized_cost || 0) }}</p>
                </div>
                <div>
                  <p class="eyebrow !text-[0.625rem]">Money factor</p>
                  <p class="numeral text-primary">{{ sheet.money_factor || 0 }}</p>
                </div>
                <div>
                  <p class="eyebrow !text-[0.625rem]">Residual</p>
                  <p class="numeral text-primary">${{ formatCurrency(getResidualValue(sheet)) }}</p>
                </div>
              </div>
              <div class="bg-tan/60 border border-border rounded-md px-3 py-2 flex items-center justify-between">
                <span class="eyebrow">Down</span>
                <span class="numeral text-primary">${{ formatCurrency(sheet.down_payment || 0) }}</span>
              </div>
            </div>

            <div class="mt-auto pt-4 flex items-center justify-between text-xs">
              <span class="numeral text-text-muted">${{ formatCurrency(sheet.msrp || 0) }} MSRP</span>
              <span class="inline-flex items-center gap-1 font-medium text-primary group-hover:text-accent-dark transition-colors">
                Open <ArrowUpRightIcon class="h-3 w-3" />
              </span>
            </div>
          </RouterLink>
        </article>

        <RouterLink
          to="/estimates/leasing/create"
          class="group flex flex-col items-center justify-center min-h-[260px] rounded-md border border-dashed border-border-strong text-center p-6 hover:border-primary hover:bg-surface transition-colors"
        >
          <div class="w-12 h-12 rounded-md bg-primary text-surface flex items-center justify-center mb-3">
            <PlusIcon class="h-5 w-5" />
          </div>
          <p class="font-display text-lg text-primary tracking-tight">New estimate</p>
          <p class="text-xs text-text-muted mt-1">Run another offer through</p>
        </RouterLink>
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
