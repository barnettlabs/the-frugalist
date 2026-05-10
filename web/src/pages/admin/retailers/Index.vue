<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import Modal from '@/components/Modal.vue'
import { adminRetailersApi, type AdminRetailer } from '@/api/admin'

const retailers = ref<AdminRetailer[]>([])
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const editing = ref<AdminRetailer | null>(null)
const deleting = ref<AdminRetailer | null>(null)

const form = reactive<Partial<AdminRetailer>>({
  name: '',
  slug: '',
  api_base_url: '',
  api_key: '',
  logo_url: '',
  is_active: true,
  coming_soon: false,
  rate_limit_per_hour: 1000,
})
const errors = ref<Record<string, string[]>>({})

const fetchRetailers = async () => {
  loading.value = true
  try {
    retailers.value = await adminRetailersApi.list()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, {
    name: '',
    slug: '',
    api_base_url: '',
    api_key: '',
    logo_url: '',
    is_active: true,
    coming_soon: false,
    rate_limit_per_hour: 1000,
  })
  errors.value = {}
  showForm.value = true
}

const openEdit = (r: AdminRetailer) => {
  editing.value = r
  Object.assign(form, {
    name: r.name,
    slug: r.slug,
    api_base_url: r.api_base_url,
    api_key: r.api_key || '',
    logo_url: r.logo_url || '',
    is_active: r.is_active,
    coming_soon: r.coming_soon,
    rate_limit_per_hour: r.rate_limit_per_hour,
  })
  errors.value = {}
  showForm.value = true
}

const save = async () => {
  saving.value = true
  errors.value = {}
  try {
    if (editing.value) {
      await adminRetailersApi.update(editing.value.id, form)
    } else {
      await adminRetailersApi.create(form)
    }
    showForm.value = false
    await fetchRetailers()
  } catch (e: any) {
    errors.value = e.response?.data?.errors || {}
  } finally {
    saving.value = false
  }
}

const toggleActive = async (r: AdminRetailer) => {
  await adminRetailersApi.update(r.id, { is_active: !r.is_active })
  await fetchRetailers()
}

const confirmDelete = async () => {
  if (!deleting.value) return
  saving.value = true
  try {
    await adminRetailersApi.remove(deleting.value.id)
    deleting.value = null
    await fetchRetailers()
  } finally {
    saving.value = false
  }
}

onMounted(fetchRetailers)
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <header class="flex items-end justify-between mb-8">
      <div>
        <p class="eyebrow">Admin · Retailers</p>
        <h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">Retailers</h1>
        <p class="text-sm text-text-muted mt-2">
          Toggle integrations, manage API keys, and configure rate limits.
        </p>
      </div>
      <button @click="openCreate"
        class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors">
        <PlusIcon class="h-4 w-4" />
        Add retailer
      </button>
    </header>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <Spinner size="lg" color="accent" />
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-dark/50">
          <tr class="text-left">
            <th class="px-4 py-3 eyebrow">Retailer</th>
            <th class="px-4 py-3 eyebrow">Slug</th>
            <th class="px-4 py-3 eyebrow">API Key</th>
            <th class="px-4 py-3 eyebrow">Status</th>
            <th class="px-4 py-3 eyebrow text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in retailers" :key="r.id" class="border-t border-border">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img v-if="r.logo_url" :src="r.logo_url" :alt="r.name" class="h-7 w-7 rounded object-contain" />
                <div>
                  <p class="font-medium text-primary">{{ r.name }}</p>
                  <p class="text-xs text-text-muted">{{ r.api_base_url }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 numeral text-text-muted">{{ r.slug }}</td>
            <td class="px-4 py-3 numeral text-text-muted">
              <span v-if="r.api_key">••••{{ r.api_key.slice(-4) }}</span>
              <span v-else class="text-danger">missing</span>
            </td>
            <td class="px-4 py-3">
              <button @click="toggleActive(r)"
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors"
                :class="r.is_active
                  ? 'bg-success/10 text-success hover:bg-success/20'
                  : 'bg-text-muted/10 text-text-muted hover:bg-text-muted/20'">
                <CheckCircleIcon v-if="r.is_active" class="h-3.5 w-3.5" />
                <XCircleIcon v-else class="h-3.5 w-3.5" />
                {{ r.is_active ? 'Active' : 'Inactive' }}
              </button>
              <span v-if="r.coming_soon"
                class="ml-2 inline-flex items-center px-2 py-1 rounded text-xs bg-accent/10 text-accent-dark">
                Coming soon
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button @click="openEdit(r)" class="p-2 text-text-muted hover:text-primary transition-colors"
                title="Edit">
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button @click="deleting = r" class="p-2 text-text-muted hover:text-danger transition-colors"
                title="Delete">
                <TrashIcon class="h-4 w-4" />
              </button>
            </td>
          </tr>
          <tr v-if="!retailers.length">
            <td colspan="5" class="px-4 py-8 text-center text-text-muted">No retailers yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form modal -->
    <Modal :show="showForm" max-width="lg" @close="showForm = false">
      <form @submit.prevent="save" class="p-6">
        <h2 class="font-display text-xl text-primary tracking-tight mb-4">
          {{ editing ? `Edit ${editing.name}` : 'Add retailer' }}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">Name</label>
            <input v-model="form.name" type="text" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none" />
            <p v-if="errors.name" class="text-xs text-danger mt-1">{{ errors.name[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">Slug</label>
            <input v-model="form.slug" type="text" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" placeholder="bestbuy" />
            <p class="text-xs text-text-muted mt-1">Must match a registered service in <code>RetailerServiceFactory</code>.</p>
            <p v-if="errors.slug" class="text-xs text-danger mt-1">{{ errors.slug[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">API Base URL</label>
            <input v-model="form.api_base_url" type="text" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
            <p v-if="errors.api_base_url" class="text-xs text-danger mt-1">{{ errors.api_base_url[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">API Key</label>
            <input v-model="form.api_key" type="text" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">Logo URL</label>
            <input v-model="form.logo_url" type="text" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">Rate limit (per hour)</label>
            <input v-model.number="form.rate_limit_per_hour" type="number" min="0" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
          </div>
          <div class="flex items-center gap-6 pt-2">
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="form.is_active" type="checkbox" class="rounded border-border" />
              <span>Active</span>
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="form.coming_soon" type="checkbox" class="rounded border-border" />
              <span>Coming soon</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button type="button" @click="showForm = false"
            class="px-4 py-2 text-sm rounded-md border border-border hover:bg-surface-dark transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="saving"
            class="px-4 py-2 text-sm rounded-md bg-primary text-surface hover:bg-primary-light transition-colors disabled:opacity-50">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      :show="!!deleting"
      title="Delete retailer"
      :message="`Delete ${deleting?.name}? This cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      :loading="saving"
      @confirm="confirmDelete"
      @close="deleting = null"
    />
  </div>
</template>
