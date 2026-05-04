<script setup lang="ts">
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import { RouterLink, RouterView } from 'vue-router'
import { version as appVersion } from '../../package.json'
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center py-12 overflow-hidden">
    <!-- Top masthead bar (matches landing) -->
    <div class="absolute top-0 inset-x-0 z-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div class="flex items-center justify-between border-y border-border-strong py-2">
          <span class="eyebrow numeral">v {{ appVersion }}</span>
          <span class="eyebrow hidden sm:inline">A field guide to what things should cost</span>
          <RouterLink to="/" class="eyebrow hover:text-primary transition-colors">
            Back to home
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Centered content -->
    <div class="relative w-full max-w-md px-6 z-10">
      <!-- Logo + brand -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-block">
          <ApplicationLogo size="xl" class="mx-auto mb-4" />
          <p class="font-display italic text-accent-dark text-lg tracking-tight">Spend with intent.</p>
        </RouterLink>
      </div>

      <!-- Floating paper card with stacked-paper depth -->
      <div class="relative">
        <!-- Decorative rotated papers behind -->
        <div class="absolute -inset-3 -rotate-2 rounded-md bg-tan border border-border opacity-90"></div>
        <div class="absolute -inset-1.5 rotate-1 rounded-md bg-surface-dark border border-border"></div>

        <!-- Main card -->
        <div class="relative rounded-md p-8 bg-surface border border-border shadow-paper">
          <RouterView />
        </div>
      </div>

      <!-- Bottom marker -->
      <div class="text-center mt-10">
        <span class="eyebrow text-text-muted/60">
          v. {{ appVersion }} &middot; Established {{ new Date().getFullYear() }}
        </span>
      </div>
    </div>
  </div>
</template>
