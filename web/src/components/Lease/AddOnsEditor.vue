<script setup lang="ts">
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { ref, watch } from 'vue';

import MaskedNumberInput from '@/components/MaskedNumberInput.vue';
import { formatCurrency, parseOrZero } from '@/utils/formatters';

/**
 * Optional products rolled into the lease - service contracts, GAP, tire and
 * wheel - as named lines, the way a contract lists them under its gross
 * capitalized cost. Stored as add_ons_json.
 */
type Row = { name: string; amount: string };

const model = defineModel<string | null>({ default: null });

const rows = ref<Row[]>([]);

function parse(json: string | null): Row[] {
	if (!json) return [];
	try {
		const items = JSON.parse(json);
		return Array.isArray(items)
			? items.map(item => ({ name: String(item?.name ?? ''), amount: String(item?.amount ?? '') }))
			: [];
	} catch {
		return [];
	}
}

function serialise(list: Row[]): string | null {
	const kept = list.filter(row => row.name.trim() !== '' || row.amount !== '');
	return kept.length
		? JSON.stringify(kept.map(row => ({ name: row.name.trim(), amount: parseOrZero(row.amount) })))
		: null;
}

// Re-read only when the value changes from outside (a sheet loading), not on
// every keystroke, or a half-typed row would be dropped mid-edit.
watch(
	model,
	value => {
		if (value !== serialise(rows.value)) rows.value = parse(value);
	},
	{ immediate: true }
);

watch(rows, list => (model.value = serialise(list)), { deep: true });

const add = () => rows.value.push({ name: '', amount: '' });
const remove = (index: number) => rows.value.splice(index, 1);

const total = () => rows.value.reduce((sum, row) => sum + parseOrZero(row.amount), 0);
</script>

<template>
	<div>
		<label class="block text-sm font-medium text-primary mb-1.5">Optional products</label>
		<p class="text-xs text-text-muted mb-3">Service contracts, GAP, tire and wheel - anything added to the lease.</p>

		<div v-if="rows.length" class="space-y-2 mb-3">
			<div v-for="(row, index) in rows" :key="index" class="flex items-center gap-2">
				<input
					v-model="row.name"
					type="text"
					placeholder="Product"
					:aria-label="`Product ${index + 1} name`"
					class="block flex-1 min-w-0 rounded-md bg-surface text-primary placeholder:text-text-muted/60 shadow-none focus:ring-1 transition-colors px-3 py-2 text-sm border-border focus:border-accent focus:ring-accent"
				/>
				<div class="w-36 shrink-0">
					<MaskedNumberInput
						v-model="row.amount"
						prefix="$"
						placeholder="0.00"
						:aria-label="`Product ${index + 1} price`"
					/>
				</div>
				<button
					type="button"
					class="p-2 rounded-md text-text-muted hover:text-danger hover:bg-tan/50 transition-colors"
					:aria-label="`Remove ${row.name || `product ${index + 1}`}`"
					@click="remove(index)"
				>
					<XMarkIcon class="h-4 w-4" />
				</button>
			</div>
			<p class="numeral text-xs text-text-muted text-right pr-10">Total ${{ formatCurrency(total()) }}</p>
		</div>

		<button
			type="button"
			class="inline-flex items-center gap-1.5 text-sm font-medium text-accent-dark hover:text-primary transition-colors"
			@click="add"
		>
			<PlusIcon class="h-4 w-4" />
			Add a product
		</button>
	</div>
</template>
