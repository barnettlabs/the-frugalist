<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { onMounted, reactive, ref } from 'vue';

import { type AdminAnnouncement, adminAnnouncementsApi } from '@/api/admin';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Modal from '@/components/Modal.vue';
import Spinner from '@/components/Spinner.vue';

const announcements = ref<AdminAnnouncement[]>([]);
const loading = ref(true);
const saving = ref(false);
const showForm = ref(false);
const editing = ref<AdminAnnouncement | null>(null);
const deleting = ref<AdminAnnouncement | null>(null);
const errors = ref<Record<string, string[]>>({});

const form = reactive<Partial<AdminAnnouncement>>({
	title: '',
	message: '',
});

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const fetchAll = async () => {
	loading.value = true;
	try {
		announcements.value = await adminAnnouncementsApi.list();
	} finally {
		loading.value = false;
	}
};

const openCreate = () => {
	editing.value = null;
	form.title = '';
	form.message = '';
	errors.value = {};
	showForm.value = true;
};

const openEdit = (a: AdminAnnouncement) => {
	editing.value = a;
	form.title = a.title || '';
	form.message = a.message || '';
	errors.value = {};
	showForm.value = true;
};

const save = async () => {
	saving.value = true;
	errors.value = {};
	try {
		if (editing.value) {
			await adminAnnouncementsApi.update(editing.value.id, form);
		} else {
			await adminAnnouncementsApi.create(form);
		}
		showForm.value = false;
		await fetchAll();
	} catch (e: any) {
		errors.value = e.response?.data?.errors || {};
	} finally {
		saving.value = false;
	}
};

const confirmDelete = async () => {
	if (!deleting.value) return;
	saving.value = true;
	try {
		await adminAnnouncementsApi.remove(deleting.value.id);
		deleting.value = null;
		await fetchAll();
	} finally {
		saving.value = false;
	}
};

onMounted(fetchAll);
</script>

<template>
	<div class="max-w-4xl mx-auto">
		<header class="flex items-end justify-between mb-8">
			<div>
				<p class="eyebrow">Admin · Announcements</p>
				<h1 class="font-display font-medium text-primary tracking-tight text-3xl mt-2">Announcements</h1>
				<p class="text-sm text-text-muted mt-2">In-app announcements broadcast to all users.</p>
			</div>
			<button
				class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
				@click="openCreate"
			>
				<PlusIcon class="h-4 w-4" />
				New announcement
			</button>
		</header>

		<div v-if="loading" class="flex items-center justify-center py-16">
			<Spinner size="lg" color="accent" />
		</div>

		<div v-else-if="!announcements.length" class="card p-10 text-center">
			<p class="text-text-muted">No announcements yet.</p>
		</div>

		<div v-else class="space-y-3">
			<article v-for="a in announcements" :key="a.id" class="card p-5">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1 min-w-0">
						<h3 v-if="a.title" class="font-display text-lg text-primary tracking-tight">{{ a.title }}</h3>
						<p class="text-sm text-text-muted mt-1 whitespace-pre-wrap">{{ a.message }}</p>
						<p class="numeral text-xs text-text-muted mt-3">{{ formatDate(a.created_at) }}</p>
					</div>
					<div class="flex items-center gap-1 shrink-0">
						<button class="p-2 text-text-muted hover:text-primary transition-colors" @click="openEdit(a)">
							<PencilSquareIcon class="h-4 w-4" />
						</button>
						<button class="p-2 text-text-muted hover:text-danger transition-colors" @click="deleting = a">
							<TrashIcon class="h-4 w-4" />
						</button>
					</div>
				</div>
			</article>
		</div>

		<Modal :show="showForm" max-width="lg" @close="showForm = false">
			<form class="p-6" @submit.prevent="save">
				<h2 class="font-display text-xl text-primary tracking-tight mb-4">
					{{ editing ? 'Edit announcement' : 'New announcement' }}
				</h2>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-text-muted mb-1">Title</label>
						<input
							v-model="form.title"
							type="text"
							class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden"
						/>
						<p v-if="errors.title" class="text-xs text-danger mt-1">{{ errors.title[0] }}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-text-muted mb-1">Message</label>
						<textarea
							v-model="form.message"
							rows="6"
							class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-hidden"
						></textarea>
						<p v-if="errors.message" class="text-xs text-danger mt-1">{{ errors.message[0] }}</p>
					</div>
				</div>
				<div class="mt-6 flex items-center justify-end gap-2">
					<button
						type="button"
						class="px-4 py-2 text-sm rounded-md border border-border hover:bg-surface-dark transition-colors"
						@click="showForm = false"
					>
						Cancel
					</button>
					<button
						type="submit"
						:disabled="saving"
						class="px-4 py-2 text-sm rounded-md bg-primary text-surface hover:bg-primary-light transition-colors disabled:opacity-50"
					>
						{{ saving ? 'Saving…' : 'Save' }}
					</button>
				</div>
			</form>
		</Modal>

		<ConfirmDialog
			:show="!!deleting"
			title="Delete announcement"
			message="This cannot be undone."
			confirm-text="Delete"
			variant="danger"
			:loading="saving"
			@confirm="confirmDelete"
			@close="deleting = null"
		/>
	</div>
</template>
