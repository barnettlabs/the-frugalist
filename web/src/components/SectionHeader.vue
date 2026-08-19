<script setup lang="ts">
import { type Component, computed } from 'vue';

interface Props {
	/** Small caps section label, e.g. "Watch", "Compute / Financing" */
	eyebrow?: string;
	/** Editorial serif title */
	title: string;
	/** Optional supporting description */
	description?: string;
	/** Optional running issue/index number, pure ornament that lends a magazine feel */
	index?: string | number;
	/** Optional Heroicon component for the inset navy chip */
	icon?: Component;
	/** Variant chooses ornament style */
	variant?: 'editorial' | 'compact';
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'editorial',
	index: undefined,
});

const isCompact = computed(() => props.variant === 'compact');
</script>

<template>
	<header class="relative" :class="isCompact ? 'pt-6 pb-6' : 'pt-10 lg:pt-14 pb-8 lg:pb-10'">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<!-- Top eyebrow row: section label + optional running index -->
			<div class="flex items-baseline justify-between mb-5 lg:mb-7">
				<div class="flex items-center gap-3 fade-up">
					<span v-if="icon" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary text-surface">
						<component :is="icon" class="h-4 w-4" />
					</span>
					<span class="eyebrow">{{ eyebrow || '·' }}</span>
				</div>
				<span v-if="index" class="numeral text-xs text-text-muted">№ {{ index }}</span>
			</div>

			<!-- Title + description split -->
			<div class="grid grid-cols-12 gap-6 lg:gap-10 items-end">
				<div class="col-span-12 lg:col-span-8 fade-up fade-up-1">
					<h1
						class="font-display text-primary tracking-tightest leading-[0.95]"
						:class="
							isCompact
								? 'text-3xl sm:text-4xl lg:text-5xl font-medium'
								: 'text-4xl sm:text-5xl lg:text-[3.75rem] font-medium'
						"
					>
						{{ title }}
					</h1>
				</div>
				<div class="col-span-12 lg:col-span-4 lg:pb-1 fade-up fade-up-2">
					<p
						v-if="description"
						class="text-sm sm:text-base text-text-muted leading-relaxed border-l border-border pl-4"
					>
						{{ description }}
					</p>
					<slot name="aside" />
				</div>
			</div>

			<!-- Bottom hairline divider with optional action slot floating right -->
			<div class="mt-8 lg:mt-10 flex items-center gap-4 fade-up fade-up-3">
				<div class="h-px flex-1 bg-border" />
				<div class="flex items-center gap-2 shrink-0">
					<slot name="actions" />
				</div>
			</div>
		</div>
	</header>
</template>
