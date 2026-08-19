<script setup lang="ts">
import { computed } from 'vue';

type CardVariant =
	'default' | 'interactive' | 'futuristic' | 'gradient-primary' | 'gradient-secondary' | 'gradient-accent';

interface Props {
	variant?: CardVariant;
	padding?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'default',
	padding: 'md',
});

const variantClasses = {
	default: 'bg-surface/80 backdrop-blur-sm rounded-lg border border-border shadow-sm',
	interactive:
		'bg-surface/80 backdrop-blur-sm rounded-lg border border-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all cursor-pointer',
	futuristic: 'futuristic-card', // Uses CSS class from app.css
	'gradient-primary': 'bg-gradient-to-br from-primary to-primary-dark rounded-lg text-white',
	'gradient-secondary': 'bg-gradient-to-br from-secondary to-secondary-dark rounded-lg text-white',
	'gradient-accent': 'bg-gradient-to-br from-accent to-accent-dark rounded-lg text-white',
};

const paddingClasses = {
	none: '',
	sm: 'p-4',
	md: 'p-6',
	lg: 'p-8',
};

const classes = computed(() => [variantClasses[props.variant], paddingClasses[props.padding]]);
</script>

<template>
	<div :class="classes">
		<slot />
	</div>
</template>
