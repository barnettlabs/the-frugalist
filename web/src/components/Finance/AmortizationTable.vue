<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Schedule</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Amortization</h3>
			<div class="ml-auto flex items-center gap-2">
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
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>
			</div>
		</div>

		<div v-if="amortization && amortization?.schedule?.length > 0" class="p-5 sm:p-6">
			<!-- Summary stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Total interest</p>
					<p class="figure text-xl text-warning leading-none">${{ formatCurrency(amortization.totalInterest) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Total principal</p>
					<p class="figure text-xl text-primary leading-none">${{ formatCurrency(amortization.totalPrincipal) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Months to pay</p>
					<p class="figure text-xl text-primary leading-none">{{ amortization.monthsPaid }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Months saved</p>
					<p
						class="figure text-xl leading-none"
						:class="amortization.monthsSaved > 0 ? 'text-success' : 'text-text-muted'"
					>
						{{ amortization.monthsSaved > 0 ? amortization.monthsSaved : '·' }}
					</p>
				</div>
			</div>

			<!-- Table -->
			<div v-if="expanded" class="mt-6 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
				<table class="min-w-full">
					<thead>
						<tr class="border-y border-border-strong">
							<th class="px-3 py-3 text-left eyebrow">Month</th>
							<th class="px-3 py-3 text-right eyebrow">Payment</th>
							<th v-if="showWithExtra" class="px-3 py-3 text-right eyebrow">Extra</th>
							<th class="px-3 py-3 text-right eyebrow">Principal</th>
							<th class="px-3 py-3 text-right eyebrow">Interest</th>
							<th class="px-3 py-3 text-right eyebrow">Balance</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						<tr v-for="payment in displayedPayments" :key="payment.month" class="hover:bg-tan/30 transition-colors">
							<td class="px-3 py-2.5 text-sm numeral text-text-muted">{{ payment.month }}</td>
							<td class="px-3 py-2.5 text-sm numeral text-primary text-right">
								${{ formatCurrency(payment.payment) }}
							</td>
							<td v-if="showWithExtra" class="px-3 py-2.5 text-sm numeral text-success text-right">
								${{ formatCurrency(payment.extraPayment) }}
							</td>
							<td class="px-3 py-2.5 text-sm numeral text-accent-dark text-right">
								${{ formatCurrency(payment.principalPayment) }}
							</td>
							<td class="px-3 py-2.5 text-sm numeral text-warning text-right">
								${{ formatCurrency(payment.interestPayment) }}
							</td>
							<td class="px-3 py-2.5 text-sm numeral text-primary text-right">
								${{ formatCurrency(payment.remainingBalance) }}
							</td>
						</tr>
					</tbody>
				</table>

				<div v-if="amortization.schedule.length > 12" class="mt-4 text-center">
					<button
						class="text-xs eyebrow text-primary hover:text-accent-dark transition-colors"
						@click="showAllPayments = !showAllPayments"
					>
						{{ showAllPayments ? 'Show less' : `Show all ${amortization.schedule.length} payments` }}
					</button>
				</div>
			</div>
		</div>

		<div v-else class="p-10 text-center text-sm text-text-muted">
			Enter loan details to see the amortization schedule.
		</div>
	</section>
</template>

<script setup>
import { computed, ref } from 'vue';

import { formatCurrency } from '@/utils/formatters.js';

import { FinanceCalculator } from '../../utils/financeCalculator.js';

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

const expanded = ref(false);
const showWithExtra = ref(false);
const showAllPayments = ref(false);

const amortization = computed(() => {
	const calculator = new FinanceCalculator(props.data);
	return calculator.calculateAmortization(showWithExtra.value);
});

const displayedPayments = computed(() => {
	if (!amortization.value || !amortization.value.schedule) return [];
	const schedule = amortization.value.schedule;
	return showAllPayments.value ? schedule : schedule.slice(0, 12);
});
</script>
