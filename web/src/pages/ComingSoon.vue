<script setup lang="ts">
import { ClockIcon } from '@heroicons/vue/24/outline';
import { RouterLink } from 'vue-router';
</script>

<template>
	<main class="py-12 flex-1">
		<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
			<div class="bg-white rounded-lg border border-gray-200 shadow-xs p-12 text-center">
				<div class="p-4 rounded-xl bg-warning/10 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
					<ClockIcon class="h-8 w-8 text-warning" />
				</div>

				<h1 class="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h1>
				<p class="text-gray-600 mb-8 max-w-md mx-auto">
					We're working hard to bring you this feature. Stay tuned for updates!
				</p>

				<RouterLink to="/dashboard">
					<button
						class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all"
					>
						Back to Dashboard
					</button>
				</RouterLink>
			</div>
		</div>
	</main>
</template>
