<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import TextInput from '@/components/TextInput.vue'
import { authApi } from '@/api/auth'

const route = useRoute()
const router = useRouter()

const form = ref({
  token: route.params.token as string,
  email: (route.query.email as string) || '',
  password: '',
  password_confirmation: '',
})

const processing = ref(false)
const errors = ref<Record<string, string[]>>({})

const submit = async () => {
  processing.value = true
  errors.value = {}

  try {
    await authApi.resetPassword({
      token: form.value.token,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })
    router.push('/login?status=password-reset')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else if (error.response?.data?.message) {
      errors.value = { email: [error.response.data.message] }
    }
    form.value.password = ''
    form.value.password_confirmation = ''
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div>
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

      <div class="mt-4">
        <InputLabel for="password" value="Password" />

        <TextInput
          id="password"
          type="password"
          class="mt-1 block w-full"
          v-model="form.password"
          required
          autocomplete="new-password"
        />

        <InputError class="mt-2" :message="errors.password?.[0]" />
      </div>

      <div class="mt-4">
        <InputLabel for="password_confirmation" value="Confirm Password" />

        <TextInput
          id="password_confirmation"
          type="password"
          class="mt-1 block w-full"
          v-model="form.password_confirmation"
          required
          autocomplete="new-password"
        />

        <InputError class="mt-2" :message="errors.password_confirmation?.[0]" />
      </div>

      <div class="mt-4 flex items-center justify-end">
        <PrimaryButton :class="{ 'opacity-25': processing }" :disabled="processing">
          Reset Password
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>
