<script setup lang="ts">
import {
	CheckCircleIcon,
	EnvelopeIcon,
	ExclamationCircleIcon,
	EyeIcon,
	PaperAirplaneIcon,
	XMarkIcon,
} from '@heroicons/vue/24/outline';
import { ref } from 'vue';

import { type EmailTemplate, playgroundApi } from '@/api/playground';
import Alert from '@/components/Alert.vue';
import Card from '@/components/Card.vue';
import PrimaryButton from '@/components/PrimaryButton.vue';
import SecondaryButton from '@/components/SecondaryButton.vue';
import Spinner from '@/components/Spinner.vue';

const templates = ref<EmailTemplate[]>([]);
const selectedTemplate = ref<string | null>(null);
const previewHtml = ref<string>('');
const previewSubject = ref<string>('');
const loading = ref(false);
const loadingTemplates = ref(true);
const sendStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const sendingEmail = ref(false);
const showPreviewModal = ref(false);

// Load templates on mount
async function loadTemplates() {
	try {
		loadingTemplates.value = true;
		const response = await playgroundApi.getEmailTemplates();
		templates.value = response.templates;
		if (templates.value.length > 0) {
			selectedTemplate.value = templates.value[0].id;
		}
	} catch (error: any) {
		console.error('Failed to load templates:', error);
		if (error.response?.status === 403) {
			sendStatus.value = {
				type: 'error',
				message: 'Access denied. This feature is only available in local development or for admins.',
			};
		}
	} finally {
		loadingTemplates.value = false;
	}
}

loadTemplates();

// const selectedTemplateInfo = computed(() => templates.value.find(t => t.id === selectedTemplate.value));

async function previewEmail() {
	if (!selectedTemplate.value) return;

	try {
		loading.value = true;
		const response = await playgroundApi.previewEmail(selectedTemplate.value);
		previewHtml.value = response.html;
		previewSubject.value = response.subject;
		showPreviewModal.value = true;
	} catch (error: any) {
		sendStatus.value = {
			type: 'error',
			message: error.response?.data?.message || 'Failed to preview email',
		};
	} finally {
		loading.value = false;
	}
}

async function sendTestEmail() {
	if (!selectedTemplate.value) return;

	try {
		sendingEmail.value = true;
		sendStatus.value = null;
		const response = await playgroundApi.sendTestEmail(selectedTemplate.value);
		sendStatus.value = {
			type: 'success',
			message: response.message,
		};
	} catch (error: any) {
		sendStatus.value = {
			type: 'error',
			message: error.response?.data?.message || 'Failed to send test email',
		};
	} finally {
		sendingEmail.value = false;
	}
}

function closePreviewModal() {
	showPreviewModal.value = false;
}
</script>

<template>
	<div class="py-6 px-4 sm:px-6 lg:px-8">
		<div class="max-w-3xl mx-auto">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-2xl font-semibold text-primary">Email Playground</h1>
				<p class="mt-1 text-text-muted">Test and preview email templates</p>
			</div>

			<!-- Loading State -->
			<div v-if="loadingTemplates" class="flex items-center justify-center py-12">
				<Spinner size="lg" />
			</div>

			<!-- Access Denied -->
			<Alert v-else-if="sendStatus?.type === 'error' && templates.length === 0" variant="danger" class="mb-6">
				{{ sendStatus.message }}
			</Alert>

			<template v-else>
				<!-- Template Selector -->
				<Card class="mb-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<EnvelopeIcon class="h-5 w-5 text-primary" />
						Select Email Template
					</h2>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<button
							v-for="template in templates"
							:key="template.id"
							class="text-left p-4 rounded-lg border-2 transition-all"
							:class="[
								selectedTemplate === template.id
									? 'border-primary bg-primary/5'
									: 'border-border hover:border-primary/30',
							]"
							@click="selectedTemplate = template.id"
						>
							<div class="font-medium text-gray-900">{{ template.name }}</div>
							<div class="text-sm text-gray-500 mt-1">{{ template.description }}</div>
						</button>
					</div>

					<!-- Actions -->
					<div class="mt-6 flex flex-wrap gap-3">
						<PrimaryButton :disabled="!selectedTemplate || loading" class="gap-2" @click="previewEmail">
							<Spinner v-if="loading" size="sm" color="gray" />
							<EyeIcon v-else class="h-4 w-4" />
							Preview Email
						</PrimaryButton>

						<SecondaryButton :disabled="!selectedTemplate || sendingEmail" class="gap-2" @click="sendTestEmail">
							<Spinner v-if="sendingEmail" size="sm" color="gray" />
							<PaperAirplaneIcon v-else class="h-4 w-4" />
							Send to Me
						</SecondaryButton>
					</div>

					<!-- Status Messages -->
					<Alert
						v-if="sendStatus && templates.length > 0"
						:variant="sendStatus.type === 'success' ? 'success' : 'danger'"
						class="mt-4"
						dismissible
						@dismiss="sendStatus = null"
					>
						<template #icon>
							<CheckCircleIcon v-if="sendStatus.type === 'success'" class="h-5 w-5" />
							<ExclamationCircleIcon v-else class="h-5 w-5" />
						</template>
						{{ sendStatus.message }}
					</Alert>
				</Card>

				<!-- Empty State -->
				<Card class="text-center py-12">
					<EnvelopeIcon class="h-12 w-12 text-gray-300 mx-auto mb-4" />
					<p class="text-gray-500">Select a template and click "Preview Email" to see the rendered version</p>
				</Card>
			</template>
		</div>

		<!-- Fullscreen Preview Modal -->
		<Teleport to="body">
			<Transition
				enter-active-class="ease-out duration-300"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="ease-in duration-200"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
			>
				<div v-if="showPreviewModal" class="fixed inset-0 z-50 bg-black/80 flex flex-col">
					<!-- Modal Header -->
					<div class="flex items-center justify-between px-4 py-3 bg-white border-b">
						<div>
							<h2 class="text-lg font-semibold text-gray-900">Email Preview</h2>
							<p v-if="previewSubject" class="text-sm text-gray-500">
								Subject: <span class="font-medium">{{ previewSubject }}</span>
							</p>
						</div>
						<button class="p-2 rounded-lg hover:bg-gray-100 transition-colors" @click="closePreviewModal">
							<XMarkIcon class="h-6 w-6 text-gray-500" />
						</button>
					</div>

					<!-- Modal Content -->
					<div class="flex-1 overflow-auto bg-gray-100 p-4">
						<div class="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
							<iframe :srcdoc="previewHtml" class="w-full min-h-[800px] border-0" sandbox="allow-same-origin" />
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>
