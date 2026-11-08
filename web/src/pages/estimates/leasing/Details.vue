<script setup lang="ts">
import { ArrowLeftIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';

import { leaseApi } from '@/api/lease';
import DealGradeCard from '@/components/DealGradeCard.vue';
import AdvancedCalculations from '@/components/Lease/AdvancedCalculations.vue';
import BuyoutAnalysis from '@/components/Lease/BuyoutAnalysis.vue';
import PaymentAnalysis from '@/components/Lease/PaymentAnalysis.vue';
import LeaseForm from '@/components/LeaseForm.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Spinner from '@/components/Spinner.vue';
import StickySaveBar from '@/components/StickySaveBar.vue';
import { useEstimateAccess } from '@/composables/useEstimateAccess';
import { useSheetEditor } from '@/composables/useSheetEditor';
import { useAuthStore } from '@/stores/auth';
import type { LeaseFormData } from '@/types';
import { VehicleType } from '@/types';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const { isAuthenticated, backUrl, backLabel, ensureAccount } = useEstimateAccess({
	savedListPath: '/estimates/leasing',
	savedListLabel: 'All lease estimates',
});

const form = ref<LeaseFormData>({
	sheet_name: '',
	sales_consultant: '',
	dealership_name: '',
	vehicle_type: VehicleType.CAR,
	vehicle_year: '',
	vehicle_make: '',
	vehicle_model: '',
	vehicle_trim: '',
	msrp: '',
	agreed_value: '',
	residual_amount: '',
	residual_percent: '',
	money_factor: '',
	lease_term: '',
	down_payment: '',
	acquisition_fee: '',
	acquisition_fee_upfront: false,
	dealer_contribution: '',
	trade_in: '',
	trade_in_payoff: '',
	doc_fee: '',
	doc_fee_upfront: false,
	title_registration_fees: '',
	title_registration_fees_upfront: false,
	misc_fees: '',
	misc_fees_upfront: false,
	capitalized_taxes: '',
	prior_balance: '',
	add_ons_json: null,
	lease_cash: '',
	sales_tax_percent: '',
	tax_method: 'monthly',
	security_deposit: '',
	purchase_option_fee: '',
	disposition_fee: '',
	miles_per_year: '',
	excess_mile_rate: '',
	start_date: '',
	contact_email: '',
	contact_phone: '',
	notes: '',
});

const { isEdit, saving, loadingSheet, errors, networkError, savedAt, dirty, save } = useSheetEditor({
	form,
	api: leaseApi,
	listPath: '/estimates/leasing',
	editRouteName: 'estimates.leasing.edit',
	ensureAccount,
});

const vehicleTitle = computed(() => {
	const parts = [
		form.value.vehicle_year,
		form.value.vehicle_make,
		form.value.vehicle_model,
		form.value.vehicle_trim,
	].filter(part => part && String(part).trim());
	return parts.length > 0 ? parts.join(' ') : 'Lease Estimate';
});

const headerTitle = computed(() => {
	return isEdit.value ? vehicleTitle.value : 'New lease estimate.';
});

const headerEyebrow = computed(() => {
	return isEdit.value ? 'Compute · Leasing · Edit' : 'Compute · Leasing · New';
});

const headerDescription = computed(() => {
	return isEdit.value
		? 'Refine the numbers behind this lease. Save from the bar at the bottom of the screen.'
		: 'Run a lease offer through the math. Money factor, residual, total cost, all in one sheet.';
});
</script>

<template>
	<div>
		<!-- Loading state for edit-mode initial fetch -->
		<div v-if="loadingSheet" class="flex items-center justify-center py-32">
			<Spinner size="lg" color="accent" />
		</div>

		<template v-else>
			<!-- Editorial breadcrumb -->
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
				:icon="CurrencyDollarIcon"
				variant="compact"
			/>

			<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
				<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
					<!-- Main column -->
					<div class="order-2 lg:order-1 grid grid-cols-1 gap-4 lg:col-span-2">
						<LeaseForm v-model:form="form" :errors="errors" @submit="save" />

						<PaymentAnalysis :data="form" />
						<BuyoutAnalysis :data="form" />
					</div>

					<!-- Right sidebar -->
					<aside class="order-1 lg:order-2 lg:sticky lg:top-20 space-y-4">
						<AdvancedCalculations :data="form" />
						<DealGradeCard v-if="isAdmin" agent-slug="deal-grade-lease" calculator-type="lease" :inputs="form" />
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
