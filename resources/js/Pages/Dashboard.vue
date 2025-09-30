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
    <main class="-mt-24 pb-8 flex-1">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 class="sr-only">Dashboard</h1>

        <!-- Renegade Dashboard Header -->
        <div class="mb-8">
          <div class="glass rounded-2xl p-8 text-gray-900 bg-white/80 relative overflow-hidden">
            <div class="relative">
              <!-- Header Text -->
              <div class="mb-6 text-center lg:text-left">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">Smart Shopping Dashboard</h1>
                <p class="text-lg text-gray-600">
                  Save time and money with smart calculations and insights.
                </p>
              </div>

              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div class="flex items-center space-x-6">
                  <div class="relative">
                    <div
                      class="h-20 w-20 rounded-full ring-4 ring-primary/20 overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                    >
                      <img
                        v-if="user?.avatar_url"
                        class="h-full w-full object-cover"
                        :src="user?.avatar_url"
                        :alt="fullName"
                        @error="($event.target as HTMLImageElement).style.display = 'none'"
                      />
                      <UserIcon v-else class="h-12 w-12 text-white" />
                    </div>
                    <div
                      class="absolute -bottom-1 -right-1 h-6 w-6 bg-success rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <span class="text-xs text-white font-bold">🦊</span>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-600">Welcome back, Smart Shopper</p>
                    <h2 class="text-3xl font-bold text-gray-900">
                      {{ fullName }}
                    </h2>
                    <p class="text-sm text-gray-500">
                      {{ user?.email }}
                    </p>
                  </div>
                </div>
                <div class="mt-6 lg:mt-0">
                  <Link href="/profile">
                    <button
                      class="bg-primary hover:bg-primary-shade-1 px-6 py-3 rounded-xl font-medium text-white transition-all duration-100 hover:neon-glow"
                    >
                      Manage Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="space-y-8">
          <!-- Main Content Area -->
            <!-- Renegade Applications Section -->
            <div class="mb-8">
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Smart Tools</h2>
                <p class="text-gray-600">
                  Access intelligent applications designed to save you time and money on your next
                  vehicle purchase
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="app in smartApps" :key="app.name" class="group relative">
                  <div
                    class="futuristic-card p-6 transition-all duration-150 hover:neon-glow cursor-pointer"
                    @click="$inertia.visit(app.href)"
                  >
                    <!-- Icon Section -->
                    <div class="flex items-center justify-between mb-4">
                      <div class="p-3 rounded-xl" :class="[app.iconBackground]">
                        <component
                          :is="app.icon"
                          class="h-8 w-8"
                          :class="[app.iconForeground]"
                          aria-hidden="true"
                        />
                      </div>
                      <div class="opacity-50 group-hover:opacity-100 transition-opacity">
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    <!-- Content -->
                    <h3
                      class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors"
                    >
                      {{ app.name }}
                    </h3>
                    <p class="text-gray-600 text-sm leading-relaxed mb-4">
                      {{ app.description }}
                    </p>

                    <!-- Status and Actions -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center text-xs">
                        <div
                          class="w-2 h-2 rounded-full mr-2 animate-pulse"
                          :class="app.status === 'Available' ? 'bg-success' : 'bg-warning'"
                        ></div>
                        <span class="text-gray-500">{{ app.status }}</span>
                      </div>
                      <div class="flex space-x-3">
                        <Link
                          v-if="app.status === 'Available'"
                          :href="app.href + '/create'"
                          class="bg-primary hover:bg-primary-shade-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                          @click.stop
                        >
                          Create
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Calculations -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">Recent Calculations</h2>
                  <p class="text-gray-600">Your latest finance and lease estimates</p>
                </div>
                <Link
                  href="/estimates/financing"
                  class="text-primary hover:text-primary-shade-1 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-if="vehicleFinanceSheets?.length > 0"
                  v-for="sheet in vehicleFinanceSheets.slice(0, 2)"
                  :key="sheet.id"
                  class="futuristic-card p-6"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="p-2 rounded-lg bg-primary/10">
                      <component :is="BanknotesIcon" class="h-5 w-5 text-primary" />
                    </div>
                    <span class="text-xs text-gray-500">Finance</span>
                  </div>
                  <h3 class="font-bold text-gray-900 mb-2">
                    {{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}
                  </h3>
                  <p class="text-gray-600 text-sm mb-3">
                    ${{ sheet.vehicle_price?.toLocaleString() }} •
                    {{ sheet.loan_term_months }} months
                  </p>
                  <Link
                    :href="`/estimates/financing/${sheet.id}/edit`"
                    class="text-primary hover:text-primary-shade-1 text-sm font-medium"
                  >
                    Edit Calculation →
                  </Link>
                </div>
                <div
                  v-if="vehicleLeaseSheets?.length > 0"
                  v-for="sheet in vehicleLeaseSheets.slice(0, 2)"
                  :key="sheet.id"
                  class="futuristic-card p-6"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="p-2 rounded-lg bg-secondary/10">
                      <component :is="CurrencyDollarIcon" class="h-5 w-5 text-secondary" />
                    </div>
                    <span class="text-xs text-gray-500">Lease</span>
                  </div>
                  <h3 class="font-bold text-gray-900 mb-2">
                    {{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}
                  </h3>
                  <p class="text-gray-600 text-sm mb-3">
                    ${{ sheet.vehicle_price?.toLocaleString() }} •
                    {{ sheet.lease_term_months }} months
                  </p>
                  <Link
                    :href="`/estimates/leasing/${sheet.id}/edit`"
                    class="text-secondary hover:text-secondary-shade-1 text-sm font-medium"
                  >
                    Edit Calculation →
                  </Link>
                </div>
                <div
                  v-if="!vehicleFinanceSheets?.length && !vehicleLeaseSheets?.length"
                  class="col-span-full futuristic-card p-8 text-center"
                >
                  <div
                    class="p-4 rounded-xl bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  >
                    <svg
                      class="w-8 h-8 text-gray-400"
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
                  <h3 class="text-lg font-bold text-gray-900 mb-2">No calculations yet</h3>
                  <p class="text-gray-600 mb-4">
                    Start your first vehicle calculation to see your estimates here
                  </p>
                  <Link
                    href="/estimates/financing/create"
                    class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150"
                  >
                    Create First Calculation
                  </Link>
                </div>
              </div>
            </div>
        </div>
      </div>
    </main>
  </AuthenticatedLayout>
</template>
