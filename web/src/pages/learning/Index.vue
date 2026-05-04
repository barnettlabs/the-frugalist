<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SectionHeader from '@/components/SectionHeader.vue'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowUpRightIcon,
} from '@heroicons/vue/24/outline'

const guides = [
  {
    number: '01',
    eyebrow: 'Financing',
    name: 'The Financing Field Guide',
    italic: 'Reading the offer.',
    description:
      'Interest rate markup, pre-printed terms, the line items dealers route quietly into your monthly. Learn the playbook so you can decline the pitch.',
    href: '/learning/financing',
    icon: BanknotesIcon,
    topics: ['Interest rate markup', 'Extended warranties', 'Add-on products', 'Negotiation strategies'],
  },
  {
    number: '02',
    eyebrow: 'Leasing',
    name: 'The Leasing Field Guide',
    italic: 'Reading the lease.',
    description:
      'Money factors, residual mechanics, disposition fees, mileage penalties. The full vocabulary you need before signing a 36-month obligation.',
    href: '/learning/leasing',
    icon: CurrencyDollarIcon,
    topics: ['Money factor explained', 'Residual value tricks', 'Disposition fees', 'Mileage penalties'],
  },
]

const whyLearn = [
  { icon: ShieldCheckIcon, title: 'Recognize tactics', description: 'Spot the urgency theater the moment it begins.' },
  { icon: AcademicCapIcon, title: 'Know the language', description: 'Terms, jargon, abbreviations, and what they actually mean.' },
  { icon: ExclamationTriangleIcon, title: 'Avoid the pitfalls', description: 'Hidden fees, unfavorable clauses — flagged in advance.' },
]
</script>

<template>
  <div class="pb-16">
    <SectionHeader
      eyebrow="Guides · Field manual"
      title="Knowledge is leverage."
      description="Read what the dealership reads. The tactics, the terms, the tricks built into the paperwork — all rendered in plain language."
      :icon="BookOpenIcon"
    />

    <!-- Why Learn — refined three -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden">
        <div
          v-for="(item, i) in whyLearn"
          :key="item.title"
          class="bg-surface p-6 flex items-start gap-4"
        >
          <span class="numeral text-text-muted text-xs">0{{ i + 1 }}</span>
          <div>
            <p class="font-display text-lg text-primary tracking-tight leading-snug">{{ item.title }}</p>
            <p class="text-sm text-text-muted mt-1">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Two guides — editorial cards -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="eyebrow mb-3">The guides</p>
          <h2 class="font-display font-medium text-primary tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
            Two field guides. <span class="italic text-accent-dark">Read both.</span>
          </h2>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-md overflow-hidden">
        <RouterLink
          v-for="guide in guides"
          :key="guide.name"
          :to="guide.href"
          class="group bg-surface hover:bg-surface-dark transition-colors p-8 sm:p-10 flex flex-col"
        >
          <div class="flex items-start justify-between mb-8">
            <span class="numeral text-text-muted text-sm">{{ guide.number }}</span>
            <component :is="guide.icon" class="h-5 w-5 text-text-muted group-hover:text-accent-dark transition-colors" />
          </div>
          <p class="eyebrow mb-3">{{ guide.eyebrow }}</p>
          <h3 class="font-display font-medium text-primary tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
            {{ guide.name.split(' ')[0] }} {{ guide.name.split(' ')[1] }}<br />
            <span class="italic text-accent-dark">{{ guide.italic }}</span>
          </h3>
          <p class="mt-5 text-sm text-text-muted leading-relaxed">{{ guide.description }}</p>
          <ul class="mt-6 flex flex-wrap gap-1.5">
            <li
              v-for="topic in guide.topics"
              :key="topic"
              class="inline-flex items-center px-2.5 py-1 text-xs numeral text-text-muted bg-tan/60 border border-border rounded-sm"
            >
              {{ topic }}
            </li>
          </ul>
          <div class="mt-auto pt-8 flex items-center gap-2 text-primary group-hover:text-accent-dark transition-colors">
            <span class="text-sm font-medium">Read the guide</span>
            <ArrowUpRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </RouterLink>
      </div>

      <!-- Editorial pull-quote tip -->
      <div class="mt-12 lg:mt-16 grid grid-cols-12 gap-6 lg:gap-12 items-start border-t border-border pt-12">
        <div class="col-span-12 lg:col-span-4">
          <p class="eyebrow mb-3">From the editor</p>
          <p class="font-display text-primary text-2xl leading-snug">A note before you visit the dealership.</p>
        </div>
        <div class="col-span-12 lg:col-span-8 lg:border-l border-border lg:pl-12">
          <blockquote class="font-display italic text-primary tracking-tight text-2xl sm:text-3xl leading-snug">
            &ldquo;Read both guides. Understanding both financing <em class="not-italic text-accent-dark">and</em> leasing is what gives you leverage —
            it&rsquo;s how you recognize the moment a salesperson is steering you toward the path that pays them more.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  </div>
</template>
