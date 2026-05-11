<script setup lang="ts">
import { computed } from 'vue';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface Props {
	variant?: BadgeVariant;
	size?: BadgeSize;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'primary',
	size: 'md',
});

const variantClasses = {
	primary: 'bg-primary text-white',
	secondary: 'bg-secondary text-white',
	accent: 'bg-accent text-white',
	success: 'bg-success text-white',
	warning: 'bg-warning text-white',
	danger: 'bg-danger text-white',
	info: 'bg-info text-white',
	neutral: 'bg-gray-500 text-white',
};

const sizeClasses = {
	sm: 'text-xs px-2 py-0.5',
	md: 'text-xs px-3 py-1',
	lg: 'text-sm px-3 py-1',
};

const classes = computed(() => [
	variantClasses[props.variant],
	sizeClasses[props.size],
	'inline-flex items-center rounded-full font-medium',
]);
</script>

<template>
	<span :class="classes">
		<slot />
	</span>
</template>
