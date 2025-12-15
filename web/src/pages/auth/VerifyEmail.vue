<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PrimaryButton from '@/components/PrimaryButton.vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const processing = ref(false)
const verificationLinkSent = ref(false)

const submit = async () => {
  processing.value = true

  try {
    await authApi.resendEmailVerification()
    verificationLinkSent.value = true
  } catch (error) {
    console.error('Failed to resend verification email:', error)
  } finally {
    processing.value = false
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Automatically send verification email when page loads
onMounted(async () => {
  try {
    await authApi.resendEmailVerification()
    verificationLinkSent.value = true
  } catch (error) {
    // Ignore errors on auto-send
  }
})
</script>

<template>
  <div>
    <div class="mb-4 text-sm text-gray-600">
      Thanks for signing up! Before getting started, please verify your email address by clicking
      on the link we've sent to your email. If you don't see it, check your spam folder.
    </div>

    <div class="mb-4 text-sm font-medium text-green-600" v-if="verificationLinkSent">
      A verification link has been sent to your email address.
    </div>

    <form @submit.prevent="submit">
      <div class="mt-4 flex items-center justify-between">
        <PrimaryButton :class="{ 'opacity-25': processing }" :disabled="processing">
          Resend Verification Email
        </PrimaryButton>

        <button
          type="button"
          @click="logout"
          class="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Log Out
        </button>
      </div>
    </form>
  </div>
</template>
