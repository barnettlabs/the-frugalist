<script setup lang="ts">
import { CheckIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import Spinner from './Spinner.vue';

/**
 * The estimate pages' one save control, pinned to the bottom of the screen.
 *
 * Sticky rather than fixed, and the page's last element, so it spans the
 * content column and never covers the app's sidebar.
 *
 * It sits in the same place on create and edit, wherever the page is
 * scrolled, and saving stays on the page. It is a single slim row so it does
 * not crowd a phone screen.
 */
const props = defineProps<{
	dirty: boolean;
	saving: boolean;
	isEdit: boolean;
	/** Guests can use the calculator; saving sends them to sign in. */
	canSave: boolean;
	savedAt: Date | null;
	hasErrors: boolean;
	backUrl: string;
	backLabel: string;
}>();

defineEmits<{ save: [] }>();

const status = computed(() => {
	if (props.saving) return { tone: 'muted', text: 'Saving…' };
	if (!props.canSave) return { tone: 'muted', text: 'Sign in to save this estimate' };
	if (props.hasErrors) return { tone: 'danger', text: 'Not saved - check the highlighted fields' };
	if (props.dirty) return { tone: 'warning', text: 'Unsaved changes' };
	if (props.savedAt) {
		const time = props.savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
		return { tone: 'success', text: `Saved at ${time}` };
	}
	return { tone: 'muted', text: props.isEdit ? 'All changes saved' : 'Not saved yet' };
});

// Nothing to save on an unchanged sheet; a new one can always be saved.
const disabled = computed(() => props.saving || (props.canSave && props.isEdit && !props.dirty));

const label = computed(() => {
	if (!props.canSave) return 'Sign in to save';
	if (props.saving) return 'Saving…';
	return props.isEdit ? 'Save changes' : 'Save estimate';
});
</script>

<template>
	<div
		class="sticky bottom-0 z-40 mt-16 border-t border-border bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
			<p
				class="flex items-center gap-2 min-w-0 text-xs sm:text-sm"
				:class="{
					'text-text-muted': status.tone === 'muted',
					'text-warning': status.tone === 'warning',
					'text-danger': status.tone === 'danger',
					'text-success': status.tone === 'success',
				}"
				role="status"
				aria-live="polite"
			>
				<span v-if="status.tone === 'warning'" class="h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
				<CheckIcon v-else-if="status.tone === 'success'" class="h-4 w-4 shrink-0" aria-hidden="true" />
				<span class="truncate">{{ status.text }}</span>
			</p>

			<div class="flex items-center gap-2 shrink-0">
				<RouterLink
					:to="backUrl"
					class="hidden sm:inline-flex px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-primary hover:bg-tan/50 transition-colors"
				>
					{{ backLabel }}
				</RouterLink>
				<button
					type="button"
					:disabled="disabled"
					:class="[
						'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
						disabled ? 'bg-tan text-text-muted cursor-not-allowed' : 'bg-primary hover:bg-primary-light text-surface',
					]"
					@click="$emit('save')"
				>
					<Spinner v-if="saving" size="sm" color="white" />
					{{ label }}
				</button>
			</div>
		</div>
	</div>
</template>
