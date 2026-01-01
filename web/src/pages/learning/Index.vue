<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BanknotesIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'

const guides = [
  {
    name: 'Financing Guide',
    description: 'Learn about interest rates, loan terms, and common financing tactics. Understand what affects your monthly payment.',
    href: '/learning/financing',
    icon: BanknotesIcon,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
  },
  {
    name: 'Leasing Guide',
    description: 'Understand money factors, residual values, and lease-end fees. Know what to watch for before signing.',
    href: '/learning/leasing',
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
        <h1 class="text-2xl font-medium text-primary">Guides</h1>
        <p class="mt-2 text-text-muted">
          Learn the tactics behind markups, fees, and pressure. Understand pricing strategies so you can recognize them and respond rationally.
        </p>
      </div>

      <div class="space-y-4">
        <RouterLink
          v-for="guide in guides"
          :key="guide.name"
          :to="guide.href"
          class="block bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-6 hover:border-accent/30 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-lg" :class="guide.iconBg">
              <component :is="guide.icon" class="h-6 w-6" :class="guide.iconColor" />
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-medium text-primary group-hover:text-accent transition-colors">
                {{ guide.name }}
              </h2>
              <p class="mt-1 text-sm text-text-muted">{{ guide.description }}</p>
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
