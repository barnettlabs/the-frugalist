<script setup lang="ts">
import {
	ArrowUpRightIcon,
	BanknotesIcon,
	CalculatorIcon,
	ChartBarIcon,
	CurrencyDollarIcon,
	HomeModernIcon,
	LightBulbIcon,
	ScaleIcon,
} from '@heroicons/vue/24/outline';
import { RouterLink } from 'vue-router';

import SectionHeader from '@/components/SectionHeader.vue';

const calculators = [
	{
		number: '01',
		eyebrow: 'Financing',
		name: 'Loans, line by line',
		description:
			'Monthly payment, total interest, the amortization schedule. Every variable in any vehicle loan, made plain.',
		href: '/estimates/financing',
		icon: BanknotesIcon,
		features: ['Monthly payment breakdown', 'Total interest cost', 'Amortization schedule'],
	},
	{
		number: '02',
		eyebrow: 'Leasing',
		name: 'Lease, made literal',
		description:
			'Money factor → APR. Residual mechanics. The fees that sneak through fine print. The full picture, before the contract.',
		href: '/estimates/leasing',
		icon: CurrencyDollarIcon,
		features: ['Money factor → APR', 'Residual value analysis', 'Total lease cost'],
	},
	{
		number: '03',
		eyebrow: 'Mortgage',
		name: 'Home loans, opened up',
		description:
			'Principal, escrow, tax, insurance, HOA. Extra payments and term reduction. The full cost of a home, before you sign.',
		href: '/estimates/mortgage',
		icon: HomeModernIcon,
		features: ['Principal, interest, escrow', 'Extra payment impact', 'Annual or monthly amortization'],
	},
];

const benefits = [
	{
		icon: ChartBarIcon,
		title: 'See the full picture',
		description: 'Break down payments into principal, interest, and fees.',
	},
	{ icon: ScaleIcon, title: 'Compare options', description: 'Evaluate different terms and rates side by side.' },
	{ icon: LightBulbIcon, title: 'Make informed choices', description: 'Understand the true cost before you commit.' },
];
</script>

<template>
	<div class="pb-16">
		<SectionHeader
			eyebrow="Compute · Estimates"
			title="The math, before the moment."
			description="Every offer is a formula. These calculators run it forward, so you walk in already knowing what the deal really costs."
			:icon="CalculatorIcon"
		/>

		<!-- Benefits row -->
		<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden">
				<div v-for="(b, i) in benefits" :key="b.title" class="bg-surface p-6 flex items-start gap-4">
					<span class="numeral text-text-muted text-xs">0{{ i + 1 }}</span>
					<div>
						<p class="font-display text-lg text-primary tracking-tight leading-snug">{{ b.title }}</p>
						<p class="text-sm text-text-muted mt-1">{{ b.description }}</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Two calculators -->
		<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16">
			<div class="flex items-end justify-between mb-8">
				<div>
					<p class="eyebrow mb-3">Pick your tool</p>
					<h2 class="font-display font-medium text-primary tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
						Three calculators. <span class="italic text-accent-dark">One discipline.</span>
					</h2>
				</div>
			</div>

			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden"
			>
				<RouterLink
					v-for="calc in calculators"
					:key="calc.name"
					:to="calc.href"
					class="group bg-surface hover:bg-surface-dark transition-colors p-8 sm:p-10 flex flex-col"
				>
					<div class="flex items-start justify-between mb-8">
						<span class="numeral text-text-muted text-sm">{{ calc.number }}</span>
						<component :is="calc.icon" class="h-5 w-5 text-text-muted group-hover:text-accent-dark transition-colors" />
					</div>
					<p class="eyebrow mb-3">{{ calc.eyebrow }}</p>
					<h3 class="font-display font-medium text-primary tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
						{{ calc.name }}
					</h3>
					<p class="mt-5 text-sm text-text-muted leading-relaxed">{{ calc.description }}</p>
					<ul class="mt-6 space-y-1.5">
						<li v-for="feature in calc.features" :key="feature" class="flex items-center gap-2 text-xs text-primary">
							<span class="h-px w-3 bg-accent-dark"></span>
							<span class="numeral">{{ feature }}</span>
						</li>
					</ul>
					<div class="mt-auto pt-8 flex items-center gap-2 text-primary group-hover:text-accent-dark transition-colors">
						<span class="text-sm font-medium">Open the calculator</span>
						<ArrowUpRightIcon
							class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						/>
					</div>
				</RouterLink>
			</div>
		</section>
	</div>
</template>
