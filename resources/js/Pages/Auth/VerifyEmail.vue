<script setup>
import { computed, onMounted, ref } from 'vue'
import AuthLayout from '@/Layouts/AuthLayout.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'

const props = defineProps({
  status: {
    type: String,
  },
})

const form = useForm({})
const autoSent = ref(false)

const submit = () => {
  form.post(route('verification.send'))
}

const verificationLinkSent = computed(() => props.status === 'verification-link-sent' || autoSent.value)

// Automatically send verification email when page loads
onMounted(() => {
  if (!props.status) {
    form.post(route('verification.send'), {
      preserveScroll: true,
      onSuccess: () => {
        autoSent.value = true
      },
    })
  }
})
</script>

<template>
  <AuthLayout>
    <Head title="Email Verification" />

    <div class="mb-4 text-sm text-gray-600">
      Thanks for signing up! Before getting started, please verify your email address by clicking
      on the link we've sent to your email. If you don't see it, check your spam folder.
    </div>

    <div class="mb-4 text-sm font-medium text-green-600" v-if="verificationLinkSent">
      A verification link has been sent to your email address.
    </div>

    <form @submit.prevent="submit">
      <div class="mt-4 flex items-center justify-between">
        <PrimaryButton :class="{ 'opacity-25': form.processing }" :disabled="form.processing">
          Resend Verification Email
        </PrimaryButton>

        <Link
          :href="route('logout')"
          method="post"
          as="button"
          class="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >Log Out</Link
        >
      </div>
    </form>
  </AuthLayout>
</template>
