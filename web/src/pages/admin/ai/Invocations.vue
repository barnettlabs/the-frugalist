<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { adminAiAgentsApi, adminAiInvocationsApi, type AiAgent, type AiInvocation } from '@/api/admin-ai';
import Modal from '@/components/Modal.vue';
import Spinner from '@/components/Spinner.vue';

const invocations = ref<AiInvocation[]>([]);
const agents = ref<AiAgent[]>([]);
const loading = ref(true);
const filterAgent = ref<number | ''>('');
const filterErrors = ref(false);
const page = ref(1);
const lastPage = ref(1);
const showing = ref<AiInvocation | null>(null);

const fetch = async () => {
	loading.value = true;
	try {
		const params: any = { page: page.value };
		if (filterAgent.value) params.agent_id = filterAgent.value;
		if (filterErrors.value) params.errors_only = true;

		const res = await adminAiInvocationsApi.list(params);
		invocations.value = res.data;
		lastPage.value = res.last_page;
	} finally {
		loading.value = false;
	}
};

watch([filterAgent, filterErrors], () => {
	page.value = 1;
	fetch();
});
watch(page, fetch);

const fmtMs = (ms: number | null) => (ms == null ? '—' : `${ms}ms`);
const statusColor = (s: string) => {
	if (s === 'success') return 'bg-success/10 text-success';
	if (s === 'error' || s === 'invalid_json' || s === 'timeout') return 'bg-danger/10 text-danger';
	return 'bg-text-muted/10 text-text-muted';
};

onMounted(async () => {
	agents.value = await adminAiAgentsApi.list();
	await fetch();
});
</script>

