<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import TextInput from '@/components/TextInput.vue'
import { authApi } from '@/api/auth'

const route = useRoute()
const router = useRouter()

const resetPasswordSchema = toTypedSchema(
  z
    .object({
      email: z
        .string()
        .min(1, 'The email field is required.')
        .email('Please enter a valid email address.'),
      password: z
        .string()
        .min(1, 'The password field is required.')
        .min(8, 'The password must be at least 8 characters.'),
      password_confirmation: z.string().min(1, 'Please confirm your password.'),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: 'The passwords do not match.',
      path: ['password_confirmation'],
    })
)

const { defineField, handleSubmit, errors, setErrors, resetForm } = useForm({
  validationSchema: resetPasswordSchema,
  initialValues: {
    email: (route.query.email as string) || '',
    password: '',
    password_confirmation: '',
  },
})

const [email] = defineField('email')
const [password] = defineField('password')
const [passwordConfirmation] = defineField('password_confirmation')

const token = route.params.token as string
const processing = ref(false)

const submit = handleSubmit(async (values) => {
  processing.value = true

  try {
    await authApi.resetPassword({
      token,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    })
    router.push('/login?status=password-reset')
  } catch (error: any) {
    // Clear password fields on error
    resetForm({
      values: {
        email: values.email,
        password: '',
        password_confirmation: '',
      },
    })

    if (error.response?.data?.errors) {
      const serverErrors: Record<string, string> = {}
      for (const [key, messages] of Object.entries(error.response.data.errors)) {
        if ((messages as string[])?.[0]) {
          serverErrors[key] = (messages as string[])[0]
        }
      }
      setErrors(serverErrors)
    } else if (error.response?.data?.message) {
      setErrors({ email: error.response.data.message })
    }
  } finally {
    processing.value = false
  }
})
</script>

<template>
  <div>
    <form @submit="submit">
      <div>
        <InputLabel for="email" value="Email" />

        <TextInput
          id="email"
          type="email"
          class="mt-1 block w-full"
          v-model="email"
          autofocus
          autocomplete="username"
        />

        <InputError class="mt-2" :message="errors.email" />
      </div>

      <div class="mt-4">
        <InputLabel for="password" value="Password" />

        <TextInput
          id="password"
          type="password"
          class="mt-1 block w-full"
          v-model="password"
          autocomplete="new-password"
        />

        <InputError class="mt-2" :message="errors.password" />
      </div>

      <div class="mt-4">
        <InputLabel for="password_confirmation" value="Confirm Password" />

        <TextInput
          id="password_confirmation"
          type="password"
          class="mt-1 block w-full"
          v-model="passwordConfirmation"
          autocomplete="new-password"
        />

        <InputError class="mt-2" :message="errors.password_confirmation" />
      </div>

      <div class="mt-4 flex items-center justify-end">
        <PrimaryButton :class="{ 'opacity-25': processing }" :disabled="processing">
          Reset Password
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>
