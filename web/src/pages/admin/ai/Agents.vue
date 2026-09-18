<script setup lang="ts">
import {
	ArrowPathIcon,
	ArrowUturnLeftIcon,
	BeakerIcon,
	CheckCircleIcon,
	ClockIcon,
	NoSymbolIcon,
} from '@heroicons/vue/24/outline';
import { computed, onMounted, ref, watch } from 'vue';

import {
	adminAiAgentsApi,
	adminAiProvidersApi,
	type AiAgent,
	type AiAgentVersion,
	type AiProvider,
} from '@/api/admin-ai';
import ActionMenu from '@/components/ActionMenu.vue';
import ActionMenuItem from '@/components/ActionMenuItem.vue';
import Modal from '@/components/Modal.vue';
import Spinner from '@/components/Spinner.vue';

const agents = ref<AiAgent[]>([]);
const providers = ref<AiProvider[]>([]);
const loading = ref(true);
const saving = ref(false);

const editing = ref<AiAgent | null>(null);
const previewSampleJson = ref(
	'{\n  "inputs": {\n    "msrp": 35000,\n    "down_payment": 3000\n  },\n  "computed": {\n    "monthly_payment": 645,\n    "interest_amount": 5500\n  }\n}'
);
const previewResult = ref<any>(null);
const previewLoading = ref(false);
const versions = ref<AiAgentVersion[]>([]);

const errors = ref<Record<string, string[]>>({});

const availableModels = ref<string[]>([]);
const modelsLoading = ref(false);
const modelsError = ref<string | null>(null);

const selectedProvider = computed(() => providers.value.find(p => p.id === editing.value?.provider_id) || null);

const loadModels = async (providerId: number | null | undefined) => {
	availableModels.value = [];
	modelsError.value = null;
	if (!providerId) return;
	modelsLoading.value = true;
	try {
		const res = await adminAiProvidersApi.models(providerId);
		if (res.ok) {
			availableModels.value = res.models;
		} else {
			modelsError.value = res.error || 'Could not fetch models from provider.';
		}
	} catch (e: any) {
		modelsError.value = e.response?.data?.message || 'Could not fetch models from provider.';
	} finally {
		modelsLoading.value = false;
	}
};

watch(
	() => editing.value?.provider_id,
	(id, prev) => {
		if (id !== prev) loadModels(id ?? null);
	}
);

const fetch = async () => {
	loading.value = true;
	try {
		const [a, p] = await Promise.all([adminAiAgentsApi.list(), adminAiProvidersApi.list()]);
		agents.value = a;
		providers.value = p;
	} finally {
		loading.value = false;
	}
};

const openEdit = async (a: AiAgent) => {
	editing.value = { ...a, output_schema: a.output_schema ? JSON.parse(JSON.stringify(a.output_schema)) : null };
	errors.value = {};
	previewResult.value = null;
	versions.value = await adminAiAgentsApi.versions(a.id);
	loadModels(a.provider_id);
};

const outputSchemaText = computed({
	get: () => (editing.value?.output_schema ? JSON.stringify(editing.value.output_schema, null, 2) : ''),
	set: (v: string) => {
		if (!editing.value) return;
		try {
			editing.value.output_schema = v.trim() ? JSON.parse(v) : null;
			errors.value.output_schema = [];
		} catch {
			errors.value.output_schema = ['Invalid JSON'];
		}
	},
});

const save = async () => {
	if (!editing.value) return;
	if (errors.value.output_schema?.length) return;
	saving.value = true;
	try {
		const updated = await adminAiAgentsApi.update(editing.value.id, {
			name: editing.value.name,
			description: editing.value.description,
			provider_id: editing.value.provider_id,
			model: editing.value.model,
			system_prompt: editing.value.system_prompt,
			user_prompt_template: editing.value.user_prompt_template,
			response_format: editing.value.response_format,
			output_schema: editing.value.output_schema,
			temperature: editing.value.temperature,
			top_p: editing.value.top_p,
			max_tokens: editing.value.max_tokens,
			enabled: editing.value.enabled,
			rate_limit_per_user_day: editing.value.rate_limit_per_user_day,
		});
		editing.value = updated;
		versions.value = await adminAiAgentsApi.versions(updated.id);
		await fetch();
	} catch (e: any) {
		errors.value = e.response?.data?.errors || {};
	} finally {
		saving.value = false;
	}
};

