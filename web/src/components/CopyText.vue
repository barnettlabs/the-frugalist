<script setup lang="ts">
import { CheckIcon, ClipboardIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';

const props = defineProps({
	text: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		default: '',
	},
	size: {
		type: String as () => 'sm' | 'md',
		default: 'sm',
	},
});

const copied = ref(false);

const copyToClipboard = async () => {
	try {
		// Try modern clipboard API first
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(props.text);
		} else {
			// Fallback for non-secure contexts
			const textArea = document.createElement('textarea');
			textArea.value = props.text;
			textArea.style.position = 'fixed';
			textArea.style.left = '-9999px';
			textArea.style.top = '-9999px';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
		copied.value = true;
		setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch (error) {
		console.error('Failed to copy:', error);
	}
};
</script>

<template>
	<button
		class="inline-flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors group"
		:title="`Copy ${label || text}`"
		@click.prevent="copyToClipboard"
	>
		<span :class="size === 'sm' ? 'text-xs' : 'text-sm'">
			<slot>{{ text }}</slot>
		</span>
		<span
			:class="[
				'transition-colors',
				size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
				copied ? 'text-success' : 'text-text-muted group-hover:text-primary',
			]"
		>
			<CheckIcon v-if="copied" class="h-full w-full" />
			<ClipboardIcon v-else class="h-full w-full" />
		</span>
	</button>
</template>
