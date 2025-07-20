<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import ApplicationLogo from '@/Components/ApplicationLogo.vue'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import type { Component } from 'vue'

interface Props {
  canLogin: boolean
  canRegister: boolean
}

defineProps<Props>()

interface ActionItem {
  icon: Component
  name: string
  description: string
  href: string
  iconForeground: string
  iconBackground: string
  status: string
}

const actions: ActionItem[] = [
  {
    icon: BanknotesIcon,
    name: 'Finance Renegade',
    description:
      'Break traditional financing rules. Advanced calculations with real-time rates and comprehensive payment analysis to outsmart salespeople.',
    href: '/estimates/financing',
    iconForeground: 'text-primary',
    iconBackground: 'bg-gradient-to-br from-primary/10 to-primary/20',
    status: 'Available',
  },
  {
    icon: CurrencyDollarIcon,
    name: 'Lease Renegade',
    description:
      'Master the lease game. Smart calculations with tax benefits and residual value optimization to maximize your advantage.',
    href: '/estimates/leasing',
    iconForeground: 'text-secondary',
    iconBackground: 'bg-gradient-to-br from-secondary/10 to-secondary/20',
    status: 'Available',
  },
]

const pipelineApps: ActionItem[] = [
  {
    icon: MagnifyingGlassIcon,
    name: 'Price Drop Renegade',
    description:
      'Monitor product SKUs and get alerted when prices drop below your threshold. Set up intelligent price tracking to catch the best deals automatically.',
    href: '/renegade/price-drop',
    iconForeground: 'text-warning',
    iconBackground: 'bg-gradient-to-br from-warning/10 to-warning/20',
    status: 'Coming Soon',
  },
]
</script>

<template>
  <Head title="Welcome to Sneaky Salesman" />

  <div class="min-h-screen bg-gray-100 dotted-background-dark">
    <!-- Header -->
    <header class="bg-animated-gradient dotted-background-light relative overflow-hidden">
      <!-- Floating geometric shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-4 -right-4 w-72 h-72 bg-white opacity-5 rounded-full"></div>
        <div class="absolute top-20 -left-10 w-48 h-48 bg-white opacity-10 rounded-full"></div>
      </div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Navigation -->
        <nav class="flex items-center justify-between py-6">
          <div class="flex items-center space-x-3">
            <ApplicationLogo variant="white" class="h-10 w-auto" />
            <div class="flex flex-col">
              <span class="text-2xl font-bold text-white neon-text"> Sneaky Salesman </span>
              <span class="text-white/80 text-sm font-medium"> Your personal sales renegade </span>
            </div>
          </div>

          <div v-if="canLogin" class="flex items-center space-x-4">
            <Link
              v-if="$page.props.auth.user"
              :href="route('dashboard')"
              class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150"
            >
              Dashboard
            </Link>
            <template v-else>
              <Link
                :href="route('login')"
                class="text-white hover:text-white/80 px-4 py-2 font-medium"
              >
                Log in
              </Link>
              <Link
                v-if="canRegister"
                :href="route('register')"
                class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150"
              >
                Register
              </Link>
            </template>
          </div>
        </nav>

        <!-- Hero Section -->
        <div class="py-20 text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to the
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Renegade Suite
            </span>
          </h1>
          <div
            class="mb-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl max-w-2xl mx-auto border border-white/20"
          >
            <p class="text-lg text-white/90 mb-2 font-semibold">Renegade</p>
            <p class="text-sm text-white/80 italic">
              /ˈrenəˌɡād/ - Someone or something that goes against conventional beliefs or practices
            </p>
          </div>
          <p class="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Break free from traditional sales tactics. Our suite of renegade applications puts the
            power back in your hands, helping you exploit the sales game for your benefit.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              :href="$page.props.auth.user ? '/dashboard' : route('login')"
              class="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-150 hover:neon-glow"
            >
              Explore Renegades
            </Link>
            <Link
              href="#applications"
              class="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-150"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Applications Section -->
        <section id="applications" class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">The Renegade Arsenal</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful applications designed to flip the script on traditional sales tactics. Each
              renegade tool gives you the edge to negotiate like a pro.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div v-for="action in actions" :key="action.name" class="group relative">
              <Link :href="action.href">
                <div
                  class="futuristic-card p-8 cursor-pointer transition-all duration-150 hover:neon-glow"
                >
                  <!-- Icon Section -->
                  <div class="flex items-center justify-between mb-6">
                    <div class="p-4 rounded-xl" :class="[action.iconBackground]">
                      <component
                        :is="action.icon"
                        class="h-8 w-8"
                        :class="[action.iconForeground]"
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
                    {{ action.name }}
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed mb-4">
                    {{ action.description }}
                  </p>

                  <!-- Status indicator -->
                  <div class="flex items-center text-xs">
                    <div
                      class="w-2 h-2 rounded-full mr-2 animate-pulse"
                      :class="action.status === 'Available' ? 'bg-success' : 'bg-warning'"
                    ></div>
                    <span class="text-gray-500">{{ action.status }}</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <!-- Renegade Pipeline -->
        <section class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Renegade Pipeline</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary tools currently in development to expand your arsenal
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div v-for="app in pipelineApps" :key="app.name" class="group relative">
              <Link :href="app.href">
                <div
                  class="futuristic-card p-8 cursor-pointer transition-all duration-150 hover:neon-glow"
                >
                  <!-- Icon Section -->
                  <div class="flex items-center justify-between mb-6">
                    <div class="p-4 rounded-xl" :class="[app.iconBackground]">
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

                  <!-- Status indicator -->
                  <div class="flex items-center text-xs">
                    <div
                      class="w-2 h-2 rounded-full mr-2 animate-pulse"
                      :class="app.status === 'Available' ? 'bg-success' : 'bg-warning'"
                    ></div>
                    <span class="text-gray-500">{{ app.status }}</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12 relative dotted-background-dark">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <ApplicationLogo variant="white" class="h-8 w-auto" />
              <h3 class="text-xl font-bold neon-text">Sneaky Salesman</h3>
            </div>
            <p class="text-gray-400">
              Empowering consumers with transparent financing tools and expert insights.
            </p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-gray-400">
              <li>
                <Link href="/estimates/financing" class="hover:text-white transition-colors"
                  >Finance Renegade</Link
                >
              </li>
              <li>
                <Link href="/estimates/leasing" class="hover:text-white transition-colors"
                  >Lease Renegade</Link
                >
              </li>
              <li>
                <Link href="/renegade/price-drop" class="hover:text-white transition-colors"
                  >Price Drop Renegade</Link
                >
              </li>
              <li>
                <Link href="/system-status" class="hover:text-white transition-colors"
                  >System Status</Link
                >
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Contact</h4>
            <p class="text-gray-400">
              <a href="mailto:jason.barnett@jaytech.io" class="hover:text-white transition-colors">
                jason.barnett@jaytech.io
              </a>
            </p>
            <p class="text-gray-400 mt-2">
              &copy; {{ new Date().getFullYear() }} JayTech LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
