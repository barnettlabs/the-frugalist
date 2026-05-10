<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Spinner from '@/components/Spinner.vue'
import {
  adminBugReportsApi,
  type AdminBugReport,
  type BugReportStatus,
  type PaginatedBugReports,
} from '@/api/admin'

const result = ref<PaginatedBugReports | null>(null)
const loading = ref(true)
const status = ref<BugReportStatus | ''>('')
const page = ref(1)

const STATUS_OPTIONS: { value: BugReportStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_COLORS: Record<BugReportStatus, string> = {
  new: 'bg-danger/10 text-danger',
  in_progress: 'bg-accent/10 text-accent-dark',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-text-muted/10 text-text-muted',
}

const fetchAll = async () => {
  loading.value = true
  try {
    result.value = await adminBugReportsApi.list({
      status: status.value || undefined,
      page: page.value,
    })
  } finally {
    loading.value = false
  }
}

watch(status, () => { page.value = 1; fetchAll() })
watch(page, fetchAll)

const userLabel = (b: AdminBugReport) => {
  if (!b.user) return '—'
  const name = `${b.user.first_name || ''} ${b.user.last_name || ''}`.trim()
  return name || b.user.email
}

onMounted(fetchAll)
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <header class="mb-8">
      <p class="eyebrow">Admin · Bug Reports</p>
      <h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">Bug Reports</h1>
      <p class="text-sm text-text-muted mt-2">{{ result?.total ?? 0 }} reports.</p>
    </header>

    <div class="flex items-center gap-1 mb-6 border border-border rounded-md p-1 bg-surface w-fit">
      <button v-for="s in STATUS_OPTIONS" :key="s.value" @click="status = s.value"
        class="px-3 py-1.5 rounded text-xs font-medium transition-colors"
        :class="status === s.value ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary'">
        {{ s.label }}
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <Spinner size="lg" color="accent" />
    </div>

    <div v-else-if="result" class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-dark/50">
          <tr class="text-left">
            <th class="px-4 py-3 eyebrow">Subject</th>
            <th class="px-4 py-3 eyebrow">User</th>
            <th class="px-4 py-3 eyebrow">Status</th>
            <th class="px-4 py-3 eyebrow">Reported</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in result.data" :key="b.id" class="border-t border-border hover:bg-surface-dark/30 transition-colors">
            <td class="px-4 py-3">
              <RouterLink :to="`/admin/bug-reports/${b.id}`" class="text-primary font-medium hover:text-accent-dark">
                {{ b.subject }}
              </RouterLink>
              <p class="text-xs text-text-muted mt-1 truncate max-w-md">{{ b.description }}</p>
            </td>
            <td class="px-4 py-3 text-xs text-text-muted">{{ userLabel(b) }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium" :class="STATUS_COLORS[b.status]">
                {{ b.status.replace('_', ' ') }}
              </span>
            </td>
            <td class="px-4 py-3 numeral text-xs text-text-muted">
              {{ new Date(b.created_at).toLocaleString() }}
            </td>
          </tr>
          <tr v-if="!result.data.length">
            <td colspan="4" class="px-4 py-8 text-center text-text-muted">No bug reports.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="result && result.last_page > 1" class="flex items-center justify-between mt-4 text-sm">
      <p class="text-text-muted">Page {{ result.current_page }} of {{ result.last_page }}</p>
      <div class="flex gap-2">
        <button :disabled="page <= 1" @click="page--"
          class="px-3 py-1.5 rounded-md border border-border hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Previous
        </button>
        <button :disabled="page >= result.last_page" @click="page++"
          class="px-3 py-1.5 rounded-md border border-border hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Next
        </button>
      </div>
    </div>
  </div>
</template>
