<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="py-6 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div class="bg-surface rounded-lg border border-border p-6 sm:p-8">
        <h1 class="text-xl font-semibold text-primary mb-4">Privacy Policy</h1>

        <div class="prose prose-neutral max-w-none">
          <p class="text-text-muted text-sm mb-4">Last updated: {{ new Date().toLocaleDateString() }}</p>

          <h2 class="text-base font-medium text-primary mt-6 mb-2">1. Information We Collect</h2>
          <p class="text-text-muted text-sm mb-4 leading-relaxed">
            TheFrugalist collects information you provide directly to us, such as when you create an account,
            use our price tracking or calculation tools, or contact us for support. This may include your
            email address, profile information, and data about items you choose to track.
          </p>

          <h2 class="text-base font-medium text-primary mt-6 mb-2">2. How We Use Your Information</h2>
          <p class="text-text-muted text-sm mb-4 leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services.
            This includes price tracking, alerts, and calculation tools. We do not sell your data
            or use it for advertising purposes.
          </p>

          <h2 class="text-base font-medium text-primary mt-6 mb-2">3. Information Sharing</h2>
          <p class="text-text-muted text-sm mb-4 leading-relaxed">
            We do not share your personal information with third parties except as necessary to
            provide our services, comply with the law, or protect our rights. We do not sell or
            rent your personal information.
          </p>

          <h2 class="text-base font-medium text-primary mt-6 mb-2">4. Data Security</h2>
          <p class="text-text-muted text-sm mb-4 leading-relaxed">
            We take reasonable measures to help protect your personal information from loss, theft,
            misuse, and unauthorized access. However, no method of transmission over the internet
            is 100% secure.
          </p>

          <h2 class="text-base font-medium text-primary mt-6 mb-2">5. Your Rights</h2>
          <p class="text-text-muted text-sm mb-4 leading-relaxed">
            You may access, update, or delete your account information at any time through your
            account settings. If you wish to delete your account entirely, please contact us.
          </p>

          <h2 class="text-base font-medium text-primary mt-6 mb-2">6. Contact Us</h2>
          <p class="text-text-muted text-sm mb-4 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at
            <a href="mailto:jason.barnett@jaytech.io" class="text-accent hover:text-accent-dark">
              jason.barnett@jaytech.io
            </a>
          </p>
        </div>

        <div class="mt-8 pt-6 border-t border-border">
          <RouterLink to="/" class="text-accent hover:text-accent-dark text-sm font-medium">
            ← Back to Home
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
