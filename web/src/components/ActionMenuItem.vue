<script setup lang="ts">
defineProps<{
	variant?: 'default' | 'danger';
	disabled?: boolean;
}>();

const emit = defineEmits<{ click: [] }>();
</script>

<template>
	<button
		type="button"
		:disabled="disabled"
		class="inline-flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-dark/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		:class="variant === 'danger' ? 'text-danger hover:bg-danger/5' : 'text-text'"
		@click="emit('click')"
	>
		<slot />
	</button>
</template>
