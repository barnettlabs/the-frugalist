<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

        <div class="prose prose-gray max-w-none">
          <p class="text-gray-600 mb-6">Last updated: {{ new Date().toLocaleDateString() }}</p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p class="text-gray-600 mb-4">
            We collect information you provide directly to us, such as when you create an account,
            use our calculators, or contact us for support.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p class="text-gray-600 mb-4">
            We use the information we collect to provide, maintain, and improve our services,
            including our vehicle finance and lease calculators.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
          <p class="text-gray-600 mb-4">
            We do not share your personal information with third parties except as described in this
            policy or with your consent.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          <p class="text-gray-600 mb-4">
            We take reasonable measures to help protect your personal information from loss, theft,
            misuse, and unauthorized access.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
          <p class="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy, please contact us at
            <a href="mailto:jason.barnett@jaytech.io" class="text-primary hover:text-primary-shade-1">
              jason.barnett@jaytech.io
            </a>
          </p>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200">
          <RouterLink to="/" class="text-primary hover:text-primary-shade-1 font-medium">
            ← Back to Home
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
