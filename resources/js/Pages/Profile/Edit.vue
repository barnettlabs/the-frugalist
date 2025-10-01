<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm.vue'
import UpdatePasswordForm from './Partials/UpdatePasswordForm.vue'
import DeleteUserForm from './Partials/DeleteUserForm.vue'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at?: string
}

interface Props {
  user: User
  mustVerifyEmail: boolean
  status?: string
}

const props = defineProps<Props>()

const fullName = computed((): string => {
  return `${props.user?.first_name ?? ''} ${props.user?.last_name ?? ''}`.trim()
})

const memberSince = computed((): string => {
  if (props.user?.created_at) {
    const date = new Date(props.user.created_at)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return ''
})

const breadcrumbs = computed(() => [{ name: 'Profile', href: '/profile', current: true }])
</script>

<template>
  <Head title="Profile" />

  <AuthenticatedLayout :user="user" :breadcrumbs="breadcrumbs">
    <main class="-mt-24 pb-8 flex-1">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 class="sr-only">Profile</h1>

        <!-- Main 3 column grid -->
        <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-8">
          <!-- Left column -->
          <div class="grid grid-cols-1 gap-4">
            <!-- Welcome panel -->
            <section aria-labelledby="profile-overview-title">
              <div class="overflow-hidden rounded-lg bg-white shadow">
                <h2 class="sr-only" id="profile-overview-title">Profile Overview</h2>

                <div class="p-8">
                  <div class="sm:flex sm:items-start sm:justify-between">
                    <div class="sm:flex sm:space-x-5">
                      <div class="flex-shrink-0">
                        <div
                          class="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold"
                        >
                          {{ (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') }}
                        </div>
                      </div>
                      <div class="mt-4 text-center sm:mt-0 sm:text-left">
                        <p class="text-xl font-bold text-gray-900 sm:text-2xl">
                          {{ fullName }}
                        </p>
                      </div>
                    </div>
                    <div
                      class="mt-4 sm:mt-0 flex flex-col justify-center text-center sm:text-right"
                    >
                      <p class="text-sm text-gray-400">member since:</p>
                      <p class="text-sm text-gray-400">{{ memberSince }}</p>
                    </div>
                  </div>

                  <div class="mt-4">
                    <UpdateProfileInformationForm
                      :user="user"
                      :must-verify-email="mustVerifyEmail"
                      :status="status"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Right column: password reset -->
          <div class="grid grid-cols-1 gap-4 relative">
            <section>
              <div class="overflow-hidden rounded-lg bg-white shadow">
                <div class="p-8">
                  <UpdatePasswordForm class="max-w-xl" />
                  <div
                    class="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex justify-center items-center"
                  >
                    <span class="text-white text-2xl font-bold">Feature Coming Soon</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  </AuthenticatedLayout>
</template>
