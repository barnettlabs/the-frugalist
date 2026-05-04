<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import TextInput from '@/components/TextInput.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const registerSchema = toTypedSchema(
  z
    .object({
      first_name: z.string().min(1, 'The first name field is required.'),
      last_name: z.string().min(1, 'The last name field is required.'),
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
  validationSchema: registerSchema,
  initialValues: {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  },
})

const [firstName] = defineField('first_name')
const [lastName] = defineField('last_name')
const [email] = defineField('email')
const [password] = defineField('password')
const [passwordConfirmation] = defineField('password_confirmation')

const processing = ref(false)

const submit = handleSubmit(async (values) => {
  authStore.clearErrors()
  processing.value = true

  const success = await authStore.register({
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    password: values.password,
    password_confirmation: values.password_confirmation,
  })

  processing.value = false

  if (success) {
    router.push('/dashboard')
  } else {
    // Clear password fields on failure
    resetForm({
      values: {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: '',
        password_confirmation: '',
      },
    })

    // Map server errors to form fields
    if (authStore.errors) {
      const serverErrors: Record<string, string> = {}
      for (const [key, messages] of Object.entries(authStore.errors)) {
        if (messages?.[0]) {
          serverErrors[key] = messages[0]
        }
      }
      setErrors(serverErrors)
    }
  }
})
</script>

<template>
  <div>
    <div class="text-center mb-6">
      <h2 class="text-2xl font-medium text-primary">Create account</h2>
    </div>

    <form @submit="submit" class="space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <InputLabel for="first_name" value="First Name" class="text-primary font-medium" />
          <TextInput
            id="first_name"
            type="text"
            class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
            v-model="firstName"
            autofocus
            autocomplete="given-name"
            placeholder="John"
          />
          <InputError class="mt-2" :message="errors.first_name" />
        </div>
        <div>
          <InputLabel for="last_name" value="Last Name" class="text-primary font-medium" />
          <TextInput
            id="last_name"
            type="text"
            class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
            v-model="lastName"
            autocomplete="family-name"
            placeholder="Doe"
          />
          <InputError class="mt-2" :message="errors.last_name" />
        </div>
      </div>

      <div>
        <InputLabel for="email" value="Email Address" class="text-primary font-medium" />
        <TextInput
          id="email"
          type="email"
          class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
          v-model="email"
          autocomplete="username"
          placeholder="john@example.com"
        />
        <InputError class="mt-2" :message="errors.email" />
      </div>

      <div>
        <InputLabel for="password" value="Password" class="text-primary font-medium" />
        <TextInput
          id="password"
          type="password"
          class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
          v-model="password"
          autocomplete="new-password"
          placeholder="Create a strong password"
        />
        <InputError class="mt-2" :message="errors.password" />
      </div>

      <div>
        <InputLabel
          for="password_confirmation"
          value="Confirm Password"
          class="text-primary font-medium"
        />
        <TextInput
          id="password_confirmation"
          type="password"
          class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
          v-model="passwordConfirmation"
          autocomplete="new-password"
          placeholder="Confirm your password"
        />
        <InputError class="mt-2" :message="errors.password_confirmation" />
      </div>

      <div>
        <PrimaryButton
          class="w-full bg-accent hover:bg-accent-dark text-white flex flex-row justify-center py-3 rounded-lg font-medium transition-all duration-150"
          :class="{ 'opacity-50 cursor-not-allowed': processing }"
          :disabled="processing"
          type="submit"
        >
          <span v-if="processing">Creating Account...</span>
          <span v-else>Create Account</span>
        </PrimaryButton>
      </div>

      <div class="text-center pt-4 border-t border-border">
        <p class="text-sm text-text-muted">
          Already have an account?
          <RouterLink
            to="/login"
            class="text-accent hover:text-accent-dark font-medium transition-colors"
          >
            Sign in
          </RouterLink>
        </p>
      </div>
    </form>
  </div>
</template>
