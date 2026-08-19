<script setup lang="ts">
import {
	ArrowUpRightIcon,
	BanknotesIcon,
	BookOpenIcon,
	ChevronDownIcon,
	PlusIcon,
	ScaleIcon,
	TrashIcon,
} from '@heroicons/vue/24/outline';
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { financeApi } from '@/api/finance';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Spinner from '@/components/Spinner.vue';
import type { VehicleFinanceSheet } from '@/types/models';
import { FinanceCalculator } from '@/utils/financeCalculator';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();

const vehicleFinanceSheets = ref<VehicleFinanceSheet[]>([]);
const loading = ref(true);
const expandedCards = ref<Set<number>>(new Set());
const selectedSheets = ref<Set<number>>(new Set());

// Confirmation dialog state
const showDeleteDialog = ref(false);
const selectedSheet = ref<VehicleFinanceSheet | null>(null);
const actionLoading = ref(false);

const fetchSheets = async () => {
	try {
		const data = await financeApi.getAll();
		vehicleFinanceSheets.value = data;
	} catch (error) {
		console.error('Error fetching finance sheets:', error);
	} finally {
		loading.value = false;
	}
};

const openDeleteDialog = (sheet: VehicleFinanceSheet) => {
	selectedSheet.value = sheet;
	showDeleteDialog.value = true;
};

const confirmDelete = async () => {
	if (!selectedSheet.value) return;
	actionLoading.value = true;
	try {
		await financeApi.delete(selectedSheet.value.id);
		await fetchSheets();
		showDeleteDialog.value = false;
		selectedSheet.value = null;
	} catch (error) {
		console.error('Error deleting sheet:', error);
	} finally {
		actionLoading.value = false;
	}
};

const getSheetCalculations = (sheet: VehicleFinanceSheet) => {
	try {
		const calculator = new FinanceCalculator(sheet as any);
		const summary = calculator.getSummary();
		return {
			monthlyPayment: summary?.monthlyPayment || 0,
			totalInterest: summary?.interestAmount || 0,
			loanAmount: summary?.loanAmount || 0,
			purchasePrice: summary?.purchasePrice || 0,
		};
	} catch {
		return {
			monthlyPayment: 0,
			totalInterest: 0,
			loanAmount: 0,
			purchasePrice: 0,
		};
	}
};

const getVehicleTitle = (sheet: VehicleFinanceSheet) => {
	const parts = [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model, sheet.vehicle_trim].filter(
		part => part && part.toString().trim()
	);
	return parts.length > 0 ? parts.join(' ') : 'Vehicle';
};

const toggleCardDetails = (sheetId: number) => {
	if (expandedCards.value.has(sheetId)) {
		expandedCards.value.delete(sheetId);
	} else {
		expandedCards.value.add(sheetId);
	}
};

const isCardExpanded = (sheetId: number) => {
	return expandedCards.value.has(sheetId);
};

const toggleSelection = (sheetId: number) => {
	if (selectedSheets.value.has(sheetId)) {
		selectedSheets.value.delete(sheetId);
	} else {
		selectedSheets.value.add(sheetId);
	}
};

const isSelected = (sheetId: number) => {
	return selectedSheets.value.has(sheetId);
};

const startComparison = () => {
	if (selectedSheets.value.size >= 2) {
		const sheetIds = Array.from(selectedSheets.value).join(',');
		router.push(`/estimates/financing/compare?sheets=${sheetIds}`);
	}
};

onMounted(() => {
	fetchSheets();
});
</script>

