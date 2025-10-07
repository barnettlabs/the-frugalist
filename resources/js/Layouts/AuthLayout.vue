<script setup lang="ts">
import ApplicationLogo from '@/Components/ApplicationLogo.vue'
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div
    class="min-h-screen bg-animated-gradient dotted-background-light relative overflow-hidden flex items-center justify-center"
  >
    <div class="relative w-full max-w-md px-6">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <Link href="/" class="inline-block">
          <div class="flex flex-col items-center">
            <div class="mb-4">
              <ApplicationLogo variant="white" class="h-16 w-auto" />
            </div>
            <h1 class="text-3xl font-bold text-white mb-2 neon-text">Sneaky Salesman</h1>
            <p class="text-white/80 text-sm font-medium">Your smart shopping companion</p>
          </div>
        </Link>
      </div>

      <!-- Auth Form Card -->
      <div class="glass rounded-2xl p-8 bg-white/90 backdrop-blur-sm border border-white/20">
        <slot />
      </div>

      <!-- Back to Home Link -->
      <div class="text-center mt-6">
        <Link href="/" class="text-white/80 hover:text-white text-sm font-medium transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  </div>
</template>
