<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  ChartBarIcon,
  ScaleIcon,
  LightBulbIcon,
} from '@heroicons/vue/24/outline'

const calculators = [
  {
    name: 'Financing Calculator',
    description: 'Calculate monthly payments, total interest, and compare financing options for vehicle purchases.',
    href: '/estimates/financing',
    icon: BanknotesIcon,
    iconColor: 'text-accent',
    features: ['Monthly payment breakdown', 'Total interest cost', 'Amortization schedule'],
  },
  {
    name: 'Leasing Calculator',
    description: 'Understand lease terms, money factors, and residual values. See the true cost before you sign.',
    href: '/estimates/leasing',
    icon: CurrencyDollarIcon,
    iconColor: 'text-accent',
    features: ['Money factor to APR', 'Residual value analysis', 'Total lease cost'],
  },
]

const benefits = [
  {
    icon: ChartBarIcon,
    title: 'See the Full Picture',
    description: 'Break down payments into principal, interest, and fees.',
  },
  {
    icon: ScaleIcon,
    title: 'Compare Options',
    description: 'Evaluate different terms and rates side by side.',
  },
  {
    icon: LightBulbIcon,
    title: 'Make Informed Choices',
    description: 'Understand the true cost before committing.',
  },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <header class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-blue-900"></div>
      <div class="dotted-background relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div class="max-w-2xl">
          <div class="flex items-center mb-4">
            <div class="p-2 bg-white/20 rounded-lg mr-3">
              <CalculatorIcon class="h-6 w-6 text-white" />
            </div>
            <span class="text-white/70 text-sm font-medium">Compute</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-medium text-white mb-4 tracking-tight">
            Understand the true cost
          </h1>
          <p class="text-lg text-white/80 leading-relaxed">
            See how rates, terms, and fees affect your payments. Our calculators break down the numbers
            so you can make decisions with clarity, not pressure.
          </p>
        </div>
      </div>
    </header>

    <!-- Benefits Section -->
    <section class="py-12 border-b border-border">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="flex items-start gap-4"
          >
            <div class="p-2 bg-accent/10 rounded-lg shrink-0">
              <component :is="benefit.icon" class="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 class="text-sm font-medium text-primary mb-1">{{ benefit.title }}</h3>
              <p class="text-sm text-text-muted">{{ benefit.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Calculators Section -->
    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-medium text-primary mb-8">Choose a Calculator</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RouterLink
            v-for="calc in calculators"
            :key="calc.name"
            :to="calc.href"
            class="group block"
          >
            <div class="h-full bg-surface/80 backdrop-blur-sm rounded-2xl border border-border p-6 hover:border-accent/50 hover:shadow-soft transition-all duration-200">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                  <component :is="calc.icon" class="h-6 w-6" :class="calc.iconColor" />
                </div>
                <div class="text-text-muted group-hover:text-accent transition-colors">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <h3 class="text-lg font-medium text-primary group-hover:text-accent transition-colors mb-2">
                {{ calc.name }}
              </h3>
              <p class="text-sm text-text-muted mb-4 leading-relaxed">{{ calc.description }}</p>

              <!-- Features -->
              <ul class="space-y-2">
                <li
                  v-for="feature in calc.features"
                  :key="feature"
                  class="flex items-center text-sm text-text-muted"
                >
                  <svg class="h-4 w-4 text-accent mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