<template>
	<div class="pb-16">
		<SectionHeader
			eyebrow="Compute · Financing"
			title="Run the loan, line by line."
			description="Monthly payment, total interest, amortization. The full cost of every offer, before you sign anything."
			:icon="BanknotesIcon"
			:index="vehicleFinanceSheets.length || 0"
		>
			<template #aside>
				<div class="mt-4 flex items-center gap-2">
					<RouterLink
						to="/learning/financing"
						class="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-accent-dark transition-colors"
					>
						<BookOpenIcon class="h-3.5 w-3.5" />
						Read the financing guide
					</RouterLink>
				</div>
			</template>

			<template #actions>
				<button
					v-if="selectedSheets.size >= 2"
					class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-signal text-white text-sm font-medium hover:bg-signal-dark transition-colors"
					@click="startComparison"
				>
					<ScaleIcon class="h-4 w-4" />
					Compare ({{ selectedSheets.size }})
				</button>
				<RouterLink
					to="/estimates/financing/create"
					class="group inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
				>
					<PlusIcon class="h-4 w-4" />
					New estimate
				</RouterLink>
			</template>
		</SectionHeader>

		<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
			<!-- Loading -->
			<div v-if="loading" class="flex items-center justify-center py-20">
				<Spinner size="lg" color="accent" />
			</div>

			<!-- Empty State -->
			<section
				v-else-if="!vehicleFinanceSheets.length"
				class="surface-ink paper-grain rounded-md border border-primary-dark/40 p-10 sm:p-14 relative overflow-hidden"
			>
				<div class="grid grid-cols-12 gap-6 items-center relative z-10">
					<div class="col-span-12 lg:col-span-8">
						<p class="eyebrow text-white/60 mb-4">No estimates yet</p>
						<h2 class="font-display font-medium text-white tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
							Open a sheet. <span class="italic text-signal-light">Run any offer through it.</span>
						</h2>
						<p class="mt-5 text-sm text-white/70 max-w-md">
							Enter MSRP, term, rate, and fees. We&rsquo;ll do the math the dealer hopes you won&rsquo;t.
						</p>
					</div>
					<div class="col-span-12 lg:col-span-4 lg:text-right">
						<RouterLink
							to="/estimates/financing/create"
							class="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 bg-surface text-primary text-sm font-medium hover:bg-tan transition-colors"
						>
							<PlusIcon class="h-4 w-4" />
							Create first estimate
						</RouterLink>
					</div>
				</div>
			</section>

			<!-- Sheets Grid -->
			<div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<article
					v-for="sheet in vehicleFinanceSheets"
					:key="sheet.id"
					class="card h-full overflow-hidden flex flex-col group"
				>
					<!-- Header strip -->
					<div class="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
						<label class="flex items-center gap-2 cursor-pointer select-none" @click.stop>
							<input
								type="checkbox"
								:checked="isSelected(sheet.id)"
								class="w-3.5 h-3.5 text-primary border-2 border-border rounded-sm focus:ring-0 focus:outline-none bg-surface cursor-pointer"
								@change="toggleSelection(sheet.id)"
							/>
							<span class="eyebrow !text-[0.625rem]" :class="isSelected(sheet.id) ? 'text-primary' : ''">
								Compare
							</span>
						</label>
						<div class="flex items-center gap-0.5" @click.stop>
							<button
								class="p-1.5 rounded text-text-muted hover:text-primary hover:bg-surface-dark transition-colors"
								:title="isCardExpanded(sheet.id) ? 'Show less' : 'Show more'"
								@click="toggleCardDetails(sheet.id)"
							>
								<ChevronDownIcon
									:class="['h-3.5 w-3.5 transition-transform', isCardExpanded(sheet.id) && 'rotate-180']"
								/>
							</button>
							<button
								class="p-1.5 rounded text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
								title="Delete estimate"
								@click="openDeleteDialog(sheet)"
							>
								<TrashIcon class="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					<RouterLink :to="`/estimates/financing/${sheet.id}/edit`" class="flex-1 flex flex-col p-4">
						<!-- Vehicle metadata -->
						<p class="eyebrow mb-2">{{ sheet.dealership_name || 'No dealership' }}</p>

						<h3
							class="font-display text-2xl text-primary tracking-tight leading-tight group-hover:text-accent-dark transition-colors"
						>
							<span class="numeral text-base text-text-muted/80 mr-1">{{ sheet.vehicle_year || '·' }}</span>
							{{ sheet.vehicle_make }}
							<span class="italic text-text-muted/80">{{ sheet.vehicle_model }}</span>
						</h3>

						<!-- Monthly payment hero figure -->
						<div class="mt-6 flex items-baseline justify-between">
							<div>
								<p class="eyebrow mb-1.5">Monthly</p>
								<p class="figure text-4xl text-primary leading-none">
									${{ formatCurrency(getSheetCalculations(sheet).monthlyPayment) }}
								</p>
							</div>
							<div class="text-right">
								<p class="numeral text-xs text-text-muted">{{ sheet.finance_term || 0 }} mo</p>
								<p class="numeral text-xs text-text-muted">@ {{ sheet.interest_rate || 0 }}%</p>
							</div>
						</div>

						<!-- Expanded -->
						<div v-if="isCardExpanded(sheet.id)" class="mt-5 pt-5 border-t border-border space-y-3 text-sm" @click.stop>
							<div class="grid grid-cols-2 gap-x-4 gap-y-3">
								<div>
									<p class="eyebrow !text-[0.625rem]">MSRP</p>
									<p class="numeral text-primary">${{ formatCurrency(sheet.msrp || 0) }}</p>
								</div>
								<div>
									<p class="eyebrow !text-[0.625rem]">Purchase</p>
									<p class="numeral text-primary">${{ formatCurrency(getSheetCalculations(sheet).purchasePrice) }}</p>
								</div>
								<div>
									<p class="eyebrow !text-[0.625rem]">Down</p>
									<p class="numeral text-primary">${{ formatCurrency(sheet.down_payment || 0) }}</p>
								</div>
								<div>
									<p class="eyebrow !text-[0.625rem]">Financed</p>
									<p class="numeral text-primary">${{ formatCurrency(getSheetCalculations(sheet).loanAmount) }}</p>
								</div>
							</div>
							<div class="bg-tan/60 border border-border rounded-md px-3 py-2 flex items-center justify-between">
								<span class="eyebrow">Total interest</span>
								<span class="numeral text-warning"
									>${{ formatCurrency(getSheetCalculations(sheet).totalInterest) }}</span
								>
							</div>
						</div>

						<div class="mt-auto pt-4 flex items-center justify-between text-xs">
							<span class="numeral text-text-muted">
								${{ formatCurrency(getSheetCalculations(sheet).loanAmount) }} financed
							</span>
							<span
								class="inline-flex items-center gap-1 font-medium text-primary group-hover:text-accent-dark transition-colors"
							>
								Open <ArrowUpRightIcon class="h-3 w-3" />
							</span>
						</div>
					</RouterLink>
				</article>

				<!-- Add New Card -->
				<RouterLink
					to="/estimates/financing/create"
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

		<!-- Delete Confirmation Dialog -->
		<ConfirmDialog
			:show="showDeleteDialog"
			title="Delete Estimate"
			:message="`Are you sure you want to delete the estimate for '${selectedSheet ? getVehicleTitle(selectedSheet) : 'this vehicle'}'? This action cannot be undone.`"
			confirm-text="Delete"
			variant="danger"
			:loading="actionLoading"
			@confirm="confirmDelete"
			@close="showDeleteDialog = false"
		/>
	</div>
</template>
