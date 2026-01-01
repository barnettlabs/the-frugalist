<script setup lang="ts">
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center py-12">
    <!-- Gradient background -->
    <div class="dotted-background-light absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-blue-900"></div>

    <div class="relative w-full max-w-md px-6">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-block">
          <div class="flex flex-col items-center">
            <div class="mb-4">
              <ApplicationLogo variant="white" size="xl" />
            </div>
            <p class="text-white/70 text-sm font-medium">Spend intentionally.</p>
          </div>
        </RouterLink>
      </div>

      <!-- Auth Form Card -->
      <div class="rounded-xl p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
        <RouterView />
      </div>

      <!-- Back to Home Link -->
      <div class="text-center mt-6">
        <RouterLink to="/" class="text-white/70 hover:text-white text-sm font-medium transition-colors">
          Back to Home
        </RouterLink>
      </div>
    </div>
  </div>
</template>
