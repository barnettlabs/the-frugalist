<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>

        <div class="prose prose-gray max-w-none">
          <p class="text-gray-600 mb-6">Last updated: {{ new Date().toLocaleDateString() }}</p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p class="text-gray-600 mb-4">
            By accessing and using Sneaky Salesman, you agree to be bound by these Terms of Service
            and all applicable laws and regulations.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">2. Use of Services</h2>
          <p class="text-gray-600 mb-4">
            Our vehicle finance and lease calculators are provided for informational purposes only.
            The calculations should not be considered financial advice.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p class="text-gray-600 mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">4. Disclaimer</h2>
          <p class="text-gray-600 mb-4">
            The services are provided "as is" without warranties of any kind. We do not guarantee the
            accuracy of calculations or the availability of services.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p class="text-gray-600 mb-4">
            We shall not be liable for any indirect, incidental, special, or consequential damages
            arising from your use of our services.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">6. Contact</h2>
          <p class="text-gray-600 mb-4">
            For questions about these Terms, please contact
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
