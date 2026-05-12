<script setup lang="ts">
import { ref, watch } from 'vue';

import TextInput from '@/components/TextInput.vue';
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

const PRESETS = ['PMI', 'Flood insurance', 'Earthquake insurance', 'Umbrella policy', 'Utilities', 'Maintenance reserve'];

const addExpense = (label = '') => {
	expenses.value.push({ label, amount: '', frequency: 'monthly' });
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
			<button
				class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary hover:bg-primary-light text-surface transition-colors"
				@click="addExpense('')"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add expense
			</button>
		</div>

		<div class="p-5 sm:p-6 space-y-4">
			<div v-for="(expense, index) in expenses" :key="index" class="bg-tan/40 border border-border p-4 rounded-md">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">Label</label>
						<TextInput v-model="expense.label" placeholder="PMI, utilities…" @input="emitUpdate" />
					</div>

					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">Amount</label>
						<TextInput
							v-model="expense.amount"
							type="number"
							step="0.01"
							min="0"
							prefix="$"
							placeholder="0.00"
							@input="emitUpdate"
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
				<p class="font-display italic text-base text-primary tracking-tight mb-2">No additional expenses.</p>
				<p class="text-xs mb-3">Quick add:</p>
				<div class="flex flex-wrap items-center justify-center gap-2">
					<button
						v-for="preset in PRESETS"
						:key="preset"
						class="px-3 py-1 rounded-md text-xs border border-border text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
						@click="addExpense(preset)"
					>
						{{ preset }}
					</button>
				</div>
			</div>

			<div v-if="expenses.length > 0" class="mt-2 pt-5 border-t border-border">
				<div class="bg-surface border border-border rounded-md p-4 flex items-center justify-between">
					<span class="eyebrow">Total monthly</span>
					<span class="figure text-lg text-primary leading-none">${{ formatCurrency(totalMonthly()) }}</span>
				</div>
			</div>
		</div>
	</section>
</template>
