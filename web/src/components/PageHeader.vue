<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/20/solid';
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

interface Props {
	title: string;
	description?: string;
	backLink?: string;
	backLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
	backLabel: 'Back',
});

const route = useRoute();

// Compute parent route for back navigation on mobile
const parentRoute = computed(() => {
	if (props.backLink) return props.backLink;

	const path = route.path;
	// Simple parent detection based on path structure
	if (path.includes('/create')) {
		return path.replace('/create', '');
	}
	if (path.match(/\/\d+\/edit$/)) {
		return path.replace(/\/\d+\/edit$/, '');
	}
	if (path.match(/\/\d+$/)) {
		return path.replace(/\/\d+$/, '');
	}
	// Default to dashboard
	return '/dashboard';
});

const showBackLink = computed(() => {
	return route.path !== '/dashboard';
});
</script>

<template>
	<div class="mb-6 lg:mb-8">
		<!-- Mobile back link -->
		<div v-if="showBackLink" class="lg:hidden mb-3">
			<RouterLink
				:to="parentRoute"
				class="inline-flex items-center text-sm text-text-muted hover:text-primary transition-colors"
			>
				<ChevronLeftIcon class="h-5 w-5 mr-1" />
				{{ backLabel }}
			</RouterLink>
		</div>

		<!-- Header content -->
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
			<div>
				<h1 class="text-2xl lg:text-3xl font-bold text-primary">{{ title }}</h1>
				<p v-if="description" class="mt-1 lg:mt-2 text-sm lg:text-base text-text-muted">
					{{ description }}
				</p>
				<slot name="subtitle"></slot>
			</div>
			<div class="flex items-center gap-2 shrink-0">
				<slot name="actions"></slot>
			</div>
		</div>
	</div>
</template>
