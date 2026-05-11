<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { financeApi } from '@/api/finance';
import PageHeader from '@/components/PageHeader.vue';
import { FinanceCalculator } from '@/utils/financeCalculator';
import { formatCurrency } from '@/utils/formatters';

const route = useRoute();

const sheets = ref<any[]>([]);
const loading = ref(true);

const loadSheets = async () => {
	const sheetIds = (route.query.sheets as string)?.split(',') || [];
	if (sheetIds.length < 2) return;

	try {
		const loadedSheets = await Promise.all(sheetIds.map(id => financeApi.get(id)));
		sheets.value = loadedSheets;
	} catch (error) {
		console.error('Error loading sheets:', error);
	} finally {
		loading.value = false;
	}
};

const getCalculations = (sheet: any) => {
	try {
		const calculator = new FinanceCalculator(sheet);
		const summary = calculator.getSummary();
		return {
			monthlyPayment: summary?.monthlyPayment || 0,
			totalInterest: summary?.interestAmount || 0,
			loanAmount: summary?.loanAmount || 0,
			totalCost: summary?.totalCost || 0,
		};
	} catch {
		return { monthlyPayment: 0, totalInterest: 0, loanAmount: 0, totalCost: 0 };
	}
};

const getVehicleTitle = (sheet: any) => {
	const parts = [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model, sheet.vehicle_trim].filter(Boolean);
	return parts.length > 0 ? parts.join(' ') : 'Vehicle';
};

onMounted(() => {
	loadSheets();
});
</script>

<template>
	<main class="py-12 flex-1">
		<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
			<!-- Header -->
			<PageHeader
				title="Compare Finance Estimates"
				description="Side-by-side comparison of your financing options"
				back-link="/estimates/financing"
				back-label="Finance Calculator"
			/>

			<!-- Loading -->
			<div v-if="loading" class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>

			<!-- Comparison Table -->
			<div v-else class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metric</th>
								<th
									v-for="sheet in sheets"
									:key="sheet.id"
									class="px-6 py-4 text-left text-sm font-semibold text-gray-900"
								>
									{{ getVehicleTitle(sheet) }}
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							<tr>
								<td class="px-6 py-4 text-sm text-gray-600">Monthly Payment</td>
								<td v-for="sheet in sheets" :key="sheet.id" class="px-6 py-4 text-sm font-bold text-green-600">
									${{ formatCurrency(getCalculations(sheet).monthlyPayment) }}
								</td>
							</tr>
							<tr class="bg-gray-50">
								<td class="px-6 py-4 text-sm text-gray-600">Loan Amount</td>
								<td v-for="sheet in sheets" :key="sheet.id" class="px-6 py-4 text-sm font-medium text-gray-900">
									${{ formatCurrency(getCalculations(sheet).loanAmount) }}
								</td>
							</tr>
							<tr>
								<td class="px-6 py-4 text-sm text-gray-600">Total Interest</td>
								<td v-for="sheet in sheets" :key="sheet.id" class="px-6 py-4 text-sm font-medium text-red-600">
									${{ formatCurrency(getCalculations(sheet).totalInterest) }}
								</td>
							</tr>
							<tr class="bg-gray-50">
								<td class="px-6 py-4 text-sm text-gray-600">Total Cost</td>
								<td v-for="sheet in sheets" :key="sheet.id" class="px-6 py-4 text-sm font-bold text-gray-900">
									${{ formatCurrency(getCalculations(sheet).totalCost) }}
								</td>
							</tr>
							<tr>
								<td class="px-6 py-4 text-sm text-gray-600">Interest Rate</td>
								<td v-for="sheet in sheets" :key="sheet.id" class="px-6 py-4 text-sm font-medium text-gray-900">
									{{ sheet.interest_rate || 0 }}%
								</td>
							</tr>
							<tr class="bg-gray-50">
								<td class="px-6 py-4 text-sm text-gray-600">Term</td>
								<td v-for="sheet in sheets" :key="sheet.id" class="px-6 py-4 text-sm font-medium text-gray-900">
									{{ sheet.finance_term || 0 }} months
								</td>
							</tr>
							<tr>
								<td class="px-6 py-4 text-sm text-gray-600">Down Payment</td>
								<td v-for="sheet in sheets" :key="sheet.id" class="px-6 py-4 text-sm font-medium text-gray-900">
									${{ formatCurrency(sheet.down_payment || 0) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</main>
</template>
