<script setup lang="ts">
import { computed, ref } from 'vue';

import { formatCurrency } from '@/utils/formatters.js';

import { LeaseCalculator } from '../../utils/leaseCalculator.js';

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

const expanded = ref(false);

const summary = computed(() => {
	const calculator = new LeaseCalculator(props.data);
	return calculator.getSummary();
});

// Calculate buyout price at lease end
const endOfLeaseBuyout = computed(() => {
	if (!summary.value) return 0;
	return summary.value.residualAmount;
});

interface BuyoutScenario {
	monthsElapsed: number;
	remainingMonths: number;
	buyoutPrice: number;
	estimatedMarketValue: number;
	equity: number;
	totalPaidSoFar: number;
}

// Calculate early buyout scenarios
const earlyBuyoutScenarios = computed((): BuyoutScenario[] => {
	if (!summary.value || !props.data.lease_term) return [];

	const leaseTerm = parseInt(props.data.lease_term);
	const monthlyPayment = summary.value.leasePayment;
	const residualAmount = summary.value.residualAmount;
	const msrp = parseFloat(props.data.msrp || 0);

	const scenarios: BuyoutScenario[] = [];

	// Calculate for 6 months, 12 months, 18 months, and 24 months into lease
	const timePoints = [6, 12, 18, 24].filter(months => months < leaseTerm);

	timePoints.forEach(monthsElapsed => {
		const remainingPayments = leaseTerm - monthsElapsed;
		const remainingPaymentValue = remainingPayments * monthlyPayment;

		// Typical early buyout calculation: Residual + remaining payments (often with some discount)
		const earlyBuyoutPrice = residualAmount + remainingPaymentValue * 0.5; // 50% of remaining payments

		// Calculate depreciation rate for market value estimation
		const depreciationRate = (100 - parseFloat(props.data.residual_percent || 0)) / 100;
		const additionalDepreciation = (monthsElapsed / leaseTerm) * depreciationRate * 0.1; // Additional 10% depreciation
		const estimatedMarketValue = msrp * (1 - depreciationRate * (monthsElapsed / leaseTerm) - additionalDepreciation);

		scenarios.push({
			monthsElapsed,
			remainingMonths: remainingPayments,
			buyoutPrice: earlyBuyoutPrice,
			estimatedMarketValue,
			equity: Math.max(0, estimatedMarketValue - earlyBuyoutPrice),
			totalPaidSoFar: monthsElapsed * monthlyPayment + parseFloat(props.data.down_payment || 0),
		});
	});

	return scenarios;
});
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Endgame</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Buyout analysis</h3>
			<button
				class="ml-auto p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-tan/40 transition-colors"
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

		<div v-if="summary" class="p-5 sm:p-6">
			<!-- Top tiles -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">End-of-lease buyout</p>
					<p class="figure text-2xl text-primary leading-none">${{ formatCurrency(endOfLeaseBuyout) }}</p>
					<p class="numeral text-[0.6875rem] text-text-muted mt-1.5">{{ props.data.residual_percent }}% of MSRP</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow !text-[0.625rem] mb-1.5">Residual percentage</p>
					<p class="figure text-2xl text-primary leading-none">{{ props.data.residual_percent || 0 }}%</p>
					<p class="numeral text-[0.6875rem] text-text-muted mt-1.5">of original MSRP</p>
				</div>
			</div>

			<!-- Detailed (expandable) -->
			<div v-if="expanded" class="mt-6 space-y-5">
				<!-- End of lease options -->
				<div>
					<p class="eyebrow mb-3">End-of-lease options</p>
					<dl class="divide-y divide-border border-y border-border">
						<div class="flex justify-between py-2.5">
							<dt class="text-sm text-text-muted">Return vehicle</dt>
							<dd class="text-sm numeral text-primary">
								$0 <span class="text-text-muted">(subject to wear/mileage)</span>
							</dd>
						</div>
						<div class="flex justify-between py-2.5">
							<dt class="text-sm text-text-muted">Purchase vehicle</dt>
							<dd class="text-sm numeral text-primary">${{ formatCurrency(endOfLeaseBuyout) }}</dd>
						</div>
					</dl>
					<p class="text-xs text-text-muted/80 mt-2 italic">
						Buyout price is typically the residual value plus applicable fees.
					</p>
				</div>

				<!-- Early buyout scenarios -->
				<div v-if="earlyBuyoutScenarios.length > 0">
					<p class="eyebrow mb-3">Early buyout scenarios</p>
					<div class="overflow-x-auto">
						<table class="min-w-full text-sm">
							<thead>
								<tr class="border-y border-border-strong">
									<th class="text-left py-2.5 px-2 eyebrow">Months in</th>
									<th class="text-right py-2.5 px-2 eyebrow">Buyout</th>
									<th class="text-right py-2.5 px-2 eyebrow">Market</th>
									<th class="text-right py-2.5 px-2 eyebrow">Equity</th>
									<th class="text-right py-2.5 px-2 eyebrow">Total paid</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								<tr
									v-for="scenario in earlyBuyoutScenarios"
									:key="scenario.monthsElapsed"
									class="hover:bg-tan/30 transition-colors"
								>
									<td class="py-2.5 px-2 numeral text-text-muted">{{ scenario.monthsElapsed }}</td>
									<td class="py-2.5 px-2 numeral text-primary text-right">
										${{ formatCurrency(scenario.buyoutPrice) }}
									</td>
									<td class="py-2.5 px-2 numeral text-primary text-right">
										${{ formatCurrency(scenario.estimatedMarketValue) }}
									</td>
									<td
										class="py-2.5 px-2 numeral text-right"
										:class="scenario.equity > 0 ? 'text-success' : 'text-danger'"
									>
										${{ formatCurrency(scenario.equity) }}
									</td>
									<td class="py-2.5 px-2 numeral text-primary text-right">
										${{ formatCurrency(scenario.totalPaidSoFar) }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p class="mt-3 text-xs text-text-muted/80 italic">
						Early buyout prices are estimates and vary by leasing company. Market values use linear depreciation, which
						is approximate.
					</p>
				</div>

				<!-- Considerations -->
				<div class="border border-warning/20 bg-warning/5 rounded-md p-4">
					<p class="eyebrow text-warning mb-3">Buyout considerations</p>
					<ul class="space-y-2 text-sm text-text-muted">
						<li class="flex items-start gap-2">
							<span class="h-px w-3 bg-warning mt-2 flex-shrink-0"></span>
							<span>Check actual market value before buying. Get an appraisal.</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="h-px w-3 bg-warning mt-2 flex-shrink-0"></span>
							<span>Factor in sales tax, registration, and title fees for the purchase.</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="h-px w-3 bg-warning mt-2 flex-shrink-0"></span>
							<span>Consider warranty coverage differences between leased and owned vehicles.</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="h-px w-3 bg-warning mt-2 flex-shrink-0"></span>
							<span>Early buyout may require paying disposition fees and remaining payments.</span>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div v-else class="p-10 text-center text-sm text-text-muted">Enter lease details to see buyout analysis.</div>
	</section>
</template>
