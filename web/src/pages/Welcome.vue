<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
} from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import type { Component } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

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
    name: 'Vehicle Finance Calculator',
    description:
      'Save time and money with advanced financing calculations. Real-time rates and comprehensive payment analysis to help you get the best deal.',
    href: '/estimates/financing',
    iconForeground: 'text-primary',
    iconBackground: 'bg-gradient-to-br from-primary/10 to-primary/20',
    status: 'Available',
  },
  {
    icon: CurrencyDollarIcon,
    name: 'Vehicle Lease Calculator',
    description:
      'Maximize your savings with intelligent lease calculations. Tax benefits and residual value optimization to find the best lease deals.',
    href: '/estimates/leasing',
    iconForeground: 'text-secondary',
    iconBackground: 'bg-gradient-to-br from-secondary/10 to-secondary/20',
    status: 'Available',
  },
  {
    icon: MagnifyingGlassIcon,
    name: 'Smart Price Tracker',
    description:
      'Never miss a deal again. Monitor prices and get alerted when they drop below your threshold. Intelligent tracking saves you time and money.',
    href: '/price-tracker',
    iconForeground: 'text-warning',
    iconBackground: 'bg-gradient-to-br from-warning/10 to-warning/20',
    status: 'Available',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-100 dotted-background-dark">
    <!-- Header -->
    <header class="z-10 bg-animated-gradient dotted-background-light relative overflow-hidden">
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Navigation -->
        <nav class="flex items-center justify-between py-6">
          <div class="flex items-center space-x-3">
            <ApplicationLogo variant="white" class="h-10 w-auto" />
            <div class="flex flex-col">
              <span class="text-2xl font-bold text-white neon-text"> Sneaky Salesman </span>
              <span class="text-white/80 text-sm font-medium"> Your smart shopping companion </span>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <RouterLink
              v-if="authStore.isAuthenticated"
              to="/dashboard"
              class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150"
            >
              Dashboard
            </RouterLink>
            <template v-else>
              <RouterLink
                to="/login"
                class="text-white hover:text-white/80 px-4 py-2 font-medium"
              >
                Log in
              </RouterLink>
              <RouterLink
                to="/register"
                class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150"
              >
                Register
              </RouterLink>
            </template>
          </div>
        </nav>

        <!-- Hero Section -->
        <div class="py-20 text-center">
          <h1 class="text-5xl font-bold text-white mb-6">
            Welcome to the
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Smart Shopping Suite
            </span>
          </h1>
          <div
            class="mb-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl max-w-2xl mx-auto border border-white/20"
          >
            <p class="text-lg text-white/90 mb-2 font-semibold">Smart & Sneaky</p>
            <p class="text-sm text-white/80 italic">
              Like a clever fox - intelligent, strategic, and always finding the best path forward
            </p>
          </div>
          <p class="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Make informed decisions with intelligent calculators. Track interest rates, rebates,
            fees, and get the best deal every time.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink
              :to="authStore.isAuthenticated ? '/dashboard' : '/login'"
              class="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-150 hover:neon-glow"
            >
              Start Saving
            </RouterLink>
            <a
              href="#applications"
              class="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all duration-150"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="py-16 z-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Applications Section -->
        <section id="applications" class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Smart Shopping Tools</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Intelligent applications designed to save you time and money. Each tool gives you the
              insights and calculations needed to make smart purchasing decisions.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div v-for="action in actions" :key="action.name" class="group relative">
              <RouterLink :to="action.href">
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
              </RouterLink>
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
                <RouterLink to="/estimates/financing" class="hover:text-white transition-colors">
                  Vehicle Finance Calculator
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/estimates/leasing" class="hover:text-white transition-colors">
                  Vehicle Lease Calculator
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/price-tracker" class="hover:text-white transition-colors">
                  Smart Price Tracker
                </RouterLink>
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
