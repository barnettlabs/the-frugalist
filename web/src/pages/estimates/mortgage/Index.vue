<script setup lang="ts">
import { ArrowUpRightIcon, ChevronDownIcon, HomeModernIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { mortgageApi } from '@/api/mortgage';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Spinner from '@/components/Spinner.vue';
import { formatCurrency } from '@/utils/formatters';
import { MortgageCalculator } from '@/utils/mortgageCalculator';

interface MortgageSheet {
	id: number;
	sheet_name?: string;
	property_address?: string;
	property_type?: string;
	property_value?: number;
	down_payment?: number;
	interest_rate?: number;
	loan_term_years?: number;
	annual_insurance?: number;
	annual_property_tax?: number;
	monthly_hoa?: number;
	extra_expenses_json?: string;
	extra_payments_json?: string;
	created_at?: string;
	updated_at?: string;
}

const sheets = ref<MortgageSheet[]>([]);
const loading = ref(true);
const expandedCards = ref<Set<number>>(new Set());

const showDeleteDialog = ref(false);
const selectedSheet = ref<MortgageSheet | null>(null);
const actionLoading = ref(false);

const fetchSheets = async () => {
	try {
		const data = await mortgageApi.getAll();
		sheets.value = data as MortgageSheet[];
	} catch (error) {
		console.error('Error fetching mortgage sheets:', error);
	} finally {
		loading.value = false;
	}
};

const openDeleteDialog = (sheet: MortgageSheet) => {
	selectedSheet.value = sheet;
	showDeleteDialog.value = true;
};

const confirmDelete = async () => {
	if (!selectedSheet.value) return;
	actionLoading.value = true;
	try {
		await mortgageApi.delete(selectedSheet.value.id);
		await fetchSheets();
		showDeleteDialog.value = false;
		selectedSheet.value = null;
	} catch (error) {
		console.error('Error deleting sheet:', error);
	} finally {
		actionLoading.value = false;
	}
};

const getSheetCalculations = (sheet: MortgageSheet) => {
	try {
		const calculator = new MortgageCalculator(sheet as any);
		const summary = calculator.getSummary();
		return {
			monthlyPI: summary.monthlyPrincipalInterest,
			monthlyTotal: summary.monthlyPaymentTotal,
			totalInterest: summary.totalInterest,
			principal: summary.principal,
		};
	} catch {
		return { monthlyPI: 0, monthlyTotal: 0, totalInterest: 0, principal: 0 };
	}
};

const getDisplayTitle = (sheet: MortgageSheet) => {
	if (sheet.sheet_name) return sheet.sheet_name;
	if (sheet.property_address) return sheet.property_address;
	return 'Untitled mortgage';
};

const toggleCardDetails = (sheetId: number) => {
	if (expandedCards.value.has(sheetId)) expandedCards.value.delete(sheetId);
	else expandedCards.value.add(sheetId);
};

const isCardExpanded = (sheetId: number) => expandedCards.value.has(sheetId);

onMounted(() => {
	fetchSheets();
});
</script>

<template>
	<div class="pb-16">
		<SectionHeader
			eyebrow="Compute · Mortgage"
			title="Run the mortgage, line by line."
			description="Principal, interest, escrow, extra payments. The full cost of any home loan, before you sign."
			:icon="HomeModernIcon"
			:index="sheets.length || 0"
		>
			<template #actions>
				<RouterLink
					to="/estimates/mortgage/create"
					class="group inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
				>
					<PlusIcon class="h-4 w-4" />
					New estimate
				</RouterLink>
			</template>
		</SectionHeader>

		<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
			<div v-if="loading" class="flex items-center justify-center py-20">
				<Spinner size="lg" color="accent" />
			</div>

			<section
				v-else-if="!sheets.length"
				class="surface-ink paper-grain rounded-md border border-primary-dark/40 p-10 sm:p-14 relative overflow-hidden"
			>
				<div class="grid grid-cols-12 gap-6 items-center relative z-10">
					<div class="col-span-12 lg:col-span-8">
						<p class="eyebrow text-white/60 mb-4">No estimates yet</p>
						<h2 class="font-display font-medium text-white tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
							Open a sheet. <span class="italic text-signal-light">Run any mortgage through it.</span>
						</h2>
						<p class="mt-5 text-sm text-white/70 max-w-md">
							Property value, down payment, rate. We&rsquo;ll do the math you&rsquo;d otherwise have to ask the lender
							for.
						</p>
					</div>
					<div class="col-span-12 lg:col-span-4 lg:text-right">
						<RouterLink
							to="/estimates/mortgage/create"
							class="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 bg-surface text-primary text-sm font-medium hover:bg-tan transition-colors"
						>
							<PlusIcon class="h-4 w-4" />
							Create first estimate
						</RouterLink>
					</div>
				</div>
			</section>

			<div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<article v-for="sheet in sheets" :key="sheet.id" class="card h-full overflow-hidden flex flex-col group">
					<div class="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
						<span class="eyebrow text-[0.625rem]!">{{ sheet.property_type || 'House' }}</span>
						<div class="flex items-center gap-0.5" @click.stop>
							<button
								class="p-1.5 rounded-sm text-text-muted hover:text-primary hover:bg-surface-dark transition-colors"
								:title="isCardExpanded(sheet.id) ? 'Show less' : 'Show more'"
								@click="toggleCardDetails(sheet.id)"
							>
								<ChevronDownIcon
									:class="['h-3.5 w-3.5 transition-transform', isCardExpanded(sheet.id) && 'rotate-180']"
								/>
							</button>
							<button
								class="p-1.5 rounded-sm text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
								title="Delete estimate"
								@click="openDeleteDialog(sheet)"
							>
								<TrashIcon class="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					<RouterLink :to="`/estimates/mortgage/${sheet.id}/edit`" class="flex-1 flex flex-col p-4">
						<p class="eyebrow mb-2">{{ getDisplayTitle(sheet) }}</p>

						<h3
							class="font-display text-2xl text-primary tracking-tight leading-tight group-hover:text-accent-dark transition-colors"
						>
							${{ formatCurrency(sheet.property_value || 0) }}
						</h3>

						<div class="mt-6 flex items-baseline justify-between">
							<div>
								<p class="eyebrow mb-1.5">Monthly</p>
								<p class="figure text-4xl text-primary leading-none">
									${{ formatCurrency(getSheetCalculations(sheet).monthlyTotal) }}
								</p>
								<p class="numeral text-xs text-text-muted mt-1">
									${{ formatCurrency(getSheetCalculations(sheet).monthlyPI) }} P&amp;I
								</p>
							</div>
							<div class="text-right">
								<p class="numeral text-xs text-text-muted">{{ sheet.loan_term_years || 0 }} yr</p>
								<p class="numeral text-xs text-text-muted">@ {{ sheet.interest_rate || 0 }}%</p>
							</div>
						</div>

						<div v-if="isCardExpanded(sheet.id)" class="mt-5 pt-5 border-t border-border space-y-3 text-sm" @click.stop>
							<div class="grid grid-cols-2 gap-x-4 gap-y-3">
								<div>
									<p class="eyebrow text-[0.625rem]!">Property</p>
									<p class="numeral text-primary">${{ formatCurrency(sheet.property_value || 0) }}</p>
								</div>
								<div>
									<p class="eyebrow text-[0.625rem]!">Down</p>
									<p class="numeral text-primary">${{ formatCurrency(sheet.down_payment || 0) }}</p>
								</div>
								<div>
									<p class="eyebrow text-[0.625rem]!">Principal</p>
									<p class="numeral text-primary">${{ formatCurrency(getSheetCalculations(sheet).principal) }}</p>
								</div>
								<div>
									<p class="eyebrow text-[0.625rem]!">Total interest</p>
									<p class="numeral text-warning">${{ formatCurrency(getSheetCalculations(sheet).totalInterest) }}</p>
								</div>
							</div>
						</div>

						<div class="mt-auto pt-4 flex items-center justify-between text-xs">
							<span class="numeral text-text-muted">
								${{ formatCurrency(getSheetCalculations(sheet).principal) }} financed
							</span>
							<span
								class="inline-flex items-center gap-1 font-medium text-primary group-hover:text-accent-dark transition-colors"
							>
								Open <ArrowUpRightIcon class="h-3 w-3" />
							</span>
						</div>
					</RouterLink>
				</article>

				<RouterLink
					to="/estimates/mortgage/create"
					class="group flex flex-col items-center justify-center min-h-[260px] rounded-md border border-dashed border-border-strong text-center p-6 hover:border-primary hover:bg-surface transition-colors"
				>
					<div class="w-12 h-12 rounded-md bg-primary text-surface flex items-center justify-center mb-3">
						<PlusIcon class="h-5 w-5" />
					</div>
					<p class="font-display text-lg text-primary tracking-tight">New estimate</p>
					<p class="text-xs text-text-muted mt-1">Run another set of numbers</p>
				</RouterLink>
			</div>
		</main>

		<ConfirmDialog
			:show="showDeleteDialog"
			title="Delete Estimate"
			:message="`Are you sure you want to delete '${selectedSheet ? getDisplayTitle(selectedSheet) : 'this estimate'}'? This action cannot be undone.`"
			confirm-text="Delete"
			variant="danger"
			:loading="actionLoading"
			@confirm="confirmDelete"
			@close="showDeleteDialog = false"
		/>
	</div>
</template>