<template>
	<div class="max-w-7xl mx-auto">
		<header class="mb-6">
			<p class="eyebrow">Admin · AI · Invocations</p>
			<h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">AI Invocations</h1>
			<p class="text-sm text-text-muted mt-2">
				Every call to an agent — including cache hits, errors, and token usage.
			</p>
		</header>

		<div class="flex items-center gap-4 mb-4 text-sm">
			<select
				v-model="filterAgent"
				class="rounded-md border border-border px-3 py-2 focus:border-accent focus:outline-none"
			>
				<option value="">All agents</option>
				<option v-for="a in agents" :key="a.id" :value="a.id">{{ a.name }}</option>
			</select>
			<label class="inline-flex items-center gap-2">
				<input v-model="filterErrors" type="checkbox" class="rounded border-border" />
				<span>Errors only</span>
			</label>
		</div>

		<div v-if="loading" class="flex items-center justify-center py-16">
			<Spinner size="lg" color="accent" />
		</div>

		<div v-else class="card overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-surface-dark/50">
					<tr class="text-left">
						<th class="px-4 py-3 eyebrow">When</th>
						<th class="px-4 py-3 eyebrow">Agent</th>
						<th class="px-4 py-3 eyebrow">Status</th>
						<th class="px-4 py-3 eyebrow">Latency</th>
						<th class="px-4 py-3 eyebrow">Tokens</th>
						<th class="px-4 py-3 eyebrow">User</th>
						<th class="px-4 py-3 eyebrow">Cached</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="i in invocations"
						:key="i.id"
						class="border-t border-border cursor-pointer hover:bg-surface-dark/30"
						@click="showing = i"
					>
						<td class="px-4 py-3 text-xs text-text-muted numeral">{{ new Date(i.created_at).toLocaleString() }}</td>
						<td class="px-4 py-3 text-xs">
							{{ i.agent?.slug || '—' }} <span class="text-text-muted">v{{ i.agent_version }}</span>
						</td>
						<td class="px-4 py-3">
							<span :class="['px-2 py-0.5 rounded text-xs', statusColor(i.status)]">{{ i.status }}</span>
						</td>
						<td class="px-4 py-3 numeral text-xs">{{ fmtMs(i.latency_ms) }}</td>
						<td class="px-4 py-3 numeral text-xs">{{ i.prompt_tokens || 0 }} / {{ i.completion_tokens || 0 }}</td>
						<td class="px-4 py-3 text-xs">{{ i.user?.email || 'anon' }}</td>
						<td class="px-4 py-3 text-xs">{{ i.cached ? 'yes' : '' }}</td>
					</tr>
					<tr v-if="!invocations.length">
						<td colspan="7" class="px-4 py-8 text-center text-text-muted">No invocations.</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="flex items-center justify-end gap-2 mt-3 text-sm">
			<button
				:disabled="page <= 1"
				class="px-3 py-1.5 rounded border border-border disabled:opacity-40"
				@click="page--"
			>
				Prev
			</button>
			<span class="numeral text-text-muted">{{ page }} / {{ lastPage }}</span>
			<button
				:disabled="page >= lastPage"
				class="px-3 py-1.5 rounded border border-border disabled:opacity-40"
				@click="page++"
			>
				Next
			</button>
		</div>

		<Modal :show="!!showing" max-width="full" @close="showing = null">
			<div v-if="showing" class="p-6 max-h-[90vh] overflow-y-auto">
				<header class="flex items-center justify-between mb-4">
					<div>
						<p class="eyebrow">Invocation #{{ showing.id }}</p>
						<h2 class="font-display text-2xl text-primary tracking-tight mt-1">
							{{ showing.agent?.name }} <span class="text-text-muted text-base">v{{ showing.agent_version }}</span>
						</h2>
					</div>
					<button
						class="px-4 py-2 text-sm rounded-md border border-border hover:bg-surface-dark transition-colors"
						@click="showing = null"
					>
						Close
					</button>
				</header>

				<dl class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-6">
					<div>
						<dt class="eyebrow">Status</dt>
						<dd>
							<span :class="['px-2 py-0.5 rounded text-xs', statusColor(showing.status)]">{{ showing.status }}</span>
						</dd>
					</div>
					<div>
						<dt class="eyebrow">Latency</dt>
						<dd class="numeral">{{ fmtMs(showing.latency_ms) }}</dd>
					</div>
					<div>
						<dt class="eyebrow">Prompt tokens</dt>
						<dd class="numeral">{{ showing.prompt_tokens || 0 }}</dd>
					</div>
					<div>
						<dt class="eyebrow">Completion tokens</dt>
						<dd class="numeral">{{ showing.completion_tokens || 0 }}</dd>
					</div>
					<div>
						<dt class="eyebrow">Provider</dt>
						<dd>{{ showing.provider?.name }}</dd>
					</div>
					<div>
						<dt class="eyebrow">Model</dt>
						<dd class="numeral">{{ showing.model }}</dd>
					</div>
					<div>
						<dt class="eyebrow">Context key</dt>
						<dd class="numeral">{{ showing.context_key || '—' }}</dd>
					</div>
					<div>
						<dt class="eyebrow">Cached</dt>
						<dd>{{ showing.cached ? 'yes' : 'no' }}</dd>
					</div>
				</dl>

				<div v-if="showing.error" class="mb-4 p-3 rounded bg-danger/10 text-danger text-sm">
					{{ showing.error }}
				</div>

				<section class="mb-6">
					<h3 class="eyebrow mb-2">Request payload</h3>
					<pre class="p-3 rounded bg-surface-dark/50 text-xs overflow-x-auto numeral">{{
						JSON.stringify(showing.request_payload, null, 2)
					}}</pre>
				</section>
				<section class="mb-6">
					<h3 class="eyebrow mb-2">Parsed response</h3>
					<pre class="p-3 rounded bg-surface-dark/50 text-xs overflow-x-auto numeral">{{
						JSON.stringify(showing.response, null, 2)
					}}</pre>
				</section>
				<section v-if="showing.raw_response">
					<h3 class="eyebrow mb-2">Raw response</h3>
					<pre class="p-3 rounded bg-surface-dark/50 text-xs overflow-x-auto numeral">{{ showing.raw_response }}</pre>
				</section>
			</div>
		</Modal>
	</div>
</template>
