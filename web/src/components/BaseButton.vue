<script setup>
import { computed } from 'vue';

const props = defineProps({
	variant: {
		type: String,
		default: 'primary',
		validator: value => ['primary', 'secondary', 'danger'].includes(value),
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	type: {
		type: String,
		default: 'button',
	},
});

const buttonClasses = computed(() => {
	const baseClasses =
		'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50';

	const variantClasses = {
		primary: 'bg-accent hover:bg-accent-dark text-white',
		secondary: 'border border-border bg-surface hover:bg-tan-light text-primary',
		danger: 'bg-danger hover:bg-danger/80 text-white',
	};

	return `${baseClasses} ${variantClasses[props.variant]}`;
});
</script>

<template>
	<button :class="buttonClasses" :disabled="disabled" :type="type" v-bind="$attrs">
		<slot />
	</button>
</template>
