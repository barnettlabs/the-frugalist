<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { PlusIcon, PencilSquareIcon, TrashIcon, BoltIcon } from '@heroicons/vue/24/outline'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import Modal from '@/components/Modal.vue'
import { adminAiProvidersApi, type AiProvider, type ProviderTestResult } from '@/api/admin-ai'

const providers = ref<AiProvider[]>([])
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const editing = ref<AiProvider | null>(null)
const deleting = ref<AiProvider | null>(null)
const testing = ref<AiProvider | null>(null)
const testResult = ref<ProviderTestResult | null>(null)
const testLoading = ref(false)

const form = reactive<Partial<AiProvider> & { api_key?: string; keep_key?: boolean }>({
  slug: '',
  name: '',
  base_url: '',
  api_key: '',
  default_model: '',
  enabled: true,
  is_default: false,
  sends_data_externally: false,
  timeout_seconds: 20,
  keep_key: true,
})
const errors = ref<Record<string, string[]>>({})

const fetch = async () => {
  loading.value = true
  try {
    providers.value = await adminAiProvidersApi.list()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, {
    slug: '', name: '', base_url: '', api_key: '', default_model: '',
    enabled: true, is_default: false, sends_data_externally: false,
    timeout_seconds: 20, keep_key: false,
  })
  errors.value = {}
  showForm.value = true
}

const openEdit = (p: AiProvider) => {
  editing.value = p
  Object.assign(form, {
    slug: p.slug, name: p.name, base_url: p.base_url,
    api_key: '', default_model: p.default_model || '',
    enabled: p.enabled, is_default: p.is_default,
    sends_data_externally: p.sends_data_externally,
    timeout_seconds: p.timeout_seconds,
    keep_key: p.has_api_key,
  })
  errors.value = {}
  showForm.value = true
}

