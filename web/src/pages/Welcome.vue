<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import {
  EyeIcon,
  CalculatorIcon,
  BookOpenIcon,
  EnvelopeIcon,
  ChartBarIcon,
  BellAlertIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

interface FeatureItem {
  icon: Component
  name: string
  description: string
  href: string
}

interface ValueProp {
  icon: Component
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: EyeIcon,
    name: 'Watch',
    description:
      'Track price movement over time. Get alerts when prices drop or hit your target. Use return windows to reclaim the difference when prices fall.',
    href: '/price-tracker',
  },
  {
    icon: CalculatorIcon,
    name: 'Compute',
    description:
      'Understand the true cost of financing and leasing. See how rates, terms, and fees affect your payments. Make decisions with clarity.',
    href: '/estimates/financing',
  },
  {
    icon: BookOpenIcon,
    name: 'Guides',
    description:
      'Learn the tactics behind markups, fees, and pressure. Understand pricing strategies so you can recognize them and respond rationally.',
    href: '/learning/financing',
  },
]

const valueProps: ValueProp[] = [
  {
    icon: ChartBarIcon,
    title: 'Track Movement',
    description: 'Monitor price changes over time with visual charts and history.',
  },
  {
    icon: BellAlertIcon,
    title: 'Smart Alerts',
    description: 'Get notified when prices drop or hit your target.',
  },
  {
    icon: ArrowPathIcon,
    title: 'Reclaim Value',
    description: 'Use return windows to get refunds when prices fall.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Stay Informed',
    description: 'Learn pricing tactics so you can respond rationally.',
  },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section with gradient background -->
    <header class="relative overflow-hidden">
      <!-- Gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-blue-900"></div>

      <div class="dotted-background-light relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Navigation -->
        <nav class="flex items-center justify-between py-6">
          <RouterLink to="/" class="flex items-center">
            <ApplicationLogo variant="white" size="xl" />
          </RouterLink>

          <div class="flex items-center space-x-4">
            <RouterLink
              v-if="authStore.isAuthenticated"
              to="/dashboard"
              class="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm"
            >
              Dashboard
            </RouterLink>
            <template v-else>
              <RouterLink
                to="/login"
                class="text-white/80 hover:text-white px-4 py-2 font-medium transition-colors"
              >
                Log in
              </RouterLink>
              <RouterLink
                to="/register"
                class="bg-white text-accent-dark hover:bg-white/90 px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Register
              </RouterLink>
            </template>
          </div>
        </nav>

        <!-- Hero Content -->
        <div class="py-20 lg:py-28">
          <div class="max-w-3xl">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-6 tracking-tight">
              Spend intentionally.
            </h1>
            <p class="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              TheFrugalist helps you avoid overpaying by tracking price movement,
              explaining pricing tactics, and alerting you when buying actually makes sense.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <RouterLink
                :to="authStore.isAuthenticated ? '/price-tracker' : '/register'"
                class="bg-white text-accent-dark hover:bg-white/90 px-6 py-3 rounded-lg font-medium transition-colors text-center shadow-lg"
              >
                Start tracking
              </RouterLink>
              <RouterLink
                to="/learning/financing"
                class="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center border border-white/30 backdrop-blur-sm"
              >
                Learn how pricing works
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <!-- Value Props Section -->
      <section class="py-16 lg:py-24 relative overflow-hidden">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(prop, index) in valueProps"
              :key="index"
              class="group relative bg-surface/80 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-accent/50 hover:shadow-soft transition-all duration-300"
            >
              <!-- Accent line -->
              <div class="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <!-- Icon -->
              <div class="mb-4 p-3 bg-accent/10 rounded-xl w-fit group-hover:bg-accent/20 transition-colors">
                <component :is="prop.icon" class="h-6 w-6 text-accent" />
              </div>

              <!-- Content -->
              <h3 class="text-base font-medium text-primary mb-2">{{ prop.title }}</h3>
              <p class="text-sm text-text-muted leading-relaxed">{{ prop.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 lg:py-20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="max-w-2xl mb-12">
            <h2 class="text-2xl sm:text-3xl font-medium text-primary mb-4">
              Tools for smarter decisions
            </h2>
            <p class="text-text-muted leading-relaxed">
              Each tool is designed to give you clarity, not pressure. No flashy sales tactics,
              just the information you need to make informed choices.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RouterLink
              v-for="feature in features"
              :key="feature.name"
              :to="feature.href"
              class="group"
            >
              <div class="bg-surface/80 backdrop-blur-sm border border-border rounded-xl p-6 h-full hover:border-accent hover:shadow-soft transition-all duration-200">
                <div class="flex items-center mb-4">
                  <div class="p-2.5 bg-accent/10 rounded-xl mr-3 group-hover:bg-accent/20 transition-colors">
                    <component
                      :is="feature.icon"
                      class="h-5 w-5 text-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 class="text-lg font-medium text-primary group-hover:text-accent transition-colors">
                    {{ feature.name }}
                  </h3>
                </div>
                <p class="text-text-muted text-sm leading-relaxed">
                  {{ feature.description }}
                </p>
              </div>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Why TheFrugalist Section -->
      <section class="py-16 lg:py-24 border-t border-border">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="max-w-3xl mx-auto">
            <h2 class="text-2xl sm:text-3xl font-medium text-primary mb-8 text-center">
              Why TheFrugalist
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- The Problem -->
              <div class="bg-danger/5 border border-danger/20 rounded-2xl p-6">
                <div class="flex items-center mb-4">
                  <div class="p-2 bg-danger/10 rounded-lg mr-3">
                    <ShieldCheckIcon class="h-5 w-5 text-danger" />
                  </div>
                  <h3 class="text-lg font-medium text-primary">The Problem</h3>
                </div>
                <p class="text-text-muted leading-relaxed text-sm">
                  Pricing is designed to pressure you. Sales tactics, artificial urgency,
                  hidden fees, and confusing terms are meant to make you act fast and pay more.
                </p>
              </div>
              <!-- The Solution -->
              <div class="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                <div class="flex items-center mb-4">
                  <div class="p-2 bg-accent/10 rounded-lg mr-3">
                    <EyeIcon class="h-5 w-5 text-accent" />
                  </div>
                  <h3 class="text-lg font-medium text-primary">Our Approach</h3>
                </div>
                <p class="text-text-muted leading-relaxed text-sm">
                  TheFrugalist slows that down. We give you tools to track prices,
                  understand costs, and make decisions on your own timeline. No hype, no pressure,
                  just clarity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-blue-900"></div>
      <div class="dotted-background-light relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <ApplicationLogo variant="white" size="lg" class="mb-4" />
            <p class="text-white/70 text-sm leading-relaxed">
              Helping you avoid overpaying by tracking price movement
              and explaining pricing tactics.
            </p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-white mb-4">Quick Links</h4>
            <ul class="space-y-2 text-sm text-white/70">
              <li>
                <RouterLink to="/price-tracker" class="hover:text-white transition-colors">
                  Watch
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/estimates" class="hover:text-white transition-colors">
                  Compute
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/learning" class="hover:text-white transition-colors">
                  Guides
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/privacy" class="hover:text-white transition-colors">
                  Privacy Policy
                </RouterLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-medium text-white mb-4">Contact</h4>
            <p class="text-white/70 text-sm">
              <a
                href="mailto:jason.barnett@jaytech.io"
                class="hover:text-white transition-colors flex items-center"
              >
                <span>jason.barnett@jaytech.io</span>
                <EnvelopeIcon class="h-4 w-4 ml-2" />
              </a>
            </p>
            <p class="text-white/50 mt-4 text-xs">
              &copy; {{ new Date().getFullYear() }} JayTech LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
