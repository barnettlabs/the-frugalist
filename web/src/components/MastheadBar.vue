<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { version as appVersion } from '../../package.json';

interface Props {
	/** Override the centered tagline text */
	centerText?: string;
	/** Plain-text label for the right slot (combined with rightTo for a link) */
	rightText?: string;
	/** Optional route for the right slot — turns rightText into a RouterLink */
	rightTo?: string;
}

withDefaults(defineProps<Props>(), {
	centerText: 'A field guide to what things should cost',
});
</script>

<template>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="relative flex items-center justify-between border-y border-border-strong py-2 gap-4 min-h-9">
			<!-- Left -->
			<span class="eyebrow numeral relative z-10">
				<slot name="left">v {{ appVersion }}</slot>
			</span>

			<!-- Center: absolutely positioned for true horizontal centering -->
			<span class="eyebrow hidden sm:block absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
				<slot name="center">{{ centerText }}</slot>
			</span>

			<!-- Right -->
			<span class="eyebrow relative z-10">
				<slot name="right">
					<RouterLink
						v-if="rightTo"
						:to="rightTo"
						class="eyebrow hover:text-primary transition-colors pointer-events-auto"
					>
						{{ rightText }}
					</RouterLink>
					<span v-else-if="rightText">{{ rightText }}</span>
				</slot>
			</span>
		</div>
	</div>
</template>
