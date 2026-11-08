<script setup lang="ts">
import { LeaseCalculator } from '@frugalist/contracts';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import type { LeaseFormData } from '@/types/models';
import { formatCurrency, parseOrZero } from '@/utils/formatters';

const props = defineProps({
	data: {
		type: Object as PropType<LeaseFormData>,
		required: true,
	},
});

const expanded = ref(false);

const summary = computed(() => new LeaseCalculator({ ...props.data }).summary(false));

/*
 * Item 7 of a lease contract, in its own lettering, so a sheet copied from a
 * contract can be checked against it line by line.
 */
const waterfall = computed(() => {
	const s = summary.value;
	return [
		{ key: 'A', label: 'Gross capitalized cost', value: s.gross_cap_cost, op: '' },
		{ key: 'B', label: 'Capitalized cost reduction', value: s.cap_cost_reduction, op: '−' },
		{ key: 'C', label: 'Adjusted capitalized cost', value: s.net_cap_cost, op: '=', total: true },
		{ key: 'D', label: 'Residual value', value: s.residual_amount, op: '−' },
		{ key: 'E', label: 'Depreciation', value: s.depreciation, op: '=', total: true },
		{ key: 'F', label: 'Rent charge', value: s.rent_charge, op: '+' },
		{ key: 'G', label: 'Total of base payments', value: s.total_base_payments, op: '=', total: true },
	];
});

const grossItems = computed(() => {
	const s = summary.value;
	return [
		{ label: 'Agreed value', value: s.agreed_value },
		{ label: 'Taxes rolled in', value: parseOrZero(props.data.capitalized_taxes) },
		{ label: 'Fees rolled in', value: s.capitalized_fees },
		{ label: 'Prior balance', value: parseOrZero(props.data.prior_balance) },
		{ label: 'Optional products', value: s.add_ons_total },
		{ label: 'Negative trade-in equity', value: Math.max(0, -s.net_trade_in) },
	].filter((item, i) => i === 0 || item.value !== 0);
});

const signingItems = computed(() => {
	const s = summary.value;
	return [
		{ label: 'Capitalized cost reduction', value: s.cap_cost_reduction },
		{ label: 'Sales tax on cash and rebates', value: s.cap_cost_reduction_tax },
		{ label: 'First monthly payment', value: s.lease_payment },
		{ label: 'Fees paid at signing', value: s.upfront_fees },
		{ label: 'Refundable security deposit', value: s.security_deposit },
	].filter(item => item.value !== 0);
});

const paidBy = computed(() => {
	const s = summary.value;
	return [
		{ label: 'Rebates', value: parseOrZero(props.data.lease_cash) },
		{ label: 'Net trade-in', value: Math.max(0, s.net_trade_in) },
		{ label: 'Cash', value: s.cash_due_at_signing },
	].filter((item, i) => i === 2 || item.value !== 0);
});

