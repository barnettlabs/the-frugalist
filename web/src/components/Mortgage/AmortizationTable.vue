<script setup lang="ts">
import { computed, ref } from 'vue';

import { formatCurrency } from '@/utils/formatters';
import { MortgageCalculator } from '@/utils/mortgageCalculator';

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

const expanded = ref(false);
const showWithExtra = ref(false);
const view = ref<'annual' | 'period'>('annual');
const selectedYear = ref<number | 'all'>('all');

const amortization = computed(() => {
	const calc = new MortgageCalculator(props.data as any);
	return calc.calculateAmortization(showWithExtra.value);
});

const annual = computed(() => {
	const calc = new MortgageCalculator(props.data as any);
	return calc.calculateAnnualAmortization(showWithExtra.value) as any[] | null;
});

const totalYears = computed(() => (annual.value ? annual.value.length : 0));

const displayedAnnualRows = computed(() => {
	if (!annual.value) return [];
	if (selectedYear.value === 'all') return annual.value;
	return annual.value.filter(r => r.year === selectedYear.value);
});

const displayedPeriodRows = computed(() => {
	if (!amortization.value) return [];
	const schedule = amortization.value.schedule;
	if (selectedYear.value === 'all') return schedule;
	const startMonth = (Number(selectedYear.value) - 1) * 12 + 1;
	const endMonth = Number(selectedYear.value) * 12;
	return schedule.filter((r: any) => r.month >= startMonth && r.month <= endMonth);
});

