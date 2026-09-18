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

const summary = computed(() => {
	const calc = new MortgageCalculator(props.data as any);
	return calc.getSummary();
});

const hasExtraPayments = computed(() => {
	const json = props.data.extra_payments_json;
	return !!json && json !== '' && json !== '[]';
});

const hasEscrow = computed(() => summary.value.monthlyEscrow > 0);

const interestRatio = computed(() => {
	const total = summary.value.paymentsTotal;
	if (!total) return '0';
	return ((summary.value.totalInterest / total) * 100).toFixed(1);
});

const principalRatio = computed(() => {
	const total = summary.value.paymentsTotal;
	if (!total) return '0';
	return ((summary.value.totalPrincipal / total) * 100).toFixed(1);
});

const interestSaved = computed(() => {
	if (!hasExtraPayments.value) return 0;
	const without = new MortgageCalculator({ ...props.data, extra_payments_json: '' } as any).calculateAmortization(
		false
	);
	const withExtra = new MortgageCalculator(props.data as any).calculateAmortization(true);
	if (!without || !withExtra) return 0;
	return Math.max(0, without.totalInterest - withExtra.totalInterest);
});

// Scheduled (non-extra) principal — i.e., what would have been paid without extras
const scheduledPrincipal = computed(() => {
	return Math.max(0, summary.value.totalPrincipal - summary.value.totalExtraPayments);
});

// Down payment + principal + interest (no escrow/expenses)
const totalLoanCost = computed(() => summary.value.downPayment + summary.value.paymentsTotal);

// Human-friendly label for the actual loan term (accounts for extra-payment payoff acceleration)
const termLabel = computed(() => {
	const months = summary.value.monthsPaid || 0;
	const years = Math.floor(months / 12);
	const remMonths = months % 12;
	if (years === 0) return `${remMonths} mo`;
	if (remMonths === 0) return `${years} yr`;
	return `${years} yr ${remMonths} mo`;
});

