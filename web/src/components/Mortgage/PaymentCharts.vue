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

const chartType = ref<'pi' | 'balance' | 'pie'>('pi');

const annual = computed(() => {
	const calc = new MortgageCalculator(props.data as any);
	return (calc.calculateAnnualAmortization(true) as any[] | null) ?? [];
});

const breakdown = computed(() => {
	const calc = new MortgageCalculator(props.data as any);
	return calc.getPaymentBreakdown();
});

const totalAmount = computed(() => {
	if (!breakdown.value) return 0;
	return breakdown.value.principal + breakdown.value.interest + breakdown.value.extraPayments;
});

const principalPercentage = computed(() => {
	if (!breakdown.value || totalAmount.value === 0) return 0;
	return (breakdown.value.principal / totalAmount.value) * 100;
});

const interestPercentage = computed(() => {
	if (!breakdown.value || totalAmount.value === 0) return 0;
	return (breakdown.value.interest / totalAmount.value) * 100;
});

const extraPercentage = computed(() => {
	if (!breakdown.value || totalAmount.value === 0) return 0;
	return (breakdown.value.extraPayments / totalAmount.value) * 100;
});

// SVG line chart helpers
const chartWidth = 720;
const chartHeight = 220;
const padding = { top: 12, right: 12, bottom: 28, left: 56 };

const innerWidth = computed(() => chartWidth - padding.left - padding.right);
const innerHeight = computed(() => chartHeight - padding.top - padding.bottom);

const maxValue = computed(() => {
	if (!annual.value.length) return 1;
	if (chartType.value === 'balance') {
		return Math.max(...annual.value.map(r => r.remainingBalance), 1);
	}
	if (chartType.value === 'pi') {
		return Math.max(...annual.value.flatMap(r => [r.principalPayment, r.interestPayment]), 1);
	}
	return 1;
});

const xAt = (index: number) => {
	if (annual.value.length < 2) return padding.left;
	return padding.left + (index / (annual.value.length - 1)) * innerWidth.value;
};
const yAt = (value: number) => {
	return padding.top + innerHeight.value - (value / maxValue.value) * innerHeight.value;
};

