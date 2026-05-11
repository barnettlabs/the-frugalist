<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Analysis</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Payment breakdown</h3>
			<div class="ml-auto flex items-center gap-1 border border-border rounded-md p-0.5">
				<button
					:class="[
						'px-2.5 py-1 text-xs font-medium rounded transition-colors',
						chartType === 'line' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
					]"
					@click="chartType = 'line'"
				>
					Line
				</button>
				<button
					:class="[
						'px-2.5 py-1 text-xs font-medium rounded transition-colors',
						chartType === 'pie' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
					]"
					@click="chartType = 'pie'"
				>
					Pie
				</button>
			</div>
		</div>

		<div v-if="paymentBreakdown" class="p-5 sm:p-6">
			<!-- Line Chart placeholder -->
			<div v-if="chartType === 'line'" class="mb-6">
				<div class="h-64 flex items-center justify-center bg-tan/40 border border-border rounded-md">
					<div class="text-center">
						<svg
							class="w-10 h-10 mx-auto mb-3 text-text-muted/50"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						<p class="eyebrow mb-1">Line chart</p>
						<p class="text-xs text-text-muted/70">Visualization coming soon</p>
					</div>
				</div>
			</div>

			<!-- Pie Chart -->
			<div v-if="chartType === 'pie'" class="mb-6">
				<div class="h-64 flex items-center justify-center">
					<div class="grid grid-cols-1 gap-4 w-full max-w-md">
						<!-- Manual pie chart representation -->
						<div class="relative">
							<div class="flex items-center justify-center h-48">
								<svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
									<!-- Principal segment -->
									<circle
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke="rgb(35 88 146)"
										stroke-width="20"
										:stroke-dasharray="`${principalPercentage * 2.51} 251`"
										stroke-dashoffset="0"
									/>
									<!-- Interest segment -->
									<circle
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke="rgb(168 64 60)"
										stroke-width="20"
										:stroke-dasharray="`${interestPercentage * 2.51} 251`"
										:stroke-dashoffset="`-${principalPercentage * 2.51}`"
									/>
									<!-- Extra payments segment -->
									<circle
										v-if="extraPaymentPercentage > 0"
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke="rgb(67 122 89)"
										stroke-width="20"
										:stroke-dasharray="`${extraPaymentPercentage * 2.51} 251`"
										:stroke-dashoffset="`-${(principalPercentage + interestPercentage) * 2.51}`"
									/>
								</svg>
							</div>
						</div>

						<!-- Legend -->
						<div class="space-y-2.5">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-accent"></span>
									<span class="eyebrow !text-[0.625rem]">Principal</span>
								</div>
								<div class="text-sm numeral text-primary">
									${{ formatCurrency(paymentBreakdown.principal) }}
									<span class="text-text-muted">· {{ principalPercentage.toFixed(1) }}%</span>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-danger"></span>
									<span class="eyebrow !text-[0.625rem]">Interest</span>
								</div>
								<div class="text-sm numeral text-primary">
									${{ formatCurrency(paymentBreakdown.interest) }}
									<span class="text-text-muted">· {{ interestPercentage.toFixed(1) }}%</span>
								</div>
							</div>
							<div v-if="paymentBreakdown.extraPayments > 0" class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-success"></span>
									<span class="eyebrow !text-[0.625rem]">Extra payments</span>
								</div>
								<div class="text-sm numeral text-primary">
									${{ formatCurrency(paymentBreakdown.extraPayments) }}
									<span class="text-text-muted">· {{ extraPaymentPercentage.toFixed(1) }}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Summary stats -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Total principal</p>
					<p class="figure text-xl text-accent-dark leading-none">${{ formatCurrency(paymentBreakdown.principal) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Total interest</p>
					<p class="figure text-xl text-warning leading-none">${{ formatCurrency(paymentBreakdown.interest) }}</p>
				</div>
				<div v-if="paymentBreakdown.extraPayments > 0" class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Extra payments</p>
					<p class="figure text-xl text-success leading-none">${{ formatCurrency(paymentBreakdown.extraPayments) }}</p>
				</div>
			</div>
		</div>

		<div v-else class="p-10 text-center text-sm text-text-muted">Enter loan details to see payment analysis.</div>
	</section>
</template>

<script setup>
import { computed, ref } from 'vue';

import { FinanceCalculator } from '../../utils/financeCalculator.js';

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

const chartType = ref('pie');

const paymentBreakdown = computed(() => {
	const calculator = new FinanceCalculator(props.data);
	return calculator.getPaymentBreakdown();
});

const totalAmount = computed(() => {
	if (!paymentBreakdown.value) return 0;
	return paymentBreakdown.value.principal + paymentBreakdown.value.interest + paymentBreakdown.value.extraPayments;
});

const principalPercentage = computed(() => {
	if (!paymentBreakdown.value || totalAmount.value === 0) return 0;
	return (paymentBreakdown.value.principal / totalAmount.value) * 100;
});

const interestPercentage = computed(() => {
	if (!paymentBreakdown.value || totalAmount.value === 0) return 0;
	return (paymentBreakdown.value.interest / totalAmount.value) * 100;
});

const extraPaymentPercentage = computed(() => {
	if (!paymentBreakdown.value || totalAmount.value === 0) return 0;
	return (paymentBreakdown.value.extraPayments / totalAmount.value) * 100;
});

import { formatCurrency } from '@/utils/formatters.js';
</script>
