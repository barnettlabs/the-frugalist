<script setup lang="ts">
import { ArrowLeftIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { type AdminBugReport, adminBugReportsApi, type BugReportStatus } from '@/api/admin';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Spinner from '@/components/Spinner.vue';

const props = defineProps<{ id: string | number }>();
const router = useRouter();

const report = ref<AdminBugReport | null>(null);
const loading = ref(true);
const saving = ref(false);
const showDelete = ref(false);

const STATUSES: BugReportStatus[] = ['new', 'in_progress', 'resolved', 'closed'];

const STATUS_LABELS: Record<BugReportStatus, string> = {
	new: 'New',
	in_progress: 'In progress',
	resolved: 'Resolved',
	closed: 'Closed',
};

const fetchReport = async () => {
	loading.value = true;
	try {
		report.value = await adminBugReportsApi.get(Number(props.id));
	} finally {
		loading.value = false;
	}
};

const updateStatus = async (s: BugReportStatus) => {
	if (!report.value) return;
	saving.value = true;
	try {
		report.value = await adminBugReportsApi.update(report.value.id, { status: s });
	} finally {
		saving.value = false;
	}
};

const confirmDelete = async () => {
	if (!report.value) return;
	saving.value = true;
	try {
		await adminBugReportsApi.remove(report.value.id);
		router.push('/admin/bug-reports');
	} finally {
		saving.value = false;
		showDelete.value = false;
	}
};

const userLabel = (b: AdminBugReport) => {
	if (!b.user) return '—';
	const name = `${b.user.first_name || ''} ${b.user.last_name || ''}`.trim();
	return name || b.user.email;
};

onMounted(fetchReport);
</script>

<template>
	<div class="max-w-3xl mx-auto">
		<RouterLink
			to="/admin/bug-reports"
			class="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6 transition-colors"
		>
			<ArrowLeftIcon class="h-4 w-4" />
			Back to bug reports
		</RouterLink>

		<div v-if="loading" class="flex items-center justify-center py-16">
			<Spinner size="lg" color="accent" />
		</div>

		<div v-else-if="report">
			<div class="flex items-start justify-between gap-4 mb-6">
				<div class="flex-1 min-w-0">
					<p class="eyebrow">Bug report · #{{ report.id }}</p>
					<h1 class="font-display font-medium text-primary tracking-tight text-2xl sm:text-3xl mt-2">
						{{ report.subject }}
					</h1>
					<p class="text-xs text-text-muted mt-2 numeral">
						{{ userLabel(report) }} · {{ new Date(report.created_at).toLocaleString() }}
					</p>
				</div>
				<button
					class="p-2 text-text-muted hover:text-danger transition-colors"
					title="Delete"
					@click="showDelete = true"
				>
					<TrashIcon class="h-5 w-5" />
				</button>
			</div>

			<div class="card p-5 mb-4">
				<p class="eyebrow mb-2">Status</p>
				<div class="flex items-center gap-2 flex-wrap">
					<button
						v-for="s in STATUSES"
						:key="s"
						:disabled="saving"
						class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
						:class="
							report.status === s
								? 'bg-primary text-surface'
								: 'border border-border text-text-muted hover:bg-surface-dark'
						"
						@click="updateStatus(s)"
					>
						{{ STATUS_LABELS[s] }}
					</button>
				</div>
			</div>

			<div class="card p-5 mb-4">
				<p class="eyebrow mb-2">Description</p>
				<p class="text-sm whitespace-pre-wrap">{{ report.description }}</p>
			</div>

			<div class="card p-5 mb-4">
				<p class="eyebrow mb-2">Page URL</p>
				<p class="numeral text-sm break-all text-text-muted">{{ report.page_url }}</p>
			</div>

			<div v-if="report.metadata" class="card p-5">
				<p class="eyebrow mb-2">Metadata</p>
				<pre class="text-xs numeral overflow-x-auto bg-surface-dark/50 p-3 rounded-md">{{
					JSON.stringify(report.metadata, null, 2)
				}}</pre>
			</div>
		</div>

		<ConfirmDialog
			:show="showDelete"
			title="Delete bug report"
			message="This cannot be undone."
			confirm-text="Delete"
			variant="danger"
			:loading="saving"
			@confirm="confirmDelete"
			@close="showDelete = false"
		/>
	</div>
</template>
