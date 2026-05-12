<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline';
import { ref, watch } from 'vue';

import ActionMenu from '@/components/ActionMenu.vue';
import ActionMenuItem from '@/components/ActionMenuItem.vue';
import MaskedNumberInput from '@/components/MaskedNumberInput.vue';
import { expenseFrequencyOptions } from '@/types';
import { formatCurrency, parseOrZero } from '@/utils/formatters';

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
	},
});

interface ExtraExpense {
	label: string;
	amount: string;
	frequency: 'monthly' | 'annual';
}

const emit = defineEmits(['update:modelValue']);

const expenses = ref<ExtraExpense[]>([]);

const PRESETS: { label: string; frequency: 'monthly' | 'annual' }[] = [
	{ label: 'PMI', frequency: 'monthly' },
	{ label: 'Flood insurance', frequency: 'annual' },
	{ label: 'Earthquake insurance', frequency: 'annual' },
	{ label: 'Umbrella policy', frequency: 'annual' },
	{ label: 'Utilities', frequency: 'monthly' },
	{ label: 'Maintenance reserve', frequency: 'monthly' },
];

watch(
	() => props.modelValue,
	newValue => {
		if (newValue) {
			try {
				const parsed = JSON.parse(newValue);
				expenses.value = Array.isArray(parsed) ? parsed : [];
			} catch {
				expenses.value = [];
			}
		} else {
			expenses.value = [];
		}
	},
	{ immediate: true }
);

const addExpense = (label = '', frequency: 'monthly' | 'annual' = 'monthly') => {
	expenses.value.push({ label, amount: '', frequency });
	emitUpdate();
};

const removeExpense = (index: number) => {
	expenses.value.splice(index, 1);
	emitUpdate();
};

const emitUpdate = () => emit('update:modelValue', JSON.stringify(expenses.value));

const monthlyOf = (e: ExtraExpense) => {
	const amount = parseOrZero(e.amount);
	return e.frequency === 'annual' ? amount / 12 : amount;
};

const totalMonthly = () => expenses.value.reduce((sum, e) => sum + monthlyOf(e), 0);
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Optional</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Other expenses</h3>
			<div class="ml-auto">
				<ActionMenu primary-label="Add expense" variant="primary" @primary="addExpense('')">
					<template #primary-icon>
						<PlusIcon class="h-3.5 w-3.5" />
					</template>
					<template #items>
						<p class="eyebrow !text-[0.625rem] px-3 pt-2 pb-1 text-text-muted">Quick add</p>
						<ActionMenuItem
							v-for="preset in PRESETS"
							:key="preset.label"
							@click="addExpense(preset.label, preset.frequency)"
						>
							<span class="numeral flex-1">{{ preset.label }}</span>
							<span class="text-text-muted ml-2 text-[0.625rem]">{{ preset.frequency }}</span>
						</ActionMenuItem>
					</template>
				</ActionMenu>
			</div>
		</div>

		<div class="p-5 sm:p-6 space-y-4">
			<div v-for="(expense, index) in expenses" :key="index" class="bg-tan/40 border border-border p-4 rounded-md">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">Label</label>
						<input
							v-model="expense.label"
							type="text"
							class="block w-full rounded-md border-border bg-surface shadow-none focus:border-accent focus:ring-1 focus:ring-accent text-sm px-3 py-2"
							placeholder="PMI, utilities…"
							@input="emitUpdate"
						/>
					</div>

					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">Amount</label>
						<MaskedNumberInput
							v-model="expense.amount"
							prefix="$"
							placeholder="0.00"
							@update:model-value="emitUpdate"
						/>
					</div>

					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">Frequency</label>
						<select
							v-model="expense.frequency"
							class="block w-full rounded-md border-border bg-surface shadow-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
							@change="emitUpdate"
						>
							<option v-for="opt in expenseFrequencyOptions" :key="opt.value" :value="opt.value">
								{{ opt.label }}
							</option>
						</select>
					</div>

					<div class="flex items-end">
						<button
							class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-border text-text-muted hover:border-danger/40 hover:text-danger hover:bg-danger/5 transition-colors"
							@click="removeExpense(index)"
						>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Remove
						</button>
					</div>
				</div>

				<div class="mt-3 flex items-center gap-3 text-xs text-text-muted">
					<span class="numeral">≈ ${{ formatCurrency(monthlyOf(expense)) }}/mo</span>
				</div>
			</div>

			<div v-if="expenses.length === 0" class="text-center py-8 text-text-muted">
				<p class="font-display italic text-base text-primary tracking-tight mb-1">No additional expenses.</p>
				<p class="text-xs">Use Add expense, or pick a preset from the dropdown.</p>
			</div>

			<div v-if="expenses.length > 0" class="mt-2 pt-5 border-t border-border">
				<div class="bg-surface border border-border rounded-md p-4 flex items-center justify-between">
					<span class="eyebrow">Total monthly (other)</span>
					<span class="figure text-lg text-primary leading-none">${{ formatCurrency(totalMonthly()) }}</span>
				</div>
			</div>
		</div>
	</section>
</template>
