<script setup lang="ts">
import { MagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline';
import { onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { type AdminUser, adminUsersApi, type PaginatedUsers } from '@/api/admin';
import Spinner from '@/components/Spinner.vue';

const result = ref<PaginatedUsers | null>(null);
const loading = ref(true);
const search = ref('');
const page = ref(1);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const fetchUsers = async () => {
	loading.value = true;
	try {
		result.value = await adminUsersApi.list({ search: search.value, page: page.value });
	} finally {
		loading.value = false;
	}
};

watch(search, () => {
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(() => {
		page.value = 1;
		fetchUsers();
	}, 300);
});

watch(page, fetchUsers);

const displayName = (u: AdminUser) => {
	const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
	return name || '—';
};

onMounted(fetchUsers);
</script>

<template>
	<div class="max-w-6xl mx-auto">
		<header class="mb-8">
			<p class="eyebrow">Admin · Users</p>
			<h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">Users</h1>
			<p class="text-sm text-text-muted mt-2">{{ result?.total || 0 }} registered users.</p>
		</header>

		<div class="relative mb-4 max-w-md">
			<MagnifyingGlassIcon class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
			<input
				v-model="search"
				type="text"
				placeholder="Search by name or email…"
				class="w-full rounded-md border border-border pl-9 pr-3 py-2 text-sm focus:border-accent focus:outline-none"
			/>
		</div>

		<div v-if="loading" class="flex items-center justify-center py-16">
			<Spinner size="lg" color="accent" />
		</div>

		<div v-else-if="result" class="card overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-surface-dark/50">
					<tr class="text-left">
						<th class="px-4 py-3 eyebrow">User</th>
						<th class="px-4 py-3 eyebrow">Email</th>
						<th class="px-4 py-3 eyebrow">Role</th>
						<th class="px-4 py-3 eyebrow">Joined</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="u in result.data"
						:key="u.id"
						class="border-t border-border hover:bg-surface-dark/30 transition-colors"
					>
						<td class="px-4 py-3">
							<RouterLink :to="`/admin/users/${u.id}`" class="text-primary font-medium hover:text-accent-dark">
								{{ displayName(u) }}
							</RouterLink>
						</td>
						<td class="px-4 py-3 numeral text-text-muted">{{ u.email }}</td>
						<td class="px-4 py-3">
							<span
								v-if="u.is_admin"
								class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-accent/10 text-accent-dark"
							>
								<ShieldCheckIcon class="h-3.5 w-3.5" />
								Admin
							</span>
							<span v-else class="text-xs text-text-muted">User</span>
						</td>
						<td class="px-4 py-3 numeral text-xs text-text-muted">
							{{ new Date(u.created_at).toLocaleDateString() }}
						</td>
					</tr>
					<tr v-if="!result.data.length">
						<td colspan="4" class="px-4 py-8 text-center text-text-muted">No users found.</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<div v-if="result && result.last_page > 1" class="flex items-center justify-between mt-4 text-sm">
			<p class="text-text-muted">Page {{ result.current_page }} of {{ result.last_page }}</p>
			<div class="flex gap-2">
				<button
					:disabled="page <= 1"
					class="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					@click="page--"
				>
					Previous
				</button>
				<button
					:disabled="page >= result.last_page"
					class="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					@click="page++"
				>
					Next
				</button>
			</div>
		</div>
	</div>
</template>