const yearOptions = computed(() => {
	if (!totalYears.value) return [];
	return Array.from({ length: totalYears.value }, (_, i) => i + 1);
});
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex flex-wrap items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Schedule</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Amortization</h3>
			<div class="ml-auto flex flex-wrap items-center gap-2">
				<!-- Annual / period toggle -->
				<div class="flex items-center gap-1 border border-border rounded-md p-0.5">
					<button
						:class="[
							'px-2.5 py-1 text-xs font-medium rounded transition-colors',
							view === 'annual' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
						]"
						@click="view = 'annual'"
					>
						Annual
					</button>
					<button
						:class="[
							'px-2.5 py-1 text-xs font-medium rounded transition-colors',
							view === 'period' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
						]"
						@click="view = 'period'"
					>
						Period
					</button>
				</div>
				<button
					class="px-3 py-1 text-xs font-medium rounded-md border border-border text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
					@click="showWithExtra = !showWithExtra"
				>
					{{ showWithExtra ? 'Hide' : 'Show' }} extras
				</button>
				<button
					class="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-tan/40 transition-colors"
					:title="expanded ? 'Collapse' : 'Expand'"
					@click="expanded = !expanded"
				>
					<svg
						class="w-4 h-4 transition-transform"
						:class="{ 'rotate-180': expanded }"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
			</div>
		</div>

		<div v-if="amortization && amortization.schedule.length > 0" class="p-5 sm:p-6">
			<!-- Summary stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Total interest</p>
					<p class="figure text-xl text-warning leading-none">${{ formatCurrency(amortization.totalInterest) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Total principal</p>
					<p class="figure text-xl text-primary leading-none">${{ formatCurrency(amortization.totalPrincipal) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Months to pay</p>
					<p class="figure text-xl text-primary leading-none">{{ amortization.monthsPaid }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Months saved</p>
					<p
						class="figure text-xl leading-none"
						:class="amortization.monthsSaved > 0 ? 'text-success' : 'text-text-muted'"
					>
						{{ amortization.monthsSaved > 0 ? amortization.monthsSaved : '·' }}
					</p>
				</div>
			</div>

			<div v-if="expanded">
				<!-- Year selector -->
				<div v-if="totalYears > 0" class="mt-6 flex flex-wrap items-center gap-3">
					<label class="eyebrow !text-[0.625rem]">Filter year</label>
					<select
						v-model="selectedYear"
						class="px-3 py-1.5 text-xs rounded-md border border-border bg-surface focus:border-accent focus:ring-1 focus:ring-accent"
					>
						<option value="all">All years ({{ totalYears }})</option>
						<option v-for="y in yearOptions" :key="y" :value="y">Year {{ y }}</option>
					</select>
					<div v-if="selectedYear !== 'all'" class="flex items-center gap-2 flex-1 min-w-[200px]">
						<input
							v-model.number="selectedYear"
							type="range"
							:min="1"
							:max="totalYears"
							class="flex-1 accent-primary"
						/>
						<span class="numeral text-xs text-text-muted whitespace-nowrap"
							>Year {{ selectedYear }} of {{ totalYears }}</span
						>
					</div>
				</div>

				<!-- Annual table -->
				<div v-if="view === 'annual'" class="mt-4 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
					<table class="min-w-full">
						<thead>
							<tr class="border-y border-border-strong">
								<th class="px-3 py-3 text-left eyebrow">Year</th>
								<th class="px-3 py-3 text-right eyebrow">Payment</th>
								<th v-if="showWithExtra" class="px-3 py-3 text-right eyebrow">Extra</th>
								<th class="px-3 py-3 text-right eyebrow">Escrow</th>
								<th class="px-3 py-3 text-right eyebrow">Principal</th>
								<th class="px-3 py-3 text-right eyebrow">Interest</th>
								<th class="px-3 py-3 text-right eyebrow">Balance</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							<tr v-for="row in displayedAnnualRows" :key="row.year" class="hover:bg-tan/30 transition-colors">
								<td class="px-3 py-2.5 text-sm numeral text-text-muted">{{ row.year }}</td>
								<td class="px-3 py-2.5 text-sm numeral text-primary text-right">${{ formatCurrency(row.payment) }}</td>
								<td v-if="showWithExtra" class="px-3 py-2.5 text-sm numeral text-success text-right">
									${{ formatCurrency(row.extraPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-primary text-right">
									${{ formatCurrency(row.escrowPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-accent-dark text-right">
									${{ formatCurrency(row.principalPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-warning text-right">
									${{ formatCurrency(row.interestPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-primary text-right">
									${{ formatCurrency(row.remainingBalance) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Period (monthly) table -->
				<div v-else class="mt-4 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
					<table class="min-w-full">
						<thead>
							<tr class="border-y border-border-strong">
								<th class="px-3 py-3 text-left eyebrow">Month</th>
								<th class="px-3 py-3 text-right eyebrow">Payment</th>
								<th v-if="showWithExtra" class="px-3 py-3 text-right eyebrow">Extra</th>
								<th class="px-3 py-3 text-right eyebrow">Escrow</th>
								<th class="px-3 py-3 text-right eyebrow">Principal</th>
								<th class="px-3 py-3 text-right eyebrow">Interest</th>
								<th class="px-3 py-3 text-right eyebrow">Balance</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							<tr v-for="row in displayedPeriodRows" :key="row.month" class="hover:bg-tan/30 transition-colors">
								<td class="px-3 py-2.5 text-sm numeral text-text-muted">{{ row.month }}</td>
								<td class="px-3 py-2.5 text-sm numeral text-primary text-right">${{ formatCurrency(row.payment) }}</td>
								<td v-if="showWithExtra" class="px-3 py-2.5 text-sm numeral text-success text-right">
									${{ formatCurrency(row.extraPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-primary text-right">
									${{ formatCurrency(row.escrowPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-accent-dark text-right">
									${{ formatCurrency(row.principalPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-warning text-right">
									${{ formatCurrency(row.interestPayment) }}
								</td>
								<td class="px-3 py-2.5 text-sm numeral text-primary text-right">
									${{ formatCurrency(row.remainingBalance) }}
								</td>
							</tr>
						</tbody>
					</table>
					<p
						v-if="selectedYear === 'all' && amortization.schedule.length > 60"
						class="mt-3 text-center text-xs text-text-muted"
					>
						Showing all {{ amortization.schedule.length }} months · use the year filter to narrow
					</p>
				</div>
			</div>
		</div>

		<div v-else class="p-10 text-center text-sm text-text-muted">
			Enter loan details to see the amortization schedule.
		</div>
	</section>
</template>
