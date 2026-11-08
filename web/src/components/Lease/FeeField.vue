<script setup lang="ts">
import MaskedNumberInput from '@/components/MaskedNumberInput.vue';

/**
 * A lease fee, and whether it is rolled into the lease or paid at signing.
 *
 * Contracts itemise the same fee either way - a doc fee can sit in the gross
 * capitalized cost or in the amount due at signing - and which one changes the
 * monthly payment, so the choice sits next to the amount.
 */
defineProps<{
	label: string;
	error?: string[];
}>();

const amount = defineModel<string | number | null>('amount', { default: '' });
const upfront = defineModel<boolean>('upfront', { default: false });
</script>

<template>
	<div>
		<div class="flex items-center justify-between gap-2 mb-1.5">
			<label class="block text-sm font-medium text-primary">{{ label }}</label>
			<div
				class="flex items-center gap-1 border border-border rounded-md p-0.5"
				role="group"
				:aria-label="`${label}: how it is paid`"
			>
				<button
					type="button"
					:aria-pressed="!upfront"
					:class="[
						'px-2 py-0.5 text-[0.625rem] font-medium rounded-sm transition-colors',
						!upfront ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
					]"
					@click="upfront = false"
				>
					In lease
				</button>
				<button
					type="button"
					:aria-pressed="upfront"
					:class="[
						'px-2 py-0.5 text-[0.625rem] font-medium rounded-sm transition-colors',
						upfront ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
					]"
					@click="upfront = true"
				>
					At signing
				</button>
			</div>
		</div>
		<MaskedNumberInput v-model="amount" prefix="$" placeholder="0.00" :aria-label="label" :error="!!error" />
		<p v-if="error" class="mt-1.5 text-xs text-danger">{{ error[0] }}</p>
	</div>
</template>
