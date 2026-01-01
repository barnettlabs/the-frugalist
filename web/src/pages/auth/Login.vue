<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import Checkbox from '@/components/Checkbox.vue'
import FormInput from '@/components/FormInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const processing = ref(false)

const submit = async () => {
  processing.value = true
  const success = await authStore.login({
    email: form.value.email,
    password: form.value.password,
    remember: form.value.remember,
  })
  processing.value = false

  if (success) {
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  }
}

const errors = computed(() => authStore.errors)
</script>

<template>
  <div class="space-y-6">
    <form @submit.prevent="submit" class="space-y-6">
      <FormInput
        v-model="form.email"
        name="email"
        type="email"
        label="Email"
        :error="errors.email?.[0]"
        required
        autofocus
        autocomplete="username"
      />

      <FormInput
        v-model="form.password"
        name="password"
        type="password"
        label="Password"
        :error="errors.password?.[0]"
        required
        autocomplete="current-password"
      />

      <div class="flex items-center">
        <Checkbox name="remember" v-model:checked="form.remember" />
        <span class="ms-2 text-sm text-text-muted">Remember me</span>
      </div>

      <div class="flex items-center justify-end">
        <RouterLink
          to="/forgot-password"
          class="rounded-md text-sm text-text-muted underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          Forgot your password?
        </RouterLink>

        <BaseButton type="submit" variant="primary" class="ms-4" :disabled="processing">
          {{ processing ? 'Logging in...' : 'Log in' }}
        </BaseButton>
      </div>

      <div class="mt-6 pt-8 text-center border-t border-border">
        <p class="text-sm text-text-muted">
          Don't have an account?
          <RouterLink
            to="/register"
            class="text-accent hover:text-accent-dark font-medium transition-colors underline"
          >
            Create an account
          </RouterLink>
        </p>
      </div>
    </form>
  </div>
</template>