// Shrink the figure size based on its formatted character length so big numbers stay readable.
function figureSize(amount: number): string {
	const len = formatCurrency(amount).length + 1; // include the "$" prefix
	if (len <= 9) return 'text-xl sm:text-2xl';
	if (len <= 11) return 'text-lg sm:text-xl';
	if (len <= 13) return 'text-base sm:text-lg';
	if (len <= 15) return 'text-sm sm:text-base';
	return 'text-xs sm:text-sm';
}
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
				<div class="bg-surface p-4 min-w-0">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Monthly (P&amp;I)</p>
					<p class="figure text-primary leading-none" :class="figureSize(summary.monthlyPrincipalInterest)">
						${{ formatCurrency(summary.monthlyPrincipalInterest) }}
					</p>
				</div>
				<div class="bg-surface p-4 min-w-0">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Monthly (all-in)</p>
					<p class="figure text-primary leading-none" :class="figureSize(summary.monthlyPaymentTotal)">
						${{ formatCurrency(summary.monthlyPaymentTotal) }}
					</p>
				</div>
				<div class="bg-surface p-4 min-w-0">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Total interest</p>
					<p class="figure text-warning leading-none" :class="figureSize(summary.totalInterest)">
						${{ formatCurrency(summary.totalInterest) }}
					</p>
				</div>
				<div class="bg-surface p-4 min-w-0">
					<p class="eyebrow text-[0.625rem]! mb-1.5">
						Grand total <span class="text-text-muted/70 normal-case">· over {{ termLabel }}</span>
					</p>
					<p class="figure text-primary leading-none" :class="figureSize(summary.grandTotal)">
						${{ formatCurrency(summary.grandTotal) }}
					</p>
				</div>
			</div>

			<!-- Detailed (expandable) -->
			<div v-if="expanded" class="mt-6 space-y-5">
				<!-- Loan -->
				<div>
					<p class="eyebrow mb-3">Loan</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Property value</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.propertyValue) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Down payment</dt>
							<dd class="text-sm numeral text-success">
								−${{ formatCurrency(summary.downPayment) }}
								<span class="text-text-muted">· {{ summary.downPaymentPercent.toFixed(2) }}%</span>
							</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">Loan principal</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.principal) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Monthly breakdown -->
				<div>
					<p class="eyebrow mb-3">Monthly breakdown</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Principal &amp; interest</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.monthlyPrincipalInterest) }}</dd>
						</div>
						<div v-if="summary.monthlyPropertyTax > 0" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Property tax</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.monthlyPropertyTax) }}</dd>
						</div>
						<div v-if="summary.monthlyInsurance > 0" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Insurance</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.monthlyInsurance) }}</dd>
						</div>
						<div v-if="summary.monthlyHoa > 0" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">HOA</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.monthlyHoa) }}</dd>
						</div>
						<div v-if="summary.monthlyExtraExpenses > 0" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Other expenses</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.monthlyExtraExpenses) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">Total monthly</dt>
							<dd class="text-sm numeral text-primary font-medium">
								${{ formatCurrency(summary.monthlyPaymentTotal) }}
							</dd>
						</div>
					</dl>
				</div>

				<!-- Lifetime totals (clearly grouped, no double-counting) -->
				<div>
					<p class="eyebrow mb-3">
						Lifetime totals
						<span class="text-text-muted/70 normal-case tracking-normal">· over {{ termLabel }}</span>
					</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Principal paid</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.totalPrincipal) }}</dd>
						</div>
						<div v-if="summary.totalExtraPayments > 0" class="flex justify-between py-2 pl-4">
							<dt class="text-xs text-text-muted/80">↳ scheduled portion</dt>
							<dd class="text-xs numeral text-text-muted">${{ formatCurrency(scheduledPrincipal) }}</dd>
						</div>
						<div v-if="summary.totalExtraPayments > 0" class="flex justify-between py-2 pl-4">
							<dt class="text-xs text-text-muted/80">↳ extra principal payments</dt>
							<dd class="text-xs numeral text-success">${{ formatCurrency(summary.totalExtraPayments) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Interest paid</dt>
							<dd class="text-sm numeral text-warning">${{ formatCurrency(summary.totalInterest) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/20 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">Total of payments</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.paymentsTotal) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Down payment (upfront)</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.downPayment) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">Total loan cost</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(totalLoanCost) }}</dd>
						</div>
						<div v-if="hasEscrow" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Escrow / expenses paid</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.totalEscrow) }}</dd>
						</div>
						<div v-if="hasEscrow" class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">Total out-of-pocket</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.grandTotal) }}</dd>
						</div>
					</dl>
					<div class="numeral text-[0.625rem] text-text-muted mt-2">
						· <strong>Total of payments</strong> = principal + interest
					</div>
					<div class="numeral text-[0.625rem] text-text-muted">
						· <strong>Total loan</strong> cost adds down payment
					</div>
					<div v-if="hasEscrow" class="numeral text-[0.625rem] text-text-muted">
						· <strong>Total out-of-pocket</strong> adds escrow/expenses over term length
					</div>
				</div>

				<!-- Advanced metrics -->
				<div>
					<p class="eyebrow mb-3">Advanced metrics</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Interest rate</dt>
							<dd class="text-sm numeral text-primary">{{ data.interest_rate || 0 }}%</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Loan term</dt>
							<dd class="text-sm numeral text-primary">
								{{ data.loan_term_years || 0 }} yr · {{ summary.loanTermMonths }} mo
							</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Down payment ratio</dt>
							<dd class="text-sm numeral text-primary">{{ summary.downPaymentPercent.toFixed(2) }}%</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Interest / principal of P&amp;I</dt>
							<dd class="text-sm numeral text-primary">{{ interestRatio }}% / {{ principalRatio }}%</dd>
						</div>
					</dl>
				</div>

				<!-- Extra payment impact -->
				<div
					v-if="hasExtraPayments && summary.monthsSaved > 0"
					class="border border-success/20 bg-success/5 rounded-md p-4"
				>
					<p class="eyebrow text-success mb-3">Extra payment impact</p>
					<dl class="space-y-2">
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Term reduction</dt>
							<dd class="text-sm numeral text-success">
								{{ summary.monthsSaved }} mo · {{ (summary.monthsSaved / 12).toFixed(1) }} yr
							</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">New term length</dt>
							<dd class="text-sm numeral text-success">
								{{ summary.monthsPaid }} mo · {{ (summary.monthsPaid / 12).toFixed(1) }} yr
							</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Interest saved</dt>
							<dd class="text-sm numeral text-success">${{ formatCurrency(interestSaved) }}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Total extra paid</dt>
							<dd class="text-sm numeral text-success">${{ formatCurrency(summary.totalExtraPayments) }}</dd>
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
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</div>

		<div v-else class="p-10 text-center text-sm text-text-muted">
			Enter property details to see advanced calculations.
		</div>
	</section>
</template>
