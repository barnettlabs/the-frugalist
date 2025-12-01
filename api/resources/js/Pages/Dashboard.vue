<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  UserCircleIcon,
  UserIcon,
  BuildingStorefrontIcon,
  TagIcon,
} from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import type { Component } from 'vue'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface VehicleSheet {
  id: number
  vehicle_year: number
  vehicle_make: string
  vehicle_model: string
  vehicle_price: number
  loan_term_months?: number
  lease_term_months?: number
}

interface Props {
  user: User
  vehicleFinanceSheets: VehicleSheet[]
  vehicleLeaseSheets: VehicleSheet[]
}

const props = defineProps<Props>()

interface Stat {
  label: string
  value: string | number
}

interface SmartApp {
  icon: Component
  name: string
  description: string
  href: string
  iconForeground: string
  iconBackground: string
  status: string
}

const stats = computed((): Stat[] => [
  {
    label: 'total loan sheets',
    value: props.vehicleFinanceSheets?.length ?? '-',
  },
  {
    label: 'total lease sheets',
    value: props.vehicleLeaseSheets?.length ?? '-',
  },
  { label: 'dealers nearby (coming soon)', value: '??' },
])

const smartApps: SmartApp[] = [
  {
    icon: BanknotesIcon,
    name: 'Vehicle Finance Calculator',
    description:
      'Save money with intelligent financing calculations. Real-time rates and advanced analysis help you get the best deals.',
    href: '/estimates/financing',
    iconForeground: 'text-primary',
    iconBackground: 'bg-gradient-to-br from-primary/10 to-primary/20',
    status: 'Available',
  },
  {
    icon: CurrencyDollarIcon,
    name: 'Vehicle Lease Calculator',
    description:
      'Maximize savings with intelligent lease calculations. Tax benefits and advanced analysis for the best deals.',
    href: '/estimates/leasing',
    iconForeground: 'text-secondary',
    iconBackground: 'bg-gradient-to-br from-secondary/10 to-secondary/20',
    status: 'Available',
  },
  {
    icon: TagIcon,
    name: 'Smart Price Tracker',
    description:
      'Track product prices and get alerts when they drop. Never miss a deal on the products you want.',
    href: '/price-tracker',
    iconForeground: 'text-warning',
    iconBackground: 'bg-gradient-to-br from-warning/10 to-warning/20',
    status: 'Available',
  },
]

const fullName = computed((): string => {
  return `${props.user?.first_name ?? ''} ${props.user?.last_name ?? ''}`.trim()
})
</script>

