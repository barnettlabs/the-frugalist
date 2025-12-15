<script setup lang="ts">
import { ref } from 'vue'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import TextInput from '@/components/TextInput.vue'
import { authApi } from '@/api/auth'

const form = ref({
  email: '',
})

const processing = ref(false)
const status = ref('')
const errors = ref<Record<string, string[]>>({})

const submit = async () => {
  processing.value = true
  errors.value = {}

  try {
    const response = await authApi.forgotPassword({ email: form.value.email })
    status.value = response.message
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else if (error.response?.data?.message) {
      errors.value = { email: [error.response.data.message] }
    }
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4 text-sm text-gray-600">
      Forgot your password? No problem. Just let us know your email address and we will email you a
      password reset link that will allow you to choose a new one.
    </div>

    <div v-if="status" class="mb-4 text-sm font-medium text-green-600">
      {{ status }}
    </div>

    <form @submit.prevent="submit">
      <div>
        <InputLabel for="email" value="Email" />

        <TextInput
          id="email"
          type="email"
          class="mt-1 block w-full"
          v-model="form.email"
          required
          autofocus
          autocomplete="username"
        />

        <InputError class="mt-2" :message="errors.email?.[0]" />
      </div>

      <div class="mt-4 flex items-center justify-end">
        <PrimaryButton :class="{ 'opacity-25': processing }" :disabled="processing">
          Email Password Reset Link
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>
