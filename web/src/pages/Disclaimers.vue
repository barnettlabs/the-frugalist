<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Disclaimers</h1>

        <div class="prose prose-gray max-w-none">
          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">Calculator Disclaimer</h2>
          <p class="text-gray-600 mb-4">
            The vehicle finance and lease calculators provided by TheFrugalist are for
            informational and educational purposes only. The results should not be considered
            financial advice or a guarantee of actual loan or lease terms.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">Accuracy of Information</h2>
          <p class="text-gray-600 mb-4">
            While we strive to provide accurate calculations, actual financing terms may vary based
            on credit score, lender policies, market conditions, and other factors. Always consult
            with a qualified financial professional before making financial decisions.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">Not Financial Advice</h2>
          <p class="text-gray-600 mb-4">
            Nothing on this website should be construed as financial, investment, or legal advice.
            We recommend consulting with appropriate professionals for your specific situation.
          </p>

          <h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">Third-Party Information</h2>
          <p class="text-gray-600 mb-4">
            We are not responsible for the accuracy of information provided by third parties,
            including dealerships, lenders, or other financial institutions.
          </p>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200">
          <RouterLink to="/dashboard" class="text-primary hover:text-primary-shade-1 font-medium">
            ← Back to Dashboard
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
