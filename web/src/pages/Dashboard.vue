<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { BanknotesIcon, CurrencyDollarIcon, TagIcon, PlusIcon } from '@heroicons/vue/24/outline'
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

const hasActivity = computed(() => {
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
  <div class="py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>

      <template v-else>
        <!-- Greeting -->
        <div class="mb-8">
          <h1 class="text-2xl font-medium text-primary">
            {{ fullName ? `Welcome back, ${fullName.split(' ')[0]}` : 'Welcome back' }}
          </h1>
          <p class="mt-1 text-text-muted">Here's what you've been working on.</p>
        </div>

        <!-- Recent Activity -->
        <div v-if="hasActivity" class="space-y-3">
          <!-- Finance Sheets -->
          <RouterLink
            v-for="sheet in vehicleFinanceSheets.slice(0, 5)"
            :key="'finance-' + sheet.id"
            :to="`/estimates/financing/${sheet.id}/edit`"
            class="block bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:border-accent/30 transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-info/10 flex-shrink-0">
                <BanknotesIcon class="h-5 w-5 text-info" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-primary truncate">
                  {{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}
                </h3>
                <p class="text-sm text-text-muted">
                  Financing · ${{ sheet.vehicle_price?.toLocaleString() }} · {{ sheet.loan_term_months }} months
                </p>
              </div>
              <div class="text-text-muted">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </RouterLink>

          <!-- Lease Sheets -->
          <RouterLink
            v-for="sheet in vehicleLeaseSheets.slice(0, 5)"
            :key="'lease-' + sheet.id"
            :to="`/estimates/leasing/${sheet.id}/edit`"
            class="block bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:border-accent/30 transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-success/10 flex-shrink-0">
                <CurrencyDollarIcon class="h-5 w-5 text-success" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-primary truncate">
                  {{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}
                </h3>
                <p class="text-sm text-text-muted">
                  Leasing · ${{ sheet.vehicle_price?.toLocaleString() }} · {{ sheet.lease_term_months }} months
                </p>
              </div>
              <div class="text-text-muted">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="max-w-sm mx-auto">
            <p class="text-text-muted mb-6">You haven't created any estimates yet. Get started with one of these tools.</p>

            <div class="space-y-3">
              <RouterLink
                to="/price-tracker/create"
                class="flex items-center gap-3 bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:border-accent/30 transition-all"
              >
                <div class="p-2 rounded-lg bg-accent/10">
                  <TagIcon class="h-5 w-5 text-accent" />
                </div>
                <div class="flex-1 text-left">
                  <h3 class="font-medium text-primary">Track a price</h3>
                  <p class="text-sm text-text-muted">Monitor price changes over time</p>
                </div>
                <PlusIcon class="h-5 w-5 text-text-muted" />
              </RouterLink>

              <RouterLink
                to="/estimates/financing/create"
                class="flex items-center gap-3 bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:border-accent/30 transition-all"
              >
                <div class="p-2 rounded-lg bg-info/10">
                  <BanknotesIcon class="h-5 w-5 text-info" />
                </div>
                <div class="flex-1 text-left">
                  <h3 class="font-medium text-primary">Calculate financing</h3>
                  <p class="text-sm text-text-muted">See monthly payments and total cost</p>
                </div>
                <PlusIcon class="h-5 w-5 text-text-muted" />
              </RouterLink>

              <RouterLink
                to="/estimates/leasing/create"
                class="flex items-center gap-3 bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-4 hover:border-accent/30 transition-all"
              >
                <div class="p-2 rounded-lg bg-success/10">
                  <CurrencyDollarIcon class="h-5 w-5 text-success" />
                </div>
                <div class="flex-1 text-left">
                  <h3 class="font-medium text-primary">Calculate leasing</h3>
                  <p class="text-sm text-text-muted">Understand lease terms and costs</p>
                </div>
                <PlusIcon class="h-5 w-5 text-text-muted" />
              </RouterLink>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
