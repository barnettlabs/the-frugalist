<script setup>
import { Head, Link } from '@inertiajs/vue3'
import AuthLayout from '@/Layouts/AuthLayout.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'

defineProps({
  user: Object,
})
</script>

<template>
  <AuthLayout>
    <Head title="Email Verified" />

    <div class="text-center">
      <div
        class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4"
      >
        <CheckCircleIcon class="h-10 w-10 text-green-600" />
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>

      <p class="text-gray-600 mb-6">
        Your email address has been successfully verified. You now have full access to your account
        and can start tracking prices.
      </p>

      <div class="space-y-3">
        <Link :href="route('dashboard')">
          <PrimaryButton>Go to Dashboard</PrimaryButton>
        </Link>
      </div>
    </div>
  </AuthLayout>
</template>
