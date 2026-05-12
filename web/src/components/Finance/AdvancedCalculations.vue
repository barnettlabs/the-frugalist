<script setup lang="ts">
import { computed, ref } from 'vue';

import { FinanceCalculator } from '../../utils/financeCalculator.js';

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

const expanded = ref(false);

const summary = computed(() => {
	const calculator = new FinanceCalculator(props.data);
	return calculator.getSummary();
});

const hasExtraPayments = computed(() => {
	return props.data.extra_payments_json && props.data.extra_payments_json !== '';
});

const interestRatio = computed(() => {
	if (!summary.value || summary.value.paymentsTotal === 0) return 0;
	return ((summary.value.interestAmount / summary.value.paymentsTotal) * 100).toFixed(1);
});

const principalRatio = computed(() => {
	if (!summary.value || summary.value.paymentsTotal === 0) return 0;
	return ((summary.value.loanAmount / summary.value.paymentsTotal) * 100).toFixed(1);
});

const totalCost = computed(() => {
	if (!summary.value) return 0;
	return summary.value.paymentsTotal + parseFloat(props.data.down_payment || 0);
});

const costVsMsrpRatio = computed(() => {
	const msrp = parseFloat(props.data.msrp || 0);
	if (msrp === 0) return 0;
	return ((totalCost.value / msrp) * 100).toFixed(1);
});

const timeSaved = computed(() => {
	if (!hasExtraPayments.value || !summary.value || !summary.value.amortization) return 0;
	return summary.value.amortization.monthsSaved || 0;
});

const interestSaved = computed(() => {
	if (!hasExtraPayments.value) return 0;

	const dataWithoutExtra = { ...props.data, extra_payments_json: '' };

	const calculatorWithoutExtra = new FinanceCalculator(dataWithoutExtra);
	const calculatorWithExtra = new FinanceCalculator(props.data);

	const amortizationWithoutExtra = calculatorWithoutExtra.calculateAmortization(false);
	const amortizationWithExtra = calculatorWithExtra.calculateAmortization(true);

	if (!amortizationWithoutExtra || !amortizationWithExtra) {
		return 0;
	}

	const diff = amortizationWithoutExtra.totalInterest - amortizationWithExtra.totalInterest;

	return Math.max(0, diff);
});

const totalExtraPayments = computed(() => {
	if (!hasExtraPayments.value || !summary.value.paymentBreakdown) return 0;
	return summary.value.paymentBreakdown.extraPayments || 0;
});

import { formatCurrency } from '@/utils/formatters.js';
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Summary</span>
			<h3 class="font-display text-xl text-primary tracking-tight">At a glance</h3>
		</div>

		<div v-if="summary" class="p-5 sm:p-6">
			<!-- Top tiles -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Monthly</p>
					<p class="figure text-2xl text-primary leading-none">${{ formatCurrency(summary.monthlyPayment) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Due at signing</p>
					<p class="figure text-2xl text-primary leading-none">
						${{ formatCurrency(parseFloat(data.down_payment || 0)) }}
					</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Total interest</p>
					<p class="figure text-2xl text-warning leading-none">${{ formatCurrency(summary.interestAmount) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Total paid</p>
					<p class="figure text-2xl text-primary leading-none">
						${{ formatCurrency(summary.paymentsTotal + parseFloat(data.down_payment || 0)) }}
					</p>
				</div>
			</div>

			<!-- Detailed (expandable) -->
			<div v-if="expanded" class="mt-6 space-y-5">
				<!-- Purchase breakdown -->
				<div>
					<p class="eyebrow mb-3">Purchase breakdown</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">MSRP</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(data.msrp) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Discounts</dt>
							<dd class="text-sm numeral text-success">−${{ formatCurrency(data.discounts) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Rebates</dt>
							<dd class="text-sm numeral text-success">−${{ formatCurrency(data.rebates) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-sm">
							<dt class="text-sm font-medium text-primary">Purchase price</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.purchasePrice) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Loan breakdown -->
				<div>
					<p class="eyebrow mb-3">Loan breakdown</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Purchase price</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.purchasePrice) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Fees</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(data.fees) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Sales tax</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.salesTaxAmount) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Down payment</dt>
							<dd class="text-sm numeral text-success">−${{ formatCurrency(data.down_payment) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-sm">
							<dt class="text-sm font-medium text-primary">Amount financed</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.loanAmount) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Payment analysis -->
				<div>
					<p class="eyebrow mb-3">Payment analysis</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Monthly</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.monthlyPayment) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Number of payments</dt>
							<dd class="text-sm numeral text-primary">{{ data.finance_term }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Total of payments</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.paymentsTotal) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Total interest</dt>
							<dd class="text-sm numeral text-warning">${{ formatCurrency(summary.interestAmount) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Advanced metrics -->
				<div>
					<p class="eyebrow mb-3">Advanced metrics</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Interest rate</dt>
							<dd class="text-sm numeral text-primary">{{ data.interest_rate }}%</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Sales tax rate</dt>
							<dd class="text-sm numeral text-primary">{{ data.sales_tax_percent }}%</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Loan term</dt>
							<dd class="text-sm numeral text-primary">{{ data.finance_term }} mo</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Interest / principal</dt>
							<dd class="text-sm numeral text-primary">{{ interestRatio }}% / {{ principalRatio }}%</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Total cost</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(totalCost) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Cost vs MSRP</dt>
							<dd class="text-sm numeral text-primary">{{ costVsMsrpRatio }}%</dd>
						</div>
					</dl>
				</div>

				<!-- Extra payments impact -->
				<div v-if="hasExtraPayments" class="border border-success/20 bg-success/5 rounded-md p-4">
					<p class="eyebrow text-success mb-3">Extra payment impact</p>
					<dl class="space-y-2">
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Total extra payments</dt>
							<dd class="text-sm numeral text-success">${{ formatCurrency(totalExtraPayments) }}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Interest saved</dt>
							<dd class="text-sm numeral text-success">${{ formatCurrency(interestSaved) }}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Time saved</dt>
							<dd class="text-sm numeral text-success">{{ timeSaved }} mo</dd>
						</div>
					</dl>
				</div>
			</div>

			<button
				class="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md border border-primary/20 bg-tan/40 text-sm font-medium text-primary hover:bg-tan/70 hover:border-primary/40 transition-colors"
				:aria-expanded="expanded"
				@click="expanded = !expanded"
			>
				<span>{{ expanded ? 'Hide details' : 'Show all details' }}</span>
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

		<div v-else class="p-10 text-center text-sm text-text-muted">Enter loan details to see advanced calculations.</div>
	</section>
</template>