const principalPath = computed(() => {
	if (!annual.value.length) return '';
	return annual.value.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(r.principalPayment)}`).join(' ');
});
const interestPath = computed(() => {
	if (!annual.value.length) return '';
	return annual.value.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(r.interestPayment)}`).join(' ');
});
const balancePath = computed(() => {
	if (!annual.value.length) return '';
	return annual.value.map((r, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(r.remainingBalance)}`).join(' ');
});

const xTicks = computed(() => {
	const total = annual.value.length;
	if (total === 0) return [];
	const step = Math.max(1, Math.ceil(total / 8));
	const ticks = [];
	for (let i = 0; i < total; i += step) ticks.push({ index: i, label: `Y${annual.value[i].year}` });
	if (ticks[ticks.length - 1]?.index !== total - 1)
		ticks.push({ index: total - 1, label: `Y${annual.value[total - 1].year}` });
	return ticks;
});

const yTicks = computed(() => {
	const ticks = [];
	for (let i = 0; i <= 4; i++) {
		const value = (maxValue.value / 4) * i;
		ticks.push({ value, y: yAt(value) });
	}
	return ticks;
});
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex flex-wrap items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Analysis</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Payment breakdown</h3>
			<div class="ml-auto flex items-center gap-1 border border-border rounded-md p-0.5">
				<button
					:class="[
						'px-2.5 py-1 text-xs font-medium rounded-sm transition-colors',
						chartType === 'pi' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
					]"
					@click="chartType = 'pi'"
				>
					P / I
				</button>
				<button
					:class="[
						'px-2.5 py-1 text-xs font-medium rounded-sm transition-colors',
						chartType === 'balance' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
					]"
					@click="chartType = 'balance'"
				>
					Balance
				</button>
				<button
					:class="[
						'px-2.5 py-1 text-xs font-medium rounded-sm transition-colors',
						chartType === 'pie' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
					]"
					@click="chartType = 'pie'"
				>
					Pie
				</button>
			</div>
		</div>

		<div v-if="breakdown" class="p-5 sm:p-6">
			<!-- Line chart (P&I or Balance) -->
			<div v-if="chartType !== 'pie' && annual.length > 1" class="mb-6">
				<svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-auto">
					<!-- Y-axis grid -->
					<g v-for="(t, i) in yTicks" :key="i">
						<line
							:x1="padding.left"
							:x2="chartWidth - padding.right"
							:y1="t.y"
							:y2="t.y"
							stroke="rgb(0,0,0)"
							stroke-opacity="0.07"
							stroke-dasharray="2 4"
						/>
						<text
							:x="padding.left - 6"
							:y="t.y + 3"
							font-size="9"
							text-anchor="end"
							fill="rgb(0,0,0)"
							fill-opacity="0.5"
						>
							${{ formatCurrency(t.value) }}
						</text>
					</g>

					<!-- X-axis labels -->
					<g v-for="(t, i) in xTicks" :key="`x-${i}`">
						<text
							:x="xAt(t.index)"
							:y="chartHeight - padding.bottom + 16"
							font-size="9"
							text-anchor="middle"
							fill="rgb(0,0,0)"
							fill-opacity="0.5"
						>
							{{ t.label }}
						</text>
					</g>

					<!-- Series -->
					<template v-if="chartType === 'pi'">
						<path :d="principalPath" fill="none" stroke="rgb(35 88 146)" stroke-width="2" />
						<path :d="interestPath" fill="none" stroke="rgb(168 64 60)" stroke-width="2" />
					</template>
					<template v-else>
						<path :d="balancePath" fill="none" stroke="rgb(35 88 146)" stroke-width="2" />
					</template>
				</svg>

				<!-- Legend -->
				<div class="mt-3 flex items-center gap-5 text-xs">
					<template v-if="chartType === 'pi'">
						<div class="flex items-center gap-1.5">
							<span class="inline-block w-3 h-0.5 bg-accent"></span>
							<span class="eyebrow text-[0.625rem]!">Principal</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="inline-block w-3 h-0.5 bg-danger"></span>
							<span class="eyebrow text-[0.625rem]!">Interest</span>
						</div>
					</template>
					<template v-else>
						<div class="flex items-center gap-1.5">
							<span class="inline-block w-3 h-0.5 bg-accent"></span>
							<span class="eyebrow text-[0.625rem]!">Remaining balance</span>
						</div>
					</template>
				</div>
			</div>

			<!-- Pie chart -->
			<div v-if="chartType === 'pie'" class="mb-6">
				<div class="h-64 flex items-center justify-center">
					<div class="grid grid-cols-1 gap-4 w-full max-w-md">
						<div class="relative">
							<div class="flex items-center justify-center h-48">
								<svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
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
									<circle
										v-if="extraPercentage > 0"
										cx="50"
										cy="50"
										r="40"
										fill="none"
										stroke="rgb(67 122 89)"
										stroke-width="20"
										:stroke-dasharray="`${extraPercentage * 2.51} 251`"
										:stroke-dashoffset="`-${(principalPercentage + interestPercentage) * 2.51}`"
									/>
								</svg>
							</div>
						</div>

						<div class="space-y-2.5">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-accent"></span>
									<span class="eyebrow text-[0.625rem]!">Principal</span>
								</div>
								<div class="text-sm numeral text-primary">
									${{ formatCurrency(breakdown.principal) }}
									<span class="text-text-muted">· {{ principalPercentage.toFixed(1) }}%</span>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-danger"></span>
									<span class="eyebrow text-[0.625rem]!">Interest</span>
								</div>
								<div class="text-sm numeral text-primary">
									${{ formatCurrency(breakdown.interest) }}
									<span class="text-text-muted">· {{ interestPercentage.toFixed(1) }}%</span>
								</div>
							</div>
							<div v-if="breakdown.extraPayments > 0" class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-success"></span>
									<span class="eyebrow text-[0.625rem]!">Extra payments</span>
								</div>
								<div class="text-sm numeral text-primary">
									${{ formatCurrency(breakdown.extraPayments) }}
									<span class="text-text-muted">· {{ extraPercentage.toFixed(1) }}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Summary stats -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Total principal</p>
					<p class="figure text-xl text-accent-dark leading-none">${{ formatCurrency(breakdown.principal) }}</p>
				</div>
				<div class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Total interest</p>
					<p class="figure text-xl text-warning leading-none">${{ formatCurrency(breakdown.interest) }}</p>
				</div>
				<div v-if="breakdown.extraPayments > 0" class="bg-surface p-4">
					<p class="eyebrow text-[0.625rem]! mb-1.5">Extra payments</p>
					<p class="figure text-xl text-success leading-none">${{ formatCurrency(breakdown.extraPayments) }}</p>
				</div>
			</div>
		</div>

		<div v-else class="p-10 text-center text-sm text-text-muted">Enter loan details to see payment analysis.</div>
	</section>
</template>
