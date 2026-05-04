<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import {
  EyeIcon,
  CalculatorIcon,
  BookOpenIcon,
  EnvelopeIcon,
  ArrowUpRightIcon,
  ArrowDownIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import type { Component } from 'vue'
import { version as appVersion } from '../../package.json'

const authStore = useAuthStore()

interface Pillar {
  number: string
  eyebrow: string
  title: string
  italic: string
  description: string
  proofs: string[]
  href: string
  icon: Component
}

const pillars: Pillar[] = [
  {
    number: '01',
    eyebrow: 'Watch',
    title: 'Track',
    italic: 'movement.',
    description:
      'Drop-by-drop price history on the things you actually buy. Alerts fire only when motion makes the moment worth your attention.',
    proofs: ['Price history', 'In-stock alerts', 'Return-window refunds'],
    href: '/watch',
    icon: EyeIcon,
  },
  {
    number: '02',
    eyebrow: 'Compute',
    title: 'Run',
    italic: 'the math.',
    description:
      'Financing and leasing rendered in plain numbers: APR, money factor, residual, true monthly cost. The fine print laid bare.',
    proofs: ['Amortization', 'Money factor to APR', 'Side-by-side comparisons'],
    href: '/estimates',
    icon: CalculatorIcon,
  },
  {
    number: '03',
    eyebrow: 'Guides',
    title: 'Read',
    italic: 'the room.',
    description:
      'Field notes on the tactics dealers use: markups, urgency theater, hidden add-ons. So you can recognize the play before it lands.',
    proofs: ['Pricing tactics', 'Loan vs. lease', 'What to refuse'],
    href: '/learning',
    icon: BookOpenIcon,
  },
]

const supportedRetailers = [
  'Best Buy',
]

const retailerCountLabel = `${supportedRetailers.length} ${supportedRetailers.length === 1 ? 'retailer' : 'retailers'}`

const tickerItems = [
  'Track prices',
  'Run financing',
  'Compare leases',
  'Reclaim refunds',
  'Spot markups',
  'Decline add-ons',
  'Read the fine print',
  'Wait it out',
]
const tripledTickerItems = [...tickerItems, ...tickerItems, ...tickerItems]
</script>

<template>
  <div class="min-h-screen relative">
    <!-- Top bar -->
    <nav class="relative z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div class="flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2.5">
          <ApplicationLogo size="md" />
          <span class="font-display text-2xl text-primary tracking-tightest">
            thefrugalist
          </span>
        </RouterLink>
        <div class="flex items-center gap-2 sm:gap-5">
          <RouterLink to="/learning" class="hidden sm:inline-flex eyebrow hover:text-primary transition-colors">
            Field Guide
          </RouterLink>
          <RouterLink v-if="authStore.isAuthenticated" to="/dashboard"
            class="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors">
            Dashboard
            <ArrowUpRightIcon class="h-4 w-4" />
          </RouterLink>
          <template v-else>
            <RouterLink to="/login" class="hidden sm:inline-flex text-sm font-medium text-text-muted hover:text-primary transition-colors px-2 py-2">
              Sign in
            </RouterLink>
            <RouterLink to="/register"
              class="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors">
              Get started
              <ArrowUpRightIcon class="h-4 w-4" />
            </RouterLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- Masthead rule -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
      <div class="flex items-center justify-between border-y border-border-strong py-2 gap-4">
        <span class="eyebrow numeral">v {{ appVersion }}</span>
        <span class="eyebrow hidden sm:inline text-center flex-1">A field guide to what things should cost</span>
        <RouterLink to="/watch" class="eyebrow hover:text-primary transition-colors">
          {{ retailerCountLabel }}
        </RouterLink>
      </div>
    </div>

    <!-- Tracking-on strip -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-3">
      <div class="flex flex-wrap items-baseline gap-x-6 gap-y-2 py-2">
        <span class="eyebrow text-text-muted/70">Now tracking on</span>
        <template v-for="(retailer, i) in supportedRetailers" :key="retailer">
          <span class="font-display text-sm sm:text-base text-primary tracking-tight">{{ retailer }}</span>
          <span v-if="i < supportedRetailers.length - 1" class="text-border-strong font-mono text-sm" aria-hidden="true">/</span>
        </template>
        <span class="text-border-strong font-mono text-sm" aria-hidden="true">/</span>
        <span class="eyebrow text-text-muted/60 italic">more retailers soon</span>
      </div>
    </div>

    <!-- HERO -->
    <section class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20 pb-16 lg:pb-24">
      <div class="grid grid-cols-12 gap-6 lg:gap-12 items-center">
        <!-- Left: editorial headline -->
        <div class="col-span-12 lg:col-span-7">
          <p class="eyebrow mb-6 fade-up">A guide for paying less, on purpose</p>
          <h1 class="font-display font-medium text-primary tracking-tightest leading-[0.92] text-[2.75rem] sm:text-6xl lg:text-[5.5rem] fade-up fade-up-1">
            Spend with
            <span class="italic font-normal text-accent-dark">intent</span>,
            <br />
            <span class="text-text-muted/70">not impulse.</span>
          </h1>
          <p class="mt-8 text-base sm:text-lg text-primary-light max-w-xl leading-relaxed fade-up fade-up-2">
            TheFrugalist is a calm tool for noisy markets. Track prices that move, run the numbers behind any
            financing offer, and learn the playbook dealers don&rsquo;t want you reading.
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-3 fade-up fade-up-3">
            <RouterLink
              :to="authStore.isAuthenticated ? '/watch' : '/register'"
              class="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
            >
              Start a price watch
              <ArrowUpRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </RouterLink>
            <RouterLink
              to="/learning"
              class="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/5 hover:border-primary/40 transition-colors"
            >
              Read the field guide
            </RouterLink>
          </div>
          <div class="mt-12 flex items-center gap-4 text-text-muted fade-up fade-up-4">
            <ArrowDownIcon class="h-4 w-4 animate-bounce" />
            <span class="eyebrow">Three tools below the fold</span>
          </div>
        </div>

        <!-- Right: inset specimen card showing a live-feeling tracked product -->
        <div class="col-span-12 lg:col-span-5 fade-up fade-up-2">
          <div class="relative">
            <!-- Decorative rotated paper behind the main card -->
            <div class="absolute -inset-3 -rotate-2 rounded-md bg-tan border border-border opacity-90"></div>
            <div class="absolute -inset-1.5 rotate-1 rounded-md bg-surface-dark border border-border"></div>

            <!-- Main card -->
            <div class="relative surface-navy paper-grain rounded-md border border-primary/30 overflow-hidden shadow-paper">
              <!-- Top metadata strip -->
              <div class="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-signal animate-pulse"></span>
                  <span class="eyebrow text-white/80">Live &middot; tracking</span>
                </div>
                <span class="numeral text-xs text-white/60">№ 042</span>
              </div>

              <!-- Body -->
              <div class="px-5 sm:px-6 py-6 relative z-10">
                <p class="font-display text-xl text-white/95 leading-tight tracking-tight">
                  GE Profile 30&Prime; Slide-In Induction Range
                </p>
                <p class="mt-1 text-xs text-white/60">Best Buy &middot; SKU 6478912</p>

                <!-- Big numerals -->
                <div class="mt-7 flex items-end gap-4">
                  <div>
                    <p class="eyebrow text-white/60 mb-1">Now</p>
                    <p class="figure text-5xl text-white">$2,148</p>
                  </div>
                  <div class="pb-2">
                    <p class="eyebrow text-success/90 mb-0.5">Off Retail</p>
                    <p class="numeral text-success/90 text-base">&minus;$651</p>
                  </div>
                </div>

                <!-- Progress to target -->
                <div class="mt-6">
                  <div class="flex items-center justify-between text-xs text-white/60 mb-1.5">
                    <span class="numeral">$2,799</span>
                    <span class="eyebrow text-signal">Target $1,999</span>
                  </div>
                  <div class="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div class="h-full w-[81%] rounded-full bg-gradient-to-r from-accent-light via-signal-light to-signal"></div>
                  </div>
                </div>

                <!-- Mini history sparkline -->
                <div class="mt-7 pt-5 border-t border-white/10">
                  <div class="flex items-end justify-between h-12 gap-1">
                    <span v-for="(h, i) in [54, 56, 53, 58, 60, 51, 49, 47, 44, 41, 38, 36, 34, 32, 30, 28, 25, 23, 21, 22]"
                      :key="i"
                      class="flex-1 rounded-sm bg-gradient-to-t from-accent-light/30 to-accent-light/80"
                      :style="{ height: h + '%' }"
                    />
                  </div>
                  <p class="eyebrow text-white/50 mt-3">90-day movement &middot; 9 drops</p>
                </div>
              </div>
            </div>

            <!-- Floating annotation -->
            <div class="absolute -bottom-6 -left-4 sm:left-2 bg-surface border border-border rounded-md px-4 py-3 shadow-paper rotate-[-3deg] max-w-[220px]">
              <p class="eyebrow text-signal-dark mb-1">Today</p>
              <p class="text-sm font-medium text-primary leading-snug">
                Refund window still open. Claim the difference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Marquee ticker strip -->
    <section class="relative border-y border-border-strong bg-primary text-surface overflow-hidden">
      <div class="paper-grain absolute inset-0"></div>
      <div class="relative flex whitespace-nowrap overflow-hidden py-4">
        <div class="flex items-center animate-[scroll_60s_linear_infinite] gap-x-8 sm:gap-x-10">
          <template v-for="(item, i) in tripledTickerItems" :key="i">
            <span class="font-display italic text-2xl sm:text-3xl text-white/85 tracking-tight">
              {{ item }}
            </span>
            <span class="font-mono text-xl sm:text-2xl text-signal leading-none" aria-hidden="true">/</span>
          </template>
        </div>
      </div>
    </section>

    <!-- THREE PILLARS -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div class="flex items-end justify-between mb-12 lg:mb-14">
        <div>
          <p class="eyebrow mb-4">The three tools</p>
          <h2 class="font-display font-medium text-primary tracking-tightest text-4xl sm:text-5xl lg:text-6xl leading-[0.95] max-w-2xl">
            Built for the moment <span class="italic text-accent-dark">just before</span> you click buy.
          </h2>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-strong border border-border-strong rounded-md overflow-hidden">
        <RouterLink
          v-for="pillar in pillars"
          :key="pillar.number"
          :to="pillar.href"
          class="group relative bg-surface p-6 sm:p-8 lg:p-10 hover:bg-surface-dark transition-colors flex flex-col"
        >
          <div class="flex items-start justify-between mb-8">
            <span class="numeral text-text-muted text-sm">{{ pillar.number }}</span>
            <component :is="pillar.icon" class="h-5 w-5 text-text-muted group-hover:text-accent-dark transition-colors" />
          </div>
          <p class="eyebrow mb-3">{{ pillar.eyebrow }}</p>
          <h3 class="font-display font-medium text-primary tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
            {{ pillar.title }}<br /><span class="italic text-accent-dark">{{ pillar.italic }}</span>
          </h3>
          <p class="mt-5 text-sm text-text-muted leading-relaxed">{{ pillar.description }}</p>
          <ul class="mt-6 space-y-1.5">
            <li v-for="proof in pillar.proofs" :key="proof" class="flex items-center gap-2 text-xs text-primary">
              <span class="h-px w-3 bg-accent-dark"></span>
              <span class="numeral">{{ proof }}</span>
            </li>
          </ul>
          <div class="mt-auto pt-8 flex items-center gap-2 text-primary group-hover:text-accent-dark transition-colors">
            <span class="text-sm font-medium">Open the {{ pillar.eyebrow.toLowerCase() }}</span>
            <ArrowUpRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- THE PROBLEM / THE STANCE -->
    <section class="border-t border-border">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div class="grid grid-cols-12 gap-6 lg:gap-12 items-start">
          <div class="col-span-12 lg:col-span-4">
            <p class="eyebrow mb-4">A position</p>
            <p class="font-display text-primary text-2xl leading-snug">
              Pricing today isn&rsquo;t a number. It&rsquo;s a tactic.
            </p>
          </div>
          <div class="col-span-12 lg:col-span-8 lg:border-l border-border lg:pl-12">
            <blockquote class="font-display italic text-primary tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
              &ldquo;Urgency, anchoring, hidden add-ons, and pre-printed terms exist to make you decide
              <span class="text-accent-dark">faster</span> than your math can keep up. Slowing down is the entire move.&rdquo;
            </blockquote>
            <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <p class="figure text-3xl text-primary">12&middot;7%</p>
                <p class="eyebrow mt-1">Avg. dealer rate markup</p>
              </div>
              <div>
                <p class="figure text-3xl text-primary">$2,148</p>
                <p class="eyebrow mt-1">Avg. yearly price-drop refunds</p>
              </div>
              <div>
                <p class="figure text-3xl text-primary">9 mo.</p>
                <p class="eyebrow mt-1">Time to break-even on most leases</p>
              </div>
            </div>
            <p class="text-xs text-text-muted mt-3">Illustrative figures.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA STRIP -->
    <section class="relative">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div class="surface-ink paper-grain rounded-md border border-primary-dark/40 px-6 py-12 sm:p-14 relative overflow-hidden">
          <div class="grid grid-cols-12 gap-6 items-center relative z-10">
            <div class="col-span-12 lg:col-span-8">
              <p class="eyebrow text-white/60 mb-4">Free &middot; No credit card</p>
              <h2 class="font-display font-medium text-white tracking-tightest text-3xl sm:text-5xl leading-[0.95]">
                Begin a watch list.<br />
                <span class="italic text-signal-light">Spend the saved hour on something else.</span>
              </h2>
            </div>
            <div class="col-span-12 lg:col-span-4 lg:text-right">
              <RouterLink
                :to="authStore.isAuthenticated ? '/watch/create' : '/register'"
                class="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 bg-surface text-primary text-sm font-medium hover:bg-tan transition-colors"
              >
                Start free
                <ArrowUpRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-border-strong">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-12 gap-6 items-start">
          <div class="col-span-12 sm:col-span-5">
            <RouterLink to="/" class="inline-flex items-center gap-2 mb-3">
              <ApplicationLogo size="sm" />
              <span class="font-display text-xl text-primary tracking-tightest">thefrugalist</span>
            </RouterLink>
            <p class="text-xs text-text-muted max-w-sm leading-relaxed">
              A calm tool for tracking what things should cost. Built in independence by JayTech.
            </p>
          </div>
          <div class="col-span-6 sm:col-span-3">
            <p class="eyebrow mb-3">Tools</p>
            <ul class="space-y-1.5 text-sm">
              <li><RouterLink to="/watch" class="text-primary hover:text-accent-dark transition-colors">Watch</RouterLink></li>
              <li><RouterLink to="/estimates" class="text-primary hover:text-accent-dark transition-colors">Compute</RouterLink></li>
              <li><RouterLink to="/learning" class="text-primary hover:text-accent-dark transition-colors">Guides</RouterLink></li>
            </ul>
          </div>
          <div class="col-span-6 sm:col-span-2">
            <p class="eyebrow mb-3">Legal</p>
            <ul class="space-y-1.5 text-sm">
              <li><RouterLink to="/privacy" class="text-primary hover:text-accent-dark transition-colors">Privacy</RouterLink></li>
              <li><RouterLink to="/terms" class="text-primary hover:text-accent-dark transition-colors">Terms</RouterLink></li>
            </ul>
          </div>
          <div class="col-span-12 sm:col-span-2">
            <p class="eyebrow mb-3">Contact</p>
            <a href="mailto:jason.barnett@jaytech.io" class="inline-flex items-center gap-1.5 text-sm text-primary hover:text-accent-dark transition-colors break-all">
              <EnvelopeIcon class="h-3.5 w-3.5 flex-shrink-0" />
              <span>jason.barnett@jaytech.io</span>
            </a>
          </div>
        </div>
        <div class="mt-10 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <span>&copy; {{ new Date().getFullYear() }} JayTech LLC. All rights reserved.</span>
          <span class="numeral">v {{ appVersion }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}
</style>
