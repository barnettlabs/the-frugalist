<script setup>
import Checkbox from '@/Components/Checkbox.vue'
import AuthLayout from '@/Layouts/AuthLayout.vue'
import FormInput from '@/Components/FormInput.vue'
import BaseButton from '@/Components/BaseButton.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'

defineProps({
  canResetPassword: {
    type: Boolean,
  },
  status: {
    type: String,
  },
})

const form = useForm({
  email: '',
  password: '',
  remember: false,
})

const submit = () => {
  form.post(route('login'), {
    onFinish: () => form.reset('password'),
  })
}
</script>

<template>
  <AuthLayout>
    <Head title="Log in" />

    <div v-if="status" class="mb-4 text-sm font-medium text-green-600">
      {{ status }}
    </div>

    <form @submit.prevent="submit" class="space-y-6">
      <FormInput
        v-model="form.email"
        name="email"
        type="email"
        label="Email"
        :error="form.errors.email"
        required
        autofocus
        autocomplete="username"
      />

      <FormInput
        v-model="form.password"
        name="password"
        type="password"
        label="Password"
        :error="form.errors.password"
        required
        autocomplete="current-password"
      />

      <div class="flex items-center">
        <Checkbox name="remember" v-model:checked="form.remember" />
        <span class="ms-2 text-sm text-gray-600">Remember me</span>
      </div>

      <div class="flex items-center justify-end">
        <Link
          v-if="canResetPassword"
          :href="route('password.request')"
          class="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Forgot your password?
        </Link>

        <BaseButton type="submit" variant="primary" class="ms-4" :disabled="form.processing">
          Log in
        </BaseButton>
      </div>

      <div class="mt-6 pt-8 text-center border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <Link
            :href="route('register')"
            class="text-primary hover:text-primary-shade-1 font-medium transition-colors underline"
          >
            Start smart shopping
          </Link>
        </p>
      </div>
    </form>
  </AuthLayout>
</template>
