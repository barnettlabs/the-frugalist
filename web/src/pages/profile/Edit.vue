<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'
import { useAuthStore } from '@/stores/auth'
import { profileApi } from '@/api/profile'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

// Profile form
const profileForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
})
const profileLoading = ref(false)
const profileErrors = ref<Record<string, string[]>>({})
const profileSuccess = ref(false)

// Password form
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const passwordLoading = ref(false)
const passwordErrors = ref<Record<string, string[]>>({})
const passwordSuccess = ref(false)

// Delete account
const deletePassword = ref('')
const deleteLoading = ref(false)
const deleteErrors = ref<Record<string, string[]>>({})
const showDeleteConfirm = ref(false)

const loadProfile = async () => {
  try {
    const data = await profileApi.getProfile()
    profileForm.value = {
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const updateProfile = async () => {
  profileLoading.value = true
  profileErrors.value = {}
  profileSuccess.value = false

  try {
    await profileApi.updateProfile(profileForm.value)
    profileSuccess.value = true
    await authStore.refreshUser()
  } catch (error: any) {
    if (error.response?.data?.errors) {
      profileErrors.value = error.response.data.errors
    }
  } finally {
    profileLoading.value = false
  }
}

const updatePassword = async () => {
  passwordLoading.value = true
  passwordErrors.value = {}
  passwordSuccess.value = false

  try {
    await profileApi.updatePassword(passwordForm.value)
    passwordSuccess.value = true
    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: '',
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      passwordErrors.value = error.response.data.errors
    }
  } finally {
    passwordLoading.value = false
  }
}

const deleteAccount = async () => {
  deleteLoading.value = true
  deleteErrors.value = {}

  try {
    await profileApi.deleteAccount(deletePassword.value)
    await authStore.logout()
    router.push('/')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      deleteErrors.value = error.response.data.errors
    }
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <PageHeader
        title="Profile Settings"
        description="Manage your account settings and preferences"
        back-link="/dashboard"
        back-label="Dashboard"
      />

      <div class="space-y-6">
        <!-- Profile Information -->
        <div class="bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-6">
          <h2 class="text-lg font-medium text-primary mb-4">Profile Information</h2>
          <p class="text-sm text-text-muted mb-6">Update your account's profile information and email address.</p>

          <div v-if="profileSuccess" class="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm">
            Profile updated successfully.
          </div>

          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputLabel for="first_name" value="First Name" />
                <TextInput
                  id="first_name"
                  v-model="profileForm.first_name"
                  type="text"
                  class="mt-1 block w-full"
                  required
                />
                <InputError :message="profileErrors.first_name?.[0]" class="mt-2" />
              </div>

              <div>
                <InputLabel for="last_name" value="Last Name" />
                <TextInput
                  id="last_name"
                  v-model="profileForm.last_name"
                  type="text"
                  class="mt-1 block w-full"
                  required
                />
                <InputError :message="profileErrors.last_name?.[0]" class="mt-2" />
              </div>
            </div>

            <div>
              <InputLabel for="email" value="Email" />
              <TextInput
                id="email"
                v-model="profileForm.email"
                type="email"
                class="mt-1 block w-full"
                required
              />
              <InputError :message="profileErrors.email?.[0]" class="mt-2" />
            </div>

            <div class="flex justify-end">
              <PrimaryButton :disabled="profileLoading">
                {{ profileLoading ? 'Saving...' : 'Save' }}
              </PrimaryButton>
            </div>
          </form>
        </div>

        <!-- Update Password -->
        <div class="bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-6">
          <h2 class="text-lg font-medium text-primary mb-4">Update Password</h2>
          <p class="text-sm text-text-muted mb-6">Use a strong password to keep your account secure.</p>

          <div v-if="passwordSuccess" class="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm">
            Password updated successfully.
          </div>

          <form @submit.prevent="updatePassword" class="space-y-4">
            <div>
              <InputLabel for="current_password" value="Current Password" />
              <TextInput
                id="current_password"
                v-model="passwordForm.current_password"
                type="password"
                class="mt-1 block w-full"
                required
              />
              <InputError :message="passwordErrors.current_password?.[0]" class="mt-2" />
            </div>

            <div>
              <InputLabel for="password" value="New Password" />
              <TextInput
                id="password"
                v-model="passwordForm.password"
                type="password"
                class="mt-1 block w-full"
                required
              />
              <InputError :message="passwordErrors.password?.[0]" class="mt-2" />
            </div>

            <div>
              <InputLabel for="password_confirmation" value="Confirm Password" />
              <TextInput
                id="password_confirmation"
                v-model="passwordForm.password_confirmation"
                type="password"
                class="mt-1 block w-full"
                required
              />
              <InputError :message="passwordErrors.password_confirmation?.[0]" class="mt-2" />
            </div>

            <div class="flex justify-end">
              <PrimaryButton :disabled="passwordLoading">
                {{ passwordLoading ? 'Updating...' : 'Update Password' }}
              </PrimaryButton>
            </div>
          </form>
        </div>

        <!-- Delete Account -->
        <div class="bg-surface/80 backdrop-blur-sm rounded-lg border border-danger/20 p-6">
          <h2 class="text-lg font-medium text-danger mb-4">Delete Account</h2>
          <p class="text-sm text-text-muted mb-6">
            Once your account is deleted, all of its resources and data will be permanently deleted.
          </p>

          <DangerButton @click="showDeleteConfirm = true">
            Delete Account
          </DangerButton>

          <!-- Delete Confirmation Modal -->
          <Teleport to="body">
            <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div class="bg-surface rounded-lg p-6 max-w-md w-full mx-4 border border-border">
                <h3 class="text-lg font-medium text-primary mb-4">Are you sure?</h3>
                <p class="text-sm text-text-muted mb-4">
                  This action cannot be undone. Please enter your password to confirm.
                </p>

                <form @submit.prevent="deleteAccount">
                  <div class="mb-4">
                    <InputLabel for="delete_password" value="Password" />
                    <TextInput
                      id="delete_password"
                      v-model="deletePassword"
                      type="password"
                      class="mt-1 block w-full"
                      required
                    />
                    <InputError :message="deleteErrors.password?.[0]" class="mt-2" />
                  </div>

                  <div class="flex justify-end gap-3">
                    <button
                      type="button"
                      @click="showDeleteConfirm = false"
                      class="px-4 py-2 text-sm font-medium text-text-muted bg-background hover:bg-border rounded-lg"
                    >
                      Cancel
                    </button>
                    <DangerButton :disabled="deleteLoading">
                      {{ deleteLoading ? 'Deleting...' : 'Delete Account' }}
                    </DangerButton>
                  </div>
                </form>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </div>
  </main>
</template>
