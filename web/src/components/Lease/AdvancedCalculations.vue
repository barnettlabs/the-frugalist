<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import type { LeaseFormData } from '@/types/models';

import { LeaseCalculator } from '../../utils/leaseCalculator.js';

const props = defineProps({
	data: {
		type: Object as PropType<LeaseFormData>,
		required: true,
	},
});

const expanded = ref(false);

const summary = computed(() => {
	const calculator = new LeaseCalculator(props.data);
	return calculator.getSummary();
});

const costPerMile = computed(() => {
	if (!summary.value) return '0.00';
	const assumedMiles = 12000; // Typical annual mileage
	const leaseTerm = parseIntOrZero(props.data.lease_term);
	const totalMiles = assumedMiles * (leaseTerm / 12);
	if (totalMiles === 0) return '0.00';
	return (summary.value.totalLeaseCost / totalMiles).toFixed(2);
});

const depreciationRate = computed(() => {
	const msrp = parseOrZero(props.data.msrp);
	const residualPercent = parseOrZero(props.data.residual_percent);
	if (msrp === 0) return '0.0';
	return (100 - residualPercent).toFixed(1);
});

import { formatCurrency, parseIntOrZero, parseOrZero } from '@/utils/formatters.js';
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
					<p class="figure text-2xl text-primary leading-none">${{ formatCurrency(summary.leasePayment) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Due at signing</p>
					<p class="figure text-2xl text-primary leading-none">${{ formatCurrency(summary.cashDueAtSigning) }}</p>
				</div>
			</div>

			<div v-if="expanded" class="mt-6 space-y-5">
				<!-- Vehicle pricing -->
				<div>
					<p class="eyebrow mb-3">Vehicle pricing</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">MSRP</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(data.msrp) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Dealer contribution</dt>
							<dd class="text-sm numeral text-success">−${{ formatCurrency(data.dealer_contribution) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Trade-in value</dt>
							<dd class="text-sm numeral text-success">−${{ formatCurrency(data.trade_in) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-sm">
							<dt class="text-sm font-medium text-primary">Final dealer price</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.finalDealerPrice) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Capitalized cost -->
				<div>
					<p class="eyebrow mb-3">Capitalized cost</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Final dealer price</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.finalDealerPrice) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Doc fee</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(data.doc_fee) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Acquisition fee</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(data.acquisition_fee) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Misc fees</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(data.misc_fees) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-sm">
							<dt class="text-sm font-medium text-primary">Gross cap cost</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.grossCapCost) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Down payment</dt>
							<dd class="text-sm numeral text-success">−${{ formatCurrency(data.down_payment) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Lease cash</dt>
							<dd class="text-sm numeral text-success">−${{ formatCurrency(data.lease_cash) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-sm">
							<dt class="text-sm font-medium text-primary">Net cap cost</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.netCapCost) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Residual value -->
				<div>
					<p class="eyebrow mb-3">Residual value</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">MSRP</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(data.msrp) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Residual percentage</dt>
							<dd class="text-sm numeral text-primary">{{ data.residual_percent }}%</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-sm">
							<dt class="text-sm font-medium text-primary">Residual amount</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.residualAmount) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Monthly payment breakdown -->
				<div>
					<p class="eyebrow mb-3">Monthly payment breakdown</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Principal payment</dt>
							<dd class="text-sm numeral text-accent-dark">${{ formatCurrency(summary.monthlyPrincipalPayment) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Interest payment</dt>
							<dd class="text-sm numeral text-warning">
								${{ formatCurrency(summary.residualMonthlyInterestPayment) }}
							</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Monthly sales tax</dt>
							<dd class="text-sm numeral text-signal-dark">${{ formatCurrency(summary.monthlySalesTax) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-sm">
							<dt class="text-sm font-medium text-primary">Total monthly</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.leasePayment) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Advanced metrics -->
				<div>
					<p class="eyebrow mb-3">Advanced metrics</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Money factor</dt>
							<dd class="text-sm numeral text-primary">
								{{ data.money_factor }} <span class="text-text-muted">({{ summary.interestRate.toFixed(2) }}%)</span>
							</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Lease term</dt>
							<dd class="text-sm numeral text-primary">{{ data.lease_term }} mo</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Total lease cost</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.totalLeaseCost) }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Cost per mile</dt>
							<dd class="text-sm numeral text-primary">${{ costPerMile }}</dd>
						</div>
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Depreciation rate</dt>
							<dd class="text-sm numeral text-primary">{{ depreciationRate }}%</dd>
						</div>
					</dl>
				</div>

				<!-- Total summary -->
				<div class="border border-accent/20 bg-accent/5 rounded-md p-4">
					<p class="eyebrow text-accent-dark mb-3">Total lease summary</p>
					<dl class="space-y-2">
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Monthly × {{ data.lease_term }}</dt>
							<dd class="text-sm numeral text-primary">
								${{ formatCurrency(summary.leasePayment * parseIntOrZero(data.lease_term)) }}
							</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Cash due at signing</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.cashDueAtSigning) }}</dd>
						</div>
						<div class="flex justify-between pt-2 border-t border-border">
							<dt class="text-sm font-medium text-primary">Total lease cost</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.totalLeaseCost) }}</dd>
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

		<div v-else class="p-10 text-center text-sm text-text-muted">Enter lease details to see advanced calculations.</div>
	</section>
</template>
