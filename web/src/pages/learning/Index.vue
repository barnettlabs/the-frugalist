<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const guides = [
  {
    name: 'Financing Guide',
    description: 'Learn about interest rates, loan terms, and common financing tactics. Understand what affects your monthly payment and how dealers make money.',
    href: '/learning/financing',
    icon: BanknotesIcon,
    iconColor: 'text-accent',
    topics: ['Interest rate markup', 'Extended warranties', 'Add-on products', 'Negotiation strategies'],
  },
  {
    name: 'Leasing Guide',
    description: 'Understand money factors, residual values, and lease-end fees. Know what to watch for before signing and how to avoid common pitfalls.',
    href: '/learning/leasing',
    icon: CurrencyDollarIcon,
    iconColor: 'text-accent',
    topics: ['Money factor explained', 'Residual value tricks', 'Disposition fees', 'Mileage penalties'],
  },
]

const whyLearn = [
  {
    icon: ShieldCheckIcon,
    title: 'Recognize Tactics',
    description: 'Understand common sales techniques used to pressure quick decisions.',
  },
  {
    icon: AcademicCapIcon,
    title: 'Know the Terms',
    description: 'Learn the jargon so you can speak confidently with salespeople.',
  },
  {
    icon: ExclamationTriangleIcon,
    title: 'Avoid Pitfalls',
    description: 'Identify hidden fees and unfavorable terms before you sign.',
  },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <header class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-blue-900"></div>
      <div class="dotted-background relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div class="max-w-2xl">
          <div class="flex items-center mb-4">
            <div class="p-2 bg-white/20 rounded-lg mr-3">
              <BookOpenIcon class="h-6 w-6 text-white" />
            </div>
            <span class="text-white/70 text-sm font-medium">Guides</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-medium text-white mb-4 tracking-tight">
            Knowledge is leverage
          </h1>
          <p class="text-lg text-white/80 leading-relaxed">
            Learn the tactics behind markups, fees, and pressure. When you understand pricing strategies,
            you can recognize them and respond rationally instead of emotionally.
          </p>
        </div>
      </div>
    </header>

    <!-- Why Learn Section -->
    <section class="py-12 border-b border-border">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="item in whyLearn"
            :key="item.title"
            class="flex items-start gap-4"
          >
            <div class="p-2 bg-accent/10 rounded-lg shrink-0">
              <component :is="item.icon" class="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 class="text-sm font-medium text-primary mb-1">{{ item.title }}</h3>
              <p class="text-sm text-text-muted">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Guides Section -->
    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-medium text-primary mb-8">Choose a Guide</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RouterLink
            v-for="guide in guides"
            :key="guide.name"
            :to="guide.href"
            class="group block"
          >
            <div class="h-full bg-surface/80 backdrop-blur-sm rounded-2xl border border-border p-6 hover:border-accent/50 hover:shadow-soft transition-all duration-200">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                  <component :is="guide.icon" class="h-6 w-6" :class="guide.iconColor" />
                </div>
                <div class="text-text-muted group-hover:text-accent transition-colors">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <h3 class="text-lg font-medium text-primary group-hover:text-accent transition-colors mb-2">
                {{ guide.name }}
              </h3>
              <p class="text-sm text-text-muted mb-4 leading-relaxed">{{ guide.description }}</p>

              <!-- Topics -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="topic in guide.topics"
                  :key="topic"
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-text-muted bg-surface border border-border rounded-full"
                >
                  {{ topic }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Tip Box -->
        <div class="mt-12 bg-accent/5 border border-accent/20 rounded-2xl p-6">
          <div class="flex items-start gap-4">
            <div class="p-2 bg-accent/10 rounded-lg shrink-0">
              <AcademicCapIcon class="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 class="text-sm font-medium text-primary mb-1">Pro Tip</h3>
              <p class="text-sm text-text-muted leading-relaxed">
                Read through both guides before visiting a dealership. Understanding both financing and leasing
                gives you leverage to compare options and recognize when a salesperson is steering you toward
                a less favorable deal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
