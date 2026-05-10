<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { adminUsersApi, type AdminUser } from '@/api/admin'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ id: string | number }>()

const user = ref<AdminUser | null>(null)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref<string | null>(null)
const showAdminToggle = ref(false)
const authStore = useAuthStore()

const fetchUser = async () => {
  loading.value = true
  try {
    user.value = await adminUsersApi.get(Number(props.id))
  } finally {
    loading.value = false
  }
}

const requestToggleAdmin = () => {
  errorMessage.value = null
  showAdminToggle.value = true
}

const confirmToggleAdmin = async () => {
  if (!user.value) return
  saving.value = true
  errorMessage.value = null
  try {
    user.value = await adminUsersApi.update(user.value.id, { is_admin: !user.value.is_admin })
    showAdminToggle.value = false
  } catch (e: any) {
    errorMessage.value = e.response?.data?.message || 'Update failed.'
    showAdminToggle.value = false
  } finally {
    saving.value = false
  }
}

const displayName = (u: AdminUser) => {
  const name = `${u.first_name || ''} ${u.last_name || ''}`.trim()
  return name || u.email
}

const isSelf = () => authStore.user?.id === user.value?.id

onMounted(fetchUser)
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <RouterLink to="/admin/users" class="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
      <ArrowLeftIcon class="h-4 w-4" />
      Back to users
    </RouterLink>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <Spinner size="lg" color="accent" />
    </div>

    <div v-else-if="user">
      <header class="mb-8">
        <p class="eyebrow">User</p>
        <h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">{{ displayName(user) }}</h1>
        <p class="text-sm text-text-muted mt-1 numeral">{{ user.email }}</p>
      </header>

      <div v-if="errorMessage" class="mb-4 p-3 rounded-md bg-danger/10 text-danger text-sm">
        {{ errorMessage }}
      </div>

      <div class="card p-6 mb-4">
        <h2 class="font-display text-lg text-primary tracking-tight mb-4">Permissions</h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <ShieldCheckIcon class="h-4 w-4" :class="user.is_admin ? 'text-accent' : 'text-text-muted'" />
              <p class="font-medium text-primary">Admin access</p>
            </div>
            <p class="text-sm text-text-muted mt-1">
              {{ user.is_admin
                ? 'Can manage retailers, announcements, users, and bug reports.'
                : 'Standard user — no admin privileges.' }}
            </p>
          </div>
          <button @click="requestToggleAdmin" :disabled="isSelf() && user.is_admin"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            :class="user.is_admin
              ? 'bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50 disabled:cursor-not-allowed'
              : 'bg-accent text-surface hover:bg-accent-dark'"
            :title="isSelf() && user.is_admin ? 'You cannot remove your own admin access' : ''">
            {{ user.is_admin ? 'Revoke admin' : 'Grant admin' }}
          </button>
        </div>
      </div>

      <div class="card p-6 mb-4">
        <h2 class="font-display text-lg text-primary tracking-tight mb-4">Account</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="eyebrow">Phone</dt>
            <dd class="numeral mt-1">{{ user.phone_number || '—' }}</dd>
          </div>
          <div>
            <dt class="eyebrow">Email verified</dt>
            <dd class="mt-1">{{ user.email_verified_at ? 'Yes' : 'No' }}</dd>
          </div>
          <div>
            <dt class="eyebrow">Phone verified</dt>
            <dd class="mt-1">{{ user.phone_verified_at ? 'Yes' : 'No' }}</dd>
          </div>
          <div>
            <dt class="eyebrow">Joined</dt>
            <dd class="numeral mt-1">{{ new Date(user.created_at).toLocaleString() }}</dd>
          </div>
        </dl>
      </div>

      <div class="card p-6">
        <h2 class="font-display text-lg text-primary tracking-tight mb-4">Activity</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="figure text-2xl text-primary">{{ user.tracked_products_count ?? 0 }}</p>
            <p class="eyebrow mt-1">Tracked items</p>
          </div>
          <div>
            <p class="figure text-2xl text-primary">{{ user.vehicle_finance_sheets_count ?? 0 }}</p>
            <p class="eyebrow mt-1">Finance sheets</p>
          </div>
          <div>
            <p class="figure text-2xl text-primary">{{ user.vehicle_lease_sheets_count ?? 0 }}</p>
            <p class="eyebrow mt-1">Lease sheets</p>
          </div>
          <div>
            <p class="figure text-2xl text-primary">{{ user.devices_count ?? 0 }}</p>
            <p class="eyebrow mt-1">Devices</p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="showAdminToggle"
      :title="user?.is_admin ? 'Revoke admin access?' : 'Grant admin access?'"
      :message="user?.is_admin
        ? `Remove admin access for ${user?.email}? They will lose access to the admin console.`
        : `Grant admin access to ${user?.email}? They will be able to manage all admin resources.`"
      :confirm-text="user?.is_admin ? 'Revoke' : 'Grant'"
      :variant="user?.is_admin ? 'danger' : 'primary'"
      :loading="saving"
      @confirm="confirmToggleAdmin"
      @close="showAdminToggle = false"
    />
  </div>
</template>