const runPreview = async () => {
	if (!editing.value) return;
	previewLoading.value = true;
	previewResult.value = null;
	try {
		const ctx = JSON.parse(previewSampleJson.value);
		previewResult.value = await adminAiAgentsApi.preview(editing.value.id, ctx);
	} catch (e: any) {
		previewResult.value = { ok: false, error: 'client_error', message: e.message };
	} finally {
		previewLoading.value = false;
	}
};

const toggleEnabled = async (a: AiAgent) => {
	const updated = await adminAiAgentsApi.update(a.id, { enabled: !a.enabled });
	const idx = agents.value.findIndex(x => x.id === a.id);
	if (idx !== -1) agents.value[idx] = updated;
};

const rollback = async (v: AiAgentVersion) => {
	if (!editing.value) return;
	if (!confirm(`Roll back to version ${v.version}? This creates a new version with that prompt.`)) return;
	const updated = await adminAiAgentsApi.rollback(editing.value.id, v.version);
	editing.value = updated;
	versions.value = await adminAiAgentsApi.versions(updated.id);
	await fetch();
};

onMounted(fetch);
</script>

<template>
	<div class="max-w-7xl mx-auto">
		<header class="mb-8">
			<p class="eyebrow">Admin · AI · Agents</p>
			<h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">AI Agents</h1>
			<p class="text-sm text-text-muted mt-2">
				Edit prompts, swap providers/models, preview against sample inputs, and roll back to any prior version.
			</p>
		</header>

		<div v-if="loading" class="flex items-center justify-center py-16">
			<Spinner size="lg" color="accent" />
		</div>

		<div v-else class="card overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-surface-dark/50">
					<tr class="text-left">
						<th class="px-4 py-3 eyebrow w-px whitespace-nowrap">Actions</th>
						<th class="px-4 py-3 eyebrow">Agent</th>
						<th class="px-4 py-3 eyebrow">Provider</th>
						<th class="px-4 py-3 eyebrow">Model</th>
						<th class="px-4 py-3 eyebrow">Version</th>
						<th class="px-4 py-3 eyebrow">Status</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="a in agents" :key="a.id" class="border-t border-border">
						<td class="px-4 py-3 whitespace-nowrap">
							<ActionMenu primary-label="View" @primary="openEdit(a)">
								<template #items>
									<ActionMenuItem @click="toggleEnabled(a)">
										<component :is="a.enabled ? NoSymbolIcon : CheckCircleIcon" class="h-4 w-4" />
										{{ a.enabled ? 'Disable' : 'Enable' }}
									</ActionMenuItem>
								</template>
							</ActionMenu>
						</td>
						<td class="px-4 py-3">
							<p class="font-medium text-primary">{{ a.name }}</p>
							<p class="text-xs text-text-muted numeral">{{ a.slug }}</p>
						</td>
						<td class="px-4 py-3 text-text-muted text-xs">{{ a.provider?.name || '—' }}</td>
						<td class="px-4 py-3 numeral text-text-muted text-xs">
							{{ a.model || a.provider?.default_model || '—' }}
							<span v-if="!a.model && a.provider?.default_model" class="text-[10px] uppercase">(default)</span>
						</td>
						<td class="px-4 py-3 numeral">v{{ a.version }}</td>
						<td class="px-4 py-3 text-xs">
							<span v-if="a.enabled" class="text-success">enabled</span>
							<span v-else class="text-danger">disabled</span>
						</td>
					</tr>
					<tr v-if="!agents.length">
						<td colspan="6" class="px-4 py-8 text-center text-text-muted">No agents yet.</td>
					</tr>
				</tbody>
			</table>
		</div>

		<Modal :show="!!editing" max-width="full" @close="editing = null">
			<div v-if="editing" class="p-6 max-h-[90vh] overflow-y-auto">
				<header class="flex items-start justify-between mb-6">
					<div>
						<p class="eyebrow">Agent</p>
						<h2 class="font-display text-2xl text-primary tracking-tight">{{ editing.name }}</h2>
						<p class="text-xs text-text-muted numeral mt-1">{{ editing.slug }} · v{{ editing.version }}</p>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="button"
							class="px-4 py-2 text-sm rounded-md border border-border hover:bg-surface-dark transition-colors"
							@click="editing = null"
						>
							Close
						</button>
						<button
							type="button"
							:disabled="saving"
							class="px-4 py-2 text-sm rounded-md bg-primary text-surface hover:bg-primary-light transition-colors disabled:opacity-50"
							@click="save"
						>
							{{ saving ? 'Saving…' : 'Save' }}
						</button>
					</div>
				</header>

				<div class="grid grid-cols-12 gap-6">
					<section class="col-span-12 lg:col-span-7 space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-text-muted mb-1">Name</label>
								<input
									v-model="editing.name"
									type="text"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-text-muted mb-1">Provider</label>
								<select
									v-model="editing.provider_id"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden"
								>
									<option :value="null">— none —</option>
									<option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
								</select>
							</div>
							<div>
								<label class="flex items-center justify-between text-sm font-medium text-text-muted mb-1">
									<span>
										Model
										<span v-if="selectedProvider?.default_model" class="text-text-muted/70 font-normal">
											· default: <span class="numeral">{{ selectedProvider.default_model }}</span>
										</span>
									</span>
									<button
										v-if="editing.provider_id"
										type="button"
										class="text-[10px] uppercase tracking-wider text-text-muted hover:text-accent inline-flex items-center gap-1"
										:disabled="modelsLoading"
										@click="loadModels(editing.provider_id)"
									>
										<ArrowPathIcon class="h-3 w-3" :class="modelsLoading ? 'animate-spin' : ''" /> Refresh
									</button>
								</label>
								<select
									v-if="availableModels.length"
									v-model="editing.model"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden numeral"
								>
									<option :value="null">— use provider default —</option>
									<option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
								</select>
								<input
									v-else
									v-model="editing.model"
									type="text"
									:placeholder="
										selectedProvider?.default_model
											? `leave blank to use ${selectedProvider.default_model}`
											: 'leave blank to use provider default'
									"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden numeral"
								/>
								<p v-if="modelsError" class="text-[10px] text-danger mt-1">{{ modelsError }}</p>
								<p v-else-if="modelsLoading" class="text-[10px] text-text-muted mt-1">Loading models…</p>
							</div>
							<div>
								<label class="block text-sm font-medium text-text-muted mb-1">Response format</label>
								<select
									v-model="editing.response_format"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden"
								>
									<option value="json_object">json_object</option>
									<option value="json_schema">json_schema</option>
									<option value="text">text</option>
								</select>
							</div>
						</div>

						<div>
							<label class="block text-sm font-medium text-text-muted mb-1">System prompt</label>
							<textarea
								v-model="editing.system_prompt"
								rows="4"
								class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden font-mono"
							></textarea>
						</div>

						<div>
							<label class="block text-sm font-medium text-text-muted mb-1">User prompt template</label>
							<p class="text-xs text-text-muted mb-1">
								Placeholders:
								<code v-pre>{{ inputs_json }}</code
								>, <code v-pre>{{ computed_json }}</code
								>, <code v-pre>{{ context_json }}</code
								>, or dotted paths like <code v-pre>{{ inputs.msrp }}</code
								>.
							</p>
							<textarea
								v-model="editing.user_prompt_template"
								rows="10"
								class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden font-mono"
							></textarea>
						</div>

						<div>
							<label class="block text-sm font-medium text-text-muted mb-1">Output JSON schema (optional)</label>
							<textarea
								:value="outputSchemaText"
								rows="6"
								class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden font-mono"
								@input="outputSchemaText = ($event.target as HTMLTextAreaElement).value"
							></textarea>
							<p v-if="errors.output_schema" class="text-xs text-danger mt-1">{{ errors.output_schema[0] }}</p>
						</div>

						<div class="grid grid-cols-3 gap-4">
							<div>
								<label class="block text-sm font-medium text-text-muted mb-1">Temperature</label>
								<input
									v-model.number="editing.temperature"
									type="number"
									min="0"
									max="2"
									step="0.05"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden numeral"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-text-muted mb-1">Top P</label>
								<input
									v-model.number="editing.top_p"
									type="number"
									min="0"
									max="1"
									step="0.05"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden numeral"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-text-muted mb-1">Max tokens</label>
								<input
									v-model.number="editing.max_tokens"
									type="number"
									min="1"
									max="8192"
									class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden numeral"
								/>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-4">
							<label class="inline-flex items-center gap-2 text-sm">
								<input v-model="editing.enabled" type="checkbox" class="rounded-sm border-border" />
								<span>Enabled</span>
							</label>
							<div class="flex items-center gap-2 text-sm">
								<label class="text-text-muted">Daily rate limit per user:</label>
								<input
									v-model.number="editing.rate_limit_per_user_day"
									type="number"
									min="0"
									class="w-24 rounded-md border border-border px-2 py-1 text-sm focus:border-accent focus:outline-hidden numeral"
								/>
							</div>
						</div>
					</section>

					<aside class="col-span-12 lg:col-span-5 space-y-6">
						<section>
							<h3 class="eyebrow mb-2 flex items-center gap-2"><BeakerIcon class="h-3.5 w-3.5" /> Preview</h3>
							<p class="text-xs text-text-muted mb-2">Sends sample context to this agent against the saved version.</p>
							<textarea
								v-model="previewSampleJson"
								rows="8"
								class="w-full rounded-md border border-border px-3 py-2 text-xs focus:border-accent focus:outline-hidden font-mono"
							></textarea>
							<button
								:disabled="previewLoading"
								class="mt-2 px-3 py-1.5 text-sm rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
								@click="runPreview"
							>
								{{ previewLoading ? 'Running…' : 'Run preview' }}
							</button>

							<div v-if="previewResult" class="mt-4 space-y-2">
								<div class="flex flex-wrap items-center gap-2 text-xs">
									<span
										class="px-2.5 py-1 rounded-sm font-medium uppercase tracking-wider text-[11px]"
										:class="previewResult.ok ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'"
									>
										{{ previewResult.ok ? 'OK' : previewResult.error || 'error' }}
									</span>
									<span v-if="previewResult.model" class="numeral text-text-muted">
										<span class="text-text-muted/60">model:</span> {{ previewResult.model }}
									</span>
									<span v-if="previewResult.cached" class="px-2 py-0.5 rounded-sm bg-accent/10 text-accent text-[11px]">
										cached
									</span>
								</div>

								<p v-if="previewResult.message && !previewResult.ok" class="text-xs text-danger pb-2">
									{{ previewResult.message }}
								</p>

								<details
									v-if="previewResult.request_payload || previewResult.raw_response"
									class="rounded-md border border-border bg-surface-dark/20 group"
								>
									<summary
										class="cursor-pointer select-none px-3 py-2 text-xs font-medium text-primary flex items-center justify-between hover:bg-surface-dark/40"
									>
										<span class="flex items-center gap-2">
											<span class="text-text-muted transition-transform group-open:rotate-90">▸</span>
											Raw HTTP (request + response)
										</span>
										<span class="text-[10px] text-text-muted uppercase tracking-wider">POST /chat/completions</span>
									</summary>
									<div class="border-t border-border p-3 space-y-3">
										<div v-if="previewResult.request_payload">
											<p class="eyebrow mb-1">Request body</p>
											<pre
												class="p-3 rounded-md bg-surface-dark/60 text-xs overflow-x-auto numeral max-h-96 whitespace-pre-wrap wrap-break-word"
												>{{ JSON.stringify(previewResult.request_payload, null, 2) }}</pre>
										</div>
										<div v-if="previewResult.raw_response">
											<p class="eyebrow mb-1">Response body</p>
											<pre
												class="p-3 rounded-md bg-surface-dark/60 text-xs overflow-x-auto numeral max-h-96 whitespace-pre-wrap wrap-break-word"
												>{{ previewResult.raw_response }}</pre>
										</div>
									</div>
								</details>

								<details
									v-if="previewResult.messages?.length"
									class="rounded-md border border-border bg-surface-dark/20 group"
								>
									<summary
										class="cursor-pointer select-none px-3 py-2 text-xs font-medium text-primary flex items-center justify-between hover:bg-surface-dark/40"
									>
										<span class="flex items-center gap-2">
											<span class="text-text-muted transition-transform group-open:rotate-90">▸</span>
											Parsed request
										</span>
										<span class="text-[10px] text-text-muted">{{ previewResult.messages.length }} message(s)</span>
									</summary>
									<div class="border-t border-border p-3 space-y-2">
										<div
											v-for="(m, idx) in previewResult.messages"
											:key="idx"
											class="rounded-md border border-border bg-surface-dark/40 overflow-hidden"
										>
											<div class="px-2 py-1 text-[10px] uppercase tracking-wider bg-surface-dark/60 text-text-muted">
												{{ m.role }}
											</div>
											<pre
												class="px-3 py-2 text-xs font-mono whitespace-pre-wrap wrap-break-word max-h-64 overflow-y-auto"
												>{{ m.content }}</pre>
										</div>
									</div>
								</details>

								<details open class="rounded-md border border-border bg-surface-dark/20 group">
									<summary
										class="cursor-pointer select-none px-3 py-2 text-xs font-medium text-primary flex items-center justify-between hover:bg-surface-dark/40"
									>
										<span class="flex items-center gap-2">
											<span class="text-text-muted transition-transform group-open:rotate-90">▸</span>
											Parsed response
										</span>
									</summary>
									<div class="border-t border-border p-3">
										<pre
											class="p-3 rounded-md bg-surface-dark/60 text-xs overflow-x-auto numeral max-h-96 whitespace-pre-wrap wrap-break-word"
											>{{
												previewResult.response !== null && previewResult.response !== undefined
													? JSON.stringify(previewResult.response, null, 2)
													: previewResult.ok
														? '(empty)'
														: '(no response — see error above)'
											}}</pre>
									</div>
								</details>
							</div>
						</section>

						<section>
							<h3 class="eyebrow mb-2 flex items-center gap-2"><ClockIcon class="h-3.5 w-3.5" /> Version history</h3>
							<ul class="space-y-1 max-h-72 overflow-y-auto">
								<li
									v-for="v in versions"
									:key="v.id"
									class="flex items-center justify-between text-xs p-2 rounded-sm hover:bg-surface-dark/30"
								>
									<span class="numeral">v{{ v.version }} · {{ new Date(v.created_at).toLocaleString() }}</span>
									<button
										class="text-text-muted hover:text-accent inline-flex items-center gap-1"
										title="Roll back"
										@click="rollback(v)"
									>
										<ArrowUturnLeftIcon class="h-3.5 w-3.5" /> Roll back
									</button>
								</li>
								<li v-if="!versions.length" class="text-xs text-text-muted">
									No version history yet — saving will start the log.
								</li>
							</ul>
						</section>
					</aside>
				</div>
			</div>
		</Modal>
	</div>
</template>