<template>
  <Head title="Dashboard" />

  <AuthenticatedLayout :user="user">
    <main class="py-12 flex-1">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 class="sr-only">Dashboard</h1>

        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="h-12 w-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <img
                  v-if="user?.avatar_url"
                  class="h-full w-full object-cover"
                  :src="user?.avatar_url"
                  :alt="fullName"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
                <UserIcon v-else class="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900">{{ fullName || 'Welcome' }}</h2>
                <p class="text-sm text-gray-600 mt-1">{{ user?.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex items-center gap-4 mr-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-primary">
                    {{ (vehicleFinanceSheets?.length ?? 0) + (vehicleLeaseSheets?.length ?? 0) }}
                  </div>
                  <div class="text-sm text-gray-500">Estimates</div>
                </div>
              </div>
              <Link href="/profile">
                <button
                  class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150"
                >
                  Manage Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Sidebar -->
          <div class="lg:col-span-1 space-y-4">
            <!-- Quick Navigation -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 class="text-sm font-bold text-gray-900 mb-3">Quick Access</h3>
              <nav class="space-y-1">
                <Link
                  v-for="app in smartApps"
                  :key="app.name"
                  :href="app.href"
                  class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors group"
                >
                  <div class="p-1.5 rounded-md" :class="[app.iconBackground]">
                    <component :is="app.icon" class="h-4 w-4" :class="[app.iconForeground]" />
                  </div>
                  <span class="text-sm text-gray-700 group-hover:text-gray-900 flex-1 truncate">{{
                    app.name.replace('Vehicle ', '')
                  }}</span>
                  <svg
                    class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </nav>
            </div>

            <!-- Stats Card -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 class="text-sm font-bold text-gray-900 mb-3">Overview</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">Finance Sheets</span>
                  <span class="text-sm font-bold text-primary">{{
                    vehicleFinanceSheets?.length ?? 0
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">Lease Sheets</span>
                  <span class="text-sm font-bold text-secondary">{{
                    vehicleLeaseSheets?.length ?? 0
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Smart Tools Section -->
            <div>
              <div class="mb-4">
                <h2 class="text-xl font-bold text-gray-900 mb-1">Smart Tools</h2>
                <p class="text-sm text-gray-600">
                  Intelligent calculators to help you make informed decisions
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  v-for="app in smartApps"
                  :key="app.name"
                  :href="app.href"
                  class="group relative bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="p-2.5 rounded-lg" :class="[app.iconBackground]">
                      <component :is="app.icon" class="h-6 w-6" :class="[app.iconForeground]" />
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div
                        class="w-1.5 h-1.5 rounded-full animate-pulse"
                        :class="app.status === 'Available' ? 'bg-green-500' : 'bg-yellow-500'"
                      ></div>
                      <span class="text-xs text-gray-500">{{ app.status }}</span>
                    </div>
                  </div>
                  <h3 class="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {{ app.name }}
                  </h3>
                  <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                    {{ app.description }}
                  </p>
                  <div class="flex items-center gap-2">
                    <button
                      v-if="app.status === 'Available'"
                      @click.prevent="$inertia.visit(app.href + '/create')"
                      class="text-xs bg-primary hover:bg-primary-shade-1 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      Create New
                    </button>
                    <button
                      @click.prevent="$inertia.visit(app.href)"
                      class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </Link>
              </div>
            </div>

            <!-- Recent Activity -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 mb-1">Recent Activity</h2>
                  <p class="text-sm text-gray-600">Your latest estimates</p>
                </div>
                <Link
                  href="/estimates/financing"
                  class="text-xs text-primary hover:text-primary-shade-1 font-medium"
                >
                  View All →
                </Link>
              </div>

              <div class="space-y-3">
                <!-- Finance Sheets -->
                <div
                  v-if="vehicleFinanceSheets?.length > 0"
                  v-for="sheet in vehicleFinanceSheets.slice(0, 3)"
                  :key="'finance-' + sheet.id"
                  class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 flex-1 min-w-0">
                      <div class="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <component :is="BanknotesIcon" class="h-4 w-4 text-primary" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="font-bold text-sm text-gray-900 truncate">
                            {{ sheet.vehicle_year }} {{ sheet.vehicle_make }}
                            {{ sheet.vehicle_model }}
                          </h3>
                          <span
                            class="flex-shrink-0 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                          >
                            Finance
                          </span>
                        </div>
                        <p class="text-xs text-gray-600">
                          ${{ sheet.vehicle_price?.toLocaleString() }} •
                          {{ sheet.loan_term_months }} months
                        </p>
                      </div>
                    </div>
                    <Link :href="`/estimates/financing/${sheet.id}/edit`">
                      <button
                        class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors flex-shrink-0"
                      >
                        Edit
                      </button>
                    </Link>
                  </div>
                </div>

                <!-- Lease Sheets -->
                <div
                  v-if="vehicleLeaseSheets?.length > 0"
                  v-for="sheet in vehicleLeaseSheets.slice(0, 3)"
                  :key="'lease-' + sheet.id"
                  class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 flex-1 min-w-0">
                      <div class="p-2 rounded-lg bg-secondary/10 flex-shrink-0">
                        <component :is="CurrencyDollarIcon" class="h-4 w-4 text-secondary" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="font-bold text-sm text-gray-900 truncate">
                            {{ sheet.vehicle_year }} {{ sheet.vehicle_make }}
                            {{ sheet.vehicle_model }}
                          </h3>
                          <span
                            class="flex-shrink-0 bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full"
                          >
                            Lease
                          </span>
                        </div>
                        <p class="text-xs text-gray-600">
                          ${{ sheet.vehicle_price?.toLocaleString() }} •
                          {{ sheet.lease_term_months }} months
                        </p>
                      </div>
                    </div>
                    <Link :href="`/estimates/leasing/${sheet.id}/edit`">
                      <button
                        class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors flex-shrink-0"
                      >
                        Edit
                      </button>
                    </Link>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-if="!vehicleFinanceSheets?.length && !vehicleLeaseSheets?.length"
                  class="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center"
                >
                  <div
                    class="p-3 rounded-lg bg-gray-100 w-12 h-12 mx-auto mb-3 flex items-center justify-center"
                  >
                    <svg
                      class="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-base font-bold text-gray-900 mb-1">No estimates yet</h3>
                  <p class="text-xs text-gray-600 mb-4">
                    Create your first estimate to get started
                  </p>
                  <Link href="/estimates/financing/create">
                    <button
                      class="bg-primary hover:bg-primary-shade-1 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Create Estimate
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </AuthenticatedLayout>
</template>
