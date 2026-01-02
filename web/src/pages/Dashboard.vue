<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { dashboardApi, type DashboardStats } from '@/api/dashboard'

const authStore = useAuthStore()

interface VehicleSheet {
  id: number
  vehicle_year: number
  vehicle_make: string
  vehicle_model: string
  vehicle_price: number
  loan_term_months?: number
  lease_term_months?: number
  updated_at?: string
}

const loading = ref(true)
const stats = ref<DashboardStats | null>(null)
const vehicleFinanceSheets = ref<VehicleSheet[]>([])
const vehicleLeaseSheets = ref<VehicleSheet[]>([])

const fullName = computed(() => authStore.fullName)
const firstName = computed(() => fullName.value?.split(' ')[0] || '')

const totalEstimates = computed(() => {
  return (stats.value?.finance_sheets_count ?? 0) + (stats.value?.lease_sheets_count ?? 0)
})

const hasRecentActivity = computed(() => {
  return (vehicleFinanceSheets.value?.length ?? 0) + (vehicleLeaseSheets.value?.length ?? 0) > 0
})

const loadDashboard = async () => {
  try {
    const data = await dashboardApi.getStats()
    stats.value = data
    vehicleFinanceSheets.value = data.recent_finance_sheets as VehicleSheet[]
    vehicleLeaseSheets.value = data.recent_lease_sheets as VehicleSheet[]
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-semibold text-primary">
            {{ firstName ? `Welcome back, ${firstName}` : 'Dashboard' }}
          </h1>
          <p class="mt-1 text-text-muted">Your frugal savings at a glance</p>
        </div>

        <!-- KPI Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <!-- Tracked Products -->
          <div class="bg-surface/80 backdrop-blur-sm rounded-xl border border-border p-5 relative overflow-hidden group hover:border-accent/30 transition-all">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full"></div>
            <div class="flex items-start justify-between relative">
              <div>
                <p class="text-sm font-medium text-text-muted mb-1">Tracking</p>
                <p class="text-3xl font-bold text-primary">{{ stats?.tracked_products_count ?? 0 }}</p>
                <p class="text-xs text-text-muted mt-1">products watched</p>
              </div>
              <div class="p-2.5 rounded-lg bg-accent/10">
                <EyeIcon class="h-5 w-5 text-accent" />
              </div>
            </div>
            <RouterLink
              to="/watch"
              class="mt-4 inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
            >
              View all
              <ChevronRightIcon class="h-4 w-4 ml-0.5" />
            </RouterLink>
          </div>

          <!-- Finance Estimates -->
          <div class="bg-surface/80 backdrop-blur-sm rounded-xl border border-border p-5 relative overflow-hidden group hover:border-info/30 transition-all">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-info/5 to-transparent rounded-bl-full"></div>
            <div class="flex items-start justify-between relative">
              <div>
                <p class="text-sm font-medium text-text-muted mb-1">Finance</p>
                <p class="text-3xl font-bold text-primary">{{ stats?.finance_sheets_count ?? 0 }}</p>
                <p class="text-xs text-text-muted mt-1">loan estimates</p>
              </div>
              <div class="p-2.5 rounded-lg bg-info/10">
                <BanknotesIcon class="h-5 w-5 text-info" />
              </div>
            </div>
            <RouterLink
              to="/estimates"
              class="mt-4 inline-flex items-center text-sm text-info hover:text-info/80 transition-colors"
            >
              View all
              <ChevronRightIcon class="h-4 w-4 ml-0.5" />
            </RouterLink>
          </div>

          <!-- Lease Estimates -->
          <div class="bg-surface/80 backdrop-blur-sm rounded-xl border border-border p-5 relative overflow-hidden group hover:border-success/30 transition-all">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-success/5 to-transparent rounded-bl-full"></div>
            <div class="flex items-start justify-between relative">
              <div>
                <p class="text-sm font-medium text-text-muted mb-1">Lease</p>
                <p class="text-3xl font-bold text-primary">{{ stats?.lease_sheets_count ?? 0 }}</p>
                <p class="text-xs text-text-muted mt-1">lease estimates</p>
              </div>
              <div class="p-2.5 rounded-lg bg-success/10">
                <CurrencyDollarIcon class="h-5 w-5 text-success" />
              </div>
            </div>
            <RouterLink
              to="/estimates"
              class="mt-4 inline-flex items-center text-sm text-success hover:text-success/80 transition-colors"
            >
              View all
              <ChevronRightIcon class="h-4 w-4 ml-0.5" />
            </RouterLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">Quick Actions</h2>
          <div class="flex flex-wrap gap-2">
            <RouterLink
              to="/watch/create"
              class="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-sm rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-sm font-medium text-primary"
            >
              <PlusIcon class="h-4 w-4 text-accent" />
              Track Price
            </RouterLink>
            <RouterLink
              to="/estimates/financing/create"
              class="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-sm rounded-lg border border-border hover:border-info/50 hover:bg-info/5 transition-all text-sm font-medium text-primary"
            >
              <CalculatorIcon class="h-4 w-4 text-info" />
              Finance Estimate
            </RouterLink>
            <RouterLink
              to="/estimates/leasing/create"
              class="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-sm rounded-lg border border-border hover:border-success/50 hover:bg-success/5 transition-all text-sm font-medium text-primary"
            >
              <CalculatorIcon class="h-4 w-4 text-success" />
              Lease Estimate
            </RouterLink>
          </div>
        </div>

        <!-- Recent Activity -->
        <div v-if="hasRecentActivity">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-medium text-text-muted uppercase tracking-wide">Recent Activity</h2>
            <RouterLink to="/estimates" class="text-sm text-accent hover:text-accent/80 transition-colors">
              View all
            </RouterLink>
          </div>

          <div class="bg-surface/60 backdrop-blur-sm rounded-xl border border-border divide-y divide-border">
            <!-- Finance Sheets -->
            <RouterLink
              v-for="sheet in vehicleFinanceSheets.slice(0, 3)"
              :key="'finance-' + sheet.id"
              :to="`/estimates/financing/${sheet.id}/edit`"
              class="flex items-center gap-4 p-4 hover:bg-surface/80 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div class="p-2 rounded-lg bg-info/10 flex-shrink-0">
                <BanknotesIcon class="h-4 w-4 text-info" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-primary text-sm truncate">
                  {{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}
                </p>
                <p class="text-xs text-text-muted">
                  Finance · ${{ sheet.vehicle_price?.toLocaleString() }}
                </p>
              </div>
              <ChevronRightIcon class="h-4 w-4 text-text-muted flex-shrink-0" />
            </RouterLink>

            <!-- Lease Sheets -->
            <RouterLink
              v-for="sheet in vehicleLeaseSheets.slice(0, 3)"
              :key="'lease-' + sheet.id"
              :to="`/estimates/leasing/${sheet.id}/edit`"
              class="flex items-center gap-4 p-4 hover:bg-surface/80 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div class="p-2 rounded-lg bg-success/10 flex-shrink-0">
                <CurrencyDollarIcon class="h-4 w-4 text-success" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-primary text-sm truncate">
                  {{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}
                </p>
                <p class="text-xs text-text-muted">
                  Lease · ${{ sheet.vehicle_price?.toLocaleString() }}
                </p>
              </div>
              <ChevronRightIcon class="h-4 w-4 text-text-muted flex-shrink-0" />
            </RouterLink>
          </div>
        </div>

        <!-- Empty State (only show when no activity at all) -->
        <div v-else-if="totalEstimates === 0 && (stats?.tracked_products_count ?? 0) === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
            <ArrowTrendingUpIcon class="h-8 w-8 text-accent" />
          </div>
          <h3 class="text-lg font-medium text-primary mb-2">Get Started</h3>
          <p class="text-text-muted mb-6 max-w-sm mx-auto">
            Start tracking prices or create your first estimate to see your activity here.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