const costPerMile = computed(() => {
	const s = summary.value;
	const miles = s.mileage_allowance || 12000 * (s.lease_term / 12);
	return miles > 0 ? s.total_lease_cost / miles : 0;
});
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Summary</span>
			<h3 class="font-display text-xl text-primary tracking-tight">At a glance</h3>
		</div>

		<div class="p-5 sm:p-6">
			<!-- Top tiles -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Monthly</p>
					<p class="figure text-2xl text-primary leading-none">${{ formatCurrency(summary.lease_payment) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Due at signing</p>
					<p class="figure text-2xl text-primary leading-none">${{ formatCurrency(summary.amount_due_at_signing) }}</p>
					<p
						v-if="summary.cash_due_at_signing !== summary.amount_due_at_signing"
						class="numeral text-[0.6875rem] text-text-muted mt-1.5"
					>
						${{ formatCurrency(summary.cash_due_at_signing) }} in cash
					</p>
				</div>
			</div>

			<div v-if="expanded" class="mt-6 space-y-5">
				<!-- How the payment is figured: contract item 7 -->
				<div>
					<p class="eyebrow mb-3">How the payment is figured</p>
					<dl class="divide-y divide-border border-y border-border">
						<div
							v-for="row in waterfall"
							:key="row.key"
							:class="['flex justify-between gap-3 py-2', row.total ? 'bg-tan/40 -mx-2 px-2 rounded-xs' : '']"
						>
							<dt :class="['text-sm', row.total ? 'font-medium text-primary' : 'text-text-muted']">
								<span class="numeral text-text-muted mr-1.5">{{ row.key }}</span
								>{{ row.label }}
							</dt>
							<dd :class="['text-sm numeral text-primary', row.total ? 'font-medium' : '']">
								<span class="text-text-muted mr-1">{{ row.op }}</span
								>${{ formatCurrency(row.value) }}
							</dd>
						</div>
						<div class="flex justify-between gap-3 py-2">
							<dt class="text-sm text-text-muted"><span class="numeral mr-1.5">H</span>Number of payments</dt>
							<dd class="text-sm numeral text-primary">
								<span class="text-text-muted mr-1">÷</span>{{ summary.lease_term }}
							</dd>
						</div>
						<div class="flex justify-between gap-3 py-2">
							<dt class="text-sm text-text-muted"><span class="numeral mr-1.5">I</span>Base monthly payment</dt>
							<dd class="text-sm numeral text-primary">
								<span class="text-text-muted mr-1">=</span>${{ formatCurrency(summary.base_payment) }}
							</dd>
						</div>
						<div class="flex justify-between gap-3 py-2">
							<dt class="text-sm text-text-muted"><span class="numeral mr-1.5">J</span>Sales tax</dt>
							<dd class="text-sm numeral text-primary">
								<span class="text-text-muted mr-1">+</span>${{ formatCurrency(summary.monthly_sales_tax) }}
							</dd>
						</div>
						<div class="flex justify-between gap-3 py-2.5 bg-tan/40 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">
								<span class="numeral text-text-muted mr-1.5">M</span>Monthly payment
							</dt>
							<dd class="text-sm numeral text-primary font-medium">
								<span class="text-text-muted mr-1">=</span>${{ formatCurrency(summary.lease_payment) }}
							</dd>
						</div>
					</dl>
					<p class="numeral text-[0.6875rem] text-text-muted mt-2">
						Money factor {{ summary.money_factor }} ≈ {{ summary.interest_rate.toFixed(2) }}% APR · residual
						{{ summary.residual_percent.toFixed(2) }}% of MSRP
					</p>
				</div>

				<!-- Gross capitalized cost -->
				<div>
					<p class="eyebrow mb-3">Gross capitalized cost</p>
					<dl class="divide-y divide-border border-y border-border">
						<div v-for="item in grossItems" :key="item.label" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">{{ item.label }}</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(item.value) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">Total</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.gross_cap_cost) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Due at signing -->
				<div>
					<p class="eyebrow mb-3">Due at signing</p>
					<dl class="divide-y divide-border border-y border-border">
						<div v-for="item in signingItems" :key="item.label" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">{{ item.label }}</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(item.value) }}</dd>
						</div>
						<div class="flex justify-between py-2.5 bg-tan/40 -mx-2 px-2 rounded-xs">
							<dt class="text-sm font-medium text-primary">Total</dt>
							<dd class="text-sm numeral text-primary font-medium">
								${{ formatCurrency(summary.amount_due_at_signing) }}
							</dd>
						</div>
						<div v-for="item in paidBy" :key="item.label" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Paid by {{ item.label.toLowerCase() }}</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(item.value) }}</dd>
						</div>
					</dl>
				</div>

				<!-- End of lease -->
				<div>
					<p class="eyebrow mb-3">End of lease</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Price to buy it</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.purchase_option_price) }}</dd>
						</div>
						<div v-if="summary.disposition_fee" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Turn-in fee if you return it</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.disposition_fee) }}</dd>
						</div>
						<div v-if="summary.mileage_allowance" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Miles allowed</dt>
							<dd class="text-sm numeral text-primary">{{ summary.mileage_allowance.toLocaleString('en-US') }}</dd>
						</div>
						<div v-if="summary.excess_mile_rate" class="flex justify-between py-2">
							<dt class="text-sm text-text-muted">Each extra mile</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.excess_mile_rate) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Totals -->
				<div class="border border-accent/20 bg-accent/5 rounded-md p-4">
					<p class="eyebrow text-accent-dark mb-3">Total lease cost</p>
					<dl class="space-y-2">
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Total of payments</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.total_of_payments) }}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Sales tax over the lease</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(summary.total_sales_tax) }}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-sm text-text-muted">Cost per mile</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(costPerMile) }}</dd>
						</div>
						<div class="flex justify-between pt-2 border-t border-border">
							<dt class="text-sm font-medium text-primary">Out of pocket</dt>
							<dd class="text-sm numeral text-primary font-medium">${{ formatCurrency(summary.total_lease_cost) }}</dd>
						</div>
					</dl>
					<p class="text-[0.6875rem] text-text-muted mt-2">
						Total of payments counts everything due, as the contract does. Out of pocket leaves out what rebates and
						trade-in equity cover.
					</p>
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
	</section>
</template>
