<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BanknotesIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'

const calculators = [
  {
    name: 'Financing Calculator',
    description: 'Calculate monthly payments, total interest, and compare financing options for vehicle purchases.',
    href: '/estimates/financing',
    icon: BanknotesIcon,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
  },
  {
    name: 'Leasing Calculator',
    description: 'Understand lease terms, money factors, and residual values. See the true cost before you sign.',
    href: '/estimates/leasing',
    icon: CurrencyDollarIcon,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
]
</script>

<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-medium text-primary">Compute</h1>
        <p class="mt-2 text-text-muted">
          Understand the true cost of financing and leasing. See how rates, terms, and fees affect your payments.
        </p>
      </div>

      <div class="space-y-4">
        <RouterLink
          v-for="calc in calculators"
          :key="calc.name"
          :to="calc.href"
          class="block bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-6 hover:border-accent/30 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-lg" :class="calc.iconBg">
              <component :is="calc.icon" class="h-6 w-6" :class="calc.iconColor" />
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-medium text-primary group-hover:text-accent transition-colors">
                {{ calc.name }}
              </h2>
              <p class="mt-1 text-sm text-text-muted">{{ calc.description }}</p>
            </div>
            <div class="text-text-muted group-hover:text-accent transition-colors">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
