<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import TextInput from '@/components/TextInput.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const processing = ref(false)

const submit = async () => {
  processing.value = true
  const success = await authStore.register({
    first_name: form.value.first_name,
    last_name: form.value.last_name,
    email: form.value.email,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation,
  })
  processing.value = false

  if (success) {
    router.push('/dashboard')
  } else {
    form.value.password = ''
    form.value.password_confirmation = ''
  }
}

const errors = computed(() => authStore.errors)
</script>

<template>
  <div>
    <div class="text-center mb-6">
      <h2 class="text-2xl font-medium text-primary mb-2">Create an account</h2>
      <p class="text-text-muted">Track prices and calculate costs before you commit</p>
    </div>

    <form @submit.prevent="submit" class="space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <InputLabel for="first_name" value="First Name" class="text-primary font-medium" />
          <TextInput
            id="first_name"
            type="text"
            class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
            v-model="form.first_name"
            required
            autofocus
            autocomplete="given-name"
            placeholder="John"
          />
          <InputError class="mt-2" :message="errors.first_name?.[0]" />
        </div>
        <div>
          <InputLabel for="last_name" value="Last Name" class="text-primary font-medium" />
          <TextInput
            id="last_name"
            type="text"
            class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
            v-model="form.last_name"
            required
            autocomplete="family-name"
            placeholder="Doe"
          />
          <InputError class="mt-2" :message="errors.last_name?.[0]" />
        </div>
      </div>

      <div>
        <InputLabel for="email" value="Email Address" class="text-primary font-medium" />
        <TextInput
          id="email"
          type="email"
          class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
          v-model="form.email"
          required
          autocomplete="username"
          placeholder="john@example.com"
        />
        <InputError class="mt-2" :message="errors.email?.[0]" />
      </div>

      <div>
        <InputLabel for="password" value="Password" class="text-primary font-medium" />
        <TextInput
          id="password"
          type="password"
          class="mt-2 block w-full rounded-lg border-border focus:border-accent focus:ring-accent"
          v-model="form.password"
          required
          autocomplete="new-password"
          placeholder="Create a strong password"
        />
        <InputError class="mt-2" :message="errors.password?.[0]" />
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
          v-model="form.password_confirmation"
          required
          autocomplete="new-password"
          placeholder="Confirm your password"
        />
        <InputError class="mt-2" :message="errors.password_confirmation?.[0]" />
      </div>

      <div>
        <PrimaryButton
          class="w-full bg-accent hover:bg-accent-dark text-white flex flex-row justify-center py-3 rounded-lg font-medium transition-all duration-150"
          :class="{ 'opacity-50 cursor-not-allowed': processing }"
          :disabled="processing"
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
