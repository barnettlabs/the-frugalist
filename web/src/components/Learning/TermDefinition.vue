<script setup lang="ts">
interface Props {
	term: string;
	definition: string;
	example?: string;
}

defineProps<Props>();
</script>

<template>
	<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">{{ term }}</h3>
		<p class="text-gray-700 mb-3">{{ definition }}</p>
		<div v-if="example" class="mt-4 bg-gray-50 border-l-4 border-primary p-4 rounded">
			<p class="text-sm text-gray-600"><span class="font-medium text-gray-700">Example:</span> {{ example }}</p>
		</div>
	</div>
</template>