const save = async () => {
  saving.value = true
  errors.value = {}
  try {
    const payload: any = { ...form }
    if (editing.value && form.keep_key) {
      delete payload.api_key
    }
    delete payload.keep_key

    if (editing.value) {
      await adminAiProvidersApi.update(editing.value.id, payload)
    } else {
      await adminAiProvidersApi.create(payload)
    }
    showForm.value = false
    await fetch()
  } catch (e: any) {
    errors.value = e.response?.data?.errors || {}
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (!deleting.value) return
  saving.value = true
  try {
    await adminAiProvidersApi.remove(deleting.value.id)
    deleting.value = null
    await fetch()
  } finally {
    saving.value = false
  }
}

const openTest = async (p: AiProvider) => {
  testing.value = p
  testResult.value = null
  testLoading.value = true
  try {
    testResult.value = await adminAiProvidersApi.test(p.id)
  } catch (e: any) {
    testResult.value = {
      models: { ok: false, error: e.message, models: [] },
      ping: { ok: false, content: null, error: e.message, latency_ms: 0 },
    }
  } finally {
    testLoading.value = false
  }
}

onMounted(fetch)
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <header class="flex items-end justify-between mb-8">
      <div>
        <p class="eyebrow">Admin · AI · Providers</p>
        <h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">AI Providers</h1>
        <p class="text-sm text-text-muted mt-2">
          OpenAI-compatible endpoints. Swap base URLs and API keys on the fly — agents pick up changes immediately.
        </p>
      </div>
      <button @click="openCreate" class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors">
        <PlusIcon class="h-4 w-4" />
        Add provider
      </button>
    </header>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <Spinner size="lg" color="accent" />
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-dark/50">
          <tr class="text-left">
            <th class="px-4 py-3 eyebrow">Provider</th>
            <th class="px-4 py-3 eyebrow">Base URL</th>
            <th class="px-4 py-3 eyebrow">Model</th>
            <th class="px-4 py-3 eyebrow">Key</th>
            <th class="px-4 py-3 eyebrow">Flags</th>
            <th class="px-4 py-3 eyebrow text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in providers" :key="p.id" class="border-t border-border">
            <td class="px-4 py-3">
              <p class="font-medium text-primary">{{ p.name }}</p>
              <p class="text-xs text-text-muted numeral">{{ p.slug }}</p>
            </td>
            <td class="px-4 py-3 numeral text-text-muted text-xs">{{ p.base_url }}</td>
            <td class="px-4 py-3 numeral text-text-muted text-xs">{{ p.default_model || '—' }}</td>
            <td class="px-4 py-3 text-xs">
              <span v-if="p.has_api_key" class="text-success">set</span>
              <span v-else class="text-text-muted">none</span>
            </td>
            <td class="px-4 py-3 text-xs space-x-1">
              <span v-if="p.is_default" class="px-2 py-0.5 rounded bg-accent/10 text-accent-dark">default</span>
              <span v-if="!p.enabled" class="px-2 py-0.5 rounded bg-danger/10 text-danger">disabled</span>
              <span v-if="p.sends_data_externally" class="px-2 py-0.5 rounded bg-warning/10 text-warning">external</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button @click="openTest(p)" class="p-2 text-text-muted hover:text-accent transition-colors" title="Test connection">
                <BoltIcon class="h-4 w-4" />
              </button>
              <button @click="openEdit(p)" class="p-2 text-text-muted hover:text-primary transition-colors" title="Edit">
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button @click="deleting = p" class="p-2 text-text-muted hover:text-danger transition-colors" title="Delete">
                <TrashIcon class="h-4 w-4" />
              </button>
            </td>
          </tr>
          <tr v-if="!providers.length">
            <td colspan="6" class="px-4 py-8 text-center text-text-muted">No providers yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :show="showForm" max-width="lg" @close="showForm = false">
      <form @submit.prevent="save" class="p-6">
        <h2 class="font-display text-xl text-primary tracking-tight mb-4">
          {{ editing ? `Edit ${editing.name}` : 'Add provider' }}
        </h2>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1">Slug</label>
              <input v-model="form.slug" type="text" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
              <p v-if="errors.slug" class="text-xs text-danger mt-1">{{ errors.slug[0] }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1">Name</label>
              <input v-model="form.name" type="text" class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none" />
              <p v-if="errors.name" class="text-xs text-danger mt-1">{{ errors.name[0] }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">Base URL</label>
            <input v-model="form.base_url" type="text" placeholder="https://your-tunnel/v1"
              class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
            <p class="text-xs text-text-muted mt-1">OpenAI-compatible. Should end with /v1 (no trailing slash).</p>
            <p v-if="errors.base_url" class="text-xs text-danger mt-1">{{ errors.base_url[0] }}</p>
          </div>

          <div>
            <label class="flex items-center justify-between text-sm font-medium text-text-muted mb-1">
              API Key
              <label v-if="editing && editing.has_api_key" class="text-xs font-normal inline-flex items-center gap-1.5">
                <input v-model="form.keep_key" type="checkbox" class="rounded border-border" />
                Keep existing
              </label>
            </label>
            <input v-model="form.api_key" :disabled="!!editing && form.keep_key" type="password"
              class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral disabled:bg-surface-dark disabled:cursor-not-allowed" />
            <p class="text-xs text-text-muted mt-1">Leave blank to remove. Stored encrypted.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1">Default model</label>
              <input v-model="form.default_model" type="text" placeholder="qwen2.5-7b-instruct"
                class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-muted mb-1">Timeout (s)</label>
              <input v-model.number="form.timeout_seconds" type="number" min="1" max="120"
                class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none numeral" />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4 pt-2">
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="form.enabled" type="checkbox" class="rounded border-border" />
              <span>Enabled</span>
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="form.is_default" type="checkbox" class="rounded border-border" />
              <span>Default</span>
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input v-model="form.sends_data_externally" type="checkbox" class="rounded border-border" />
              <span>Sends data externally</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button type="button" @click="showForm = false" class="px-4 py-2 text-sm rounded-md border border-border hover:bg-surface-dark transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="saving" class="px-4 py-2 text-sm rounded-md bg-primary text-surface hover:bg-primary-light transition-colors disabled:opacity-50">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </form>
    </Modal>

    <Modal :show="!!testing" max-width="lg" @close="testing = null">
      <div class="p-6">
        <h2 class="font-display text-xl text-primary tracking-tight mb-4">
          Test: {{ testing?.name }}
        </h2>

        <div v-if="testLoading" class="py-8 flex items-center justify-center">
          <Spinner size="lg" color="accent" />
        </div>

        <div v-else-if="testResult" class="space-y-4 text-sm">
          <section>
            <h3 class="eyebrow mb-2">GET /models</h3>
            <p v-if="testResult.models.ok" class="text-success">OK — {{ testResult.models.models.length }} models</p>
            <p v-else class="text-danger">Failed: {{ testResult.models.error }}</p>
            <ul v-if="testResult.models.models.length" class="mt-2 text-xs text-text-muted numeral space-y-0.5 max-h-32 overflow-y-auto">
              <li v-for="m in testResult.models.models" :key="m">{{ m }}</li>
            </ul>
          </section>
          <section>
            <h3 class="eyebrow mb-2">POST /chat/completions (ping)</h3>
            <p v-if="testResult.ping.ok" class="text-success">
              OK · {{ testResult.ping.latency_ms }}ms · response: "{{ testResult.ping.content }}"
            </p>
            <p v-else class="text-danger">Failed: {{ testResult.ping.error }}</p>
          </section>
        </div>

        <div class="mt-6 flex justify-end">
          <button @click="testing = null" class="px-4 py-2 text-sm rounded-md border border-border hover:bg-surface-dark transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>

    <ConfirmDialog :show="!!deleting" title="Delete provider"
      :message="`Delete ${deleting?.name}? Agents pointing here will lose their provider.`"
      confirm-text="Delete" variant="danger" :loading="saving"
      @confirm="confirmDelete" @close="deleting = null" />
  </div>
</template>
