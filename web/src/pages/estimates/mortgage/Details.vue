<script setup lang="ts">
import { ArrowLeftIcon, HomeModernIcon } from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';

import { mortgageApi } from '@/api/mortgage';
import AdvancedCalculations from '@/components/Mortgage/AdvancedCalculations.vue';
import AmortizationTable from '@/components/Mortgage/AmortizationTable.vue';
import ExtraExpenses from '@/components/Mortgage/ExtraExpenses.vue';
import ExtraPayments from '@/components/Mortgage/ExtraPayments.vue';
import PaymentCharts from '@/components/Mortgage/PaymentCharts.vue';
import RecurringExpenses from '@/components/Mortgage/RecurringExpenses.vue';
import MortgageForm from '@/components/MortgageForm.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Spinner from '@/components/Spinner.vue';
import StickySaveBar from '@/components/StickySaveBar.vue';
import { useEstimateAccess } from '@/composables/useEstimateAccess';
import { useSheetEditor } from '@/composables/useSheetEditor';
import type { MortgageFormData } from '@/types';
import { PropertyType } from '@/types';

const { isAuthenticated, backUrl, backLabel, ensureAccount } = useEstimateAccess({
	savedListPath: '/estimates/mortgage',
	savedListLabel: 'All mortgage estimates',
});

const form = ref<MortgageFormData>({
	sheet_name: '',
	property_address: '',
	property_type: PropertyType.HOUSE,
	property_value: '' as any,
	down_payment: '' as any,
	interest_rate: '' as any,
	loan_term_years: '' as any,
	start_date: '',
	monthly_hoa: '' as any,
	annual_insurance: '' as any,
	annual_property_tax: '' as any,
	extra_expenses_json: '',
	extra_payments_json: '',
	contact_email: '',
	contact_phone: '',
	notes: '',
});

const { isEdit, saving, loadingSheet, errors, networkError, savedAt, dirty, save } = useSheetEditor({
	form,
	api: mortgageApi,
	listPath: '/estimates/mortgage',
	editRouteName: 'estimates.mortgage.edit',
	ensureAccount,
});

const propertyTitle = computed(() => {
	return form.value.property_address || form.value.sheet_name || 'Mortgage estimate';
});

const headerTitle = computed(() => (isEdit.value ? propertyTitle.value : 'New mortgage estimate.'));
const headerEyebrow = computed(() => (isEdit.value ? 'Compute · Mortgage · Edit' : 'Compute · Mortgage · New'));
const headerDescription = computed(() =>
	isEdit.value
		? 'Refine the numbers behind this loan. Save from the bar at the bottom of the screen.'
		: 'Run any mortgage through the math. Principal, escrow, extra payments, the term reduction. All in one sheet.'
);
</script>

<template>
	<div>
		<div v-if="loadingSheet" class="flex items-center justify-center py-32">
			<Spinner size="lg" color="accent" />
		</div>

		<template v-else>
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
				<RouterLink
					:to="backUrl"
					class="inline-flex items-center gap-1.5 text-xs eyebrow hover:text-primary transition-colors"
				>
					<ArrowLeftIcon class="h-3 w-3" />
					{{ backLabel }}
				</RouterLink>
			</div>

			<div v-if="networkError" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
				<div class="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
					{{ networkError }}
				</div>
			</div>

			<SectionHeader
				:eyebrow="headerEyebrow"
				:title="headerTitle"
				:description="headerDescription"
				:icon="HomeModernIcon"
				variant="compact"
			/>

			<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
				<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
					<div class="order-2 lg:order-1 grid grid-cols-1 gap-4 lg:col-span-2">
						<MortgageForm :form="form" :errors="errors" />

						<RecurringExpenses :form="form" :errors="errors" />
						<ExtraExpenses v-model="form.extra_expenses_json" />
						<ExtraPayments v-model="form.extra_payments_json" :data="form" />
						<AmortizationTable :data="form" />
						<PaymentCharts :data="form" />
					</div>

					<aside class="order-1 lg:order-2 lg:sticky lg:top-20 space-y-4">
						<AdvancedCalculations :data="form" />
					</aside>
				</div>
			</main>
		</template>
		<StickySaveBar
			v-if="!loadingSheet"
			:dirty="dirty"
			:saving="saving"
			:is-edit="isEdit"
			:can-save="isAuthenticated"
			:saved-at="savedAt"
			:has-errors="Object.keys(errors).length > 0"
			:back-url="backUrl"
			:back-label="backLabel"
			@save="save"
		/>
	</div>
</template>
