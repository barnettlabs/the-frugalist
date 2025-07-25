<script setup lang="ts">
import AuthLayout from '@/Layouts/AuthLayout.vue'
import InputError from '@/Components/InputError.vue'
import InputLabel from '@/Components/InputLabel.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import TextInput from '@/Components/TextInput.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'

const form = useForm({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const submit = () => {
  form.post(route('register'), {
    onFinish: () => form.reset('password', 'password_confirmation'),
  })
}
</script>

<template>
  <AuthLayout>
    <Head title="Start Smart Shopping" />

    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Start Smart Shopping</h2>
      <p class="text-gray-600">Create your account and start saving time and money on vehicle purchases</p>
    </div>

    <form @submit.prevent="submit" class="space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <InputLabel for="first_name" value="First Name" class="text-gray-900 font-medium" />
          <TextInput
            id="first_name"
            type="text"
            class="mt-2 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            v-model="form.first_name"
            required
            autofocus
            autocomplete="given-name"
            placeholder="John"
          />
          <InputError class="mt-2" :message="form.errors.first_name" />
        </div>
        <div>
          <InputLabel for="last_name" value="Last Name" class="text-gray-900 font-medium" />
          <TextInput
            id="last_name"
            type="text"
            class="mt-2 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            v-model="form.last_name"
            required
            autocomplete="family-name"
            placeholder="Doe"
          />
          <InputError class="mt-2" :message="form.errors.last_name" />
        </div>
      </div>

      <div>
        <InputLabel for="email" value="Email Address" class="text-gray-900 font-medium" />
        <TextInput
          id="email"
          type="email"
          class="mt-2 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
          v-model="form.email"
          required
          autocomplete="username"
          placeholder="john@example.com"
        />
        <InputError class="mt-2" :message="form.errors.email" />
      </div>

      <div>
        <InputLabel for="password" value="Password" class="text-gray-900 font-medium" />
        <TextInput
          id="password"
          type="password"
          class="mt-2 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
          v-model="form.password"
          required
          autocomplete="new-password"
          placeholder="Create a strong password"
        />
        <InputError class="mt-2" :message="form.errors.password" />
      </div>

      <div>
        <InputLabel
          for="password_confirmation"
          value="Confirm Password"
          class="text-gray-900 font-medium"
        />
        <TextInput
          id="password_confirmation"
          type="password"
          class="mt-2 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
          v-model="form.password_confirmation"
          required
          autocomplete="new-password"
          placeholder="Confirm your password"
        />
        <InputError class="mt-2" :message="form.errors.password_confirmation" />
      </div>

      <div>
        <PrimaryButton
          class="w-full bg-primary hover:bg-primary-shade-1 text-white flex flex-row justify-center py-3 rounded-lg font-medium transition-all duration-150 hover:neon-glow"
          :class="{ 'opacity-50 cursor-not-allowed': form.processing }"
          :disabled="form.processing"
        >
          <span v-if="form.processing">Creating Account...</span>
          <span v-else>Start Smart Shopping</span>
        </PrimaryButton>
      </div>

      <div class="text-center pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Already have an account?
          <Link
            :href="route('login')"
            class="text-primary hover:text-primary-shade-1 font-medium transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  </AuthLayout>
</template>
