<script setup lang="ts">
import { ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto text-center">
      <div class="mb-8">
        <div class="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
          <ClipboardDocumentCheckIcon class="h-8 w-8 text-accent" />
        </div>
        <h1 class="text-2xl font-medium text-primary mb-3">
          TheFrugalist Review is coming soon.
        </h1>
        <p class="text-text-muted leading-relaxed max-w-lg mx-auto">
          Upload an offer sheet and we'll flag markups, junk fees, and financing traps.
          Get clarity on what you're actually paying before you sign.
        </p>
      </div>

      <div class="bg-surface/80 backdrop-blur-sm border border-border rounded-lg p-6 max-w-md mx-auto">
        <h2 class="text-sm font-medium text-primary mb-3">
          What Review will help with:
        </h2>
        <ul class="text-left text-sm text-text-muted space-y-2">
          <li class="flex items-start">
            <span class="text-accent mr-2">-</span>
            <span>Identify dealer markups and fees</span>
          </li>
          <li class="flex items-start">
            <span class="text-accent mr-2">-</span>
            <span>Understand financing terms and true cost</span>
          </li>
          <li class="flex items-start">
            <span class="text-accent mr-2">-</span>
            <span>Spot common negotiation opportunities</span>
          </li>
          <li class="flex items-start">
            <span class="text-accent mr-2">-</span>
            <span>Compare your offer to market data</span>
          </li>
        </ul>
      </div>

      <p class="mt-8 text-sm text-text-muted">
        We're building this feature now. Check back soon.
      </p>
    </div>
  </div>
</template>
