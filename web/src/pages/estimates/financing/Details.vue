<script setup lang="ts">
import { ArrowLeftIcon, BanknotesIcon, CalculatorIcon } from '@heroicons/vue/24/outline';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { financeApi } from '@/api/finance';
import DealGradeCard from '@/components/DealGradeCard.vue';
import AdvancedCalculations from '@/components/Finance/AdvancedCalculations.vue';
import AmortizationTable from '@/components/Finance/AmortizationTable.vue';
import ExtraPayments from '@/components/Finance/ExtraPayments.vue';
import PaymentCharts from '@/components/Finance/PaymentCharts.vue';
import FinanceForm from '@/components/FinanceForm.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Spinner from '@/components/Spinner.vue';
import { useAuthStore } from '@/stores/auth';
import type { FinanceFormData, FormErrors } from '@/types';
import { VehicleType } from '@/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const isEdit = computed(() => !!route.params.id);
const sheetId = computed(() => route.params.id as string);

const form = ref<FinanceFormData>({
	sheet_name: '',
	sales_consultant: '',
	dealership_name: '',
	vehicle_type: VehicleType.CAR,
	vehicle_year: '',
	vehicle_make: '',
	vehicle_model: '',
	vehicle_trim: '',
	msrp: '',
	fees: '',
	discounts: '',
	rebates: '',
	down_payment: '',
	sales_tax_percent: '',
	interest_rate: '',
	finance_term: '',
	start_date: '',
	contact_email: '',
	contact_phone: '',
	extra_payments_json: '',
	notes: '',
});

const loading = ref(false);
const loadingSheet = ref(false);
const errors = ref<FormErrors>({});
const networkError = ref('');

const vehicleTitle = computed(() => {
	const parts = [
		form.value.vehicle_year,
		form.value.vehicle_make,
		form.value.vehicle_model,
		form.value.vehicle_trim,
	].filter(part => part && String(part).trim());
	return parts.length > 0 ? parts.join(' ') : 'Finance Estimate';
});

const headerTitle = computed(() => {
	return isEdit.value ? vehicleTitle.value : 'New finance estimate.';
});

const headerEyebrow = computed(() => {
	return isEdit.value ? 'Compute · Financing · Edit' : 'Compute · Financing · New';
});

const headerDescription = computed(() => {
	return isEdit.value
		? 'Refine the numbers behind this offer. Changes save when you click update.'
		: 'Run any financing offer through the math. APR, amortization, total interest, all in one sheet.';
});

const loadSheet = async () => {
	if (!isEdit.value) return;

	loadingSheet.value = true;
	try {
		const sheet = await financeApi.get(sheetId.value);
		Object.assign(form.value, sheet);
	} catch (error) {
		console.error('Error loading sheet:', error);
		router.push('/estimates/financing');
	} finally {
		loadingSheet.value = false;
	}
};

const submitForm = async () => {
	loading.value = true;
	errors.value = {};
	networkError.value = '';

	try {
		if (isEdit.value) {
			await financeApi.update(sheetId.value, form.value);
		} else {
			await financeApi.create(form.value);
		}
		router.push('/estimates/financing');
	} catch (error: any) {
		if (error.response?.data?.errors) {
			errors.value = error.response.data.errors;
		} else {
			networkError.value = 'Something went wrong. Please check your connection and try again.';
		}
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadSheet();
});
</script>

<template>
	<div class="pb-16">
		<!-- Loading state for edit-mode initial fetch -->
		<div v-if="loadingSheet" class="flex items-center justify-center py-32">
			<Spinner size="lg" color="accent" />
		</div>

		<template v-else>
			<!-- Editorial breadcrumb -->
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
				<RouterLink
					to="/estimates/financing"
					class="inline-flex items-center gap-1.5 text-xs eyebrow hover:text-primary transition-colors"
				>
					<ArrowLeftIcon class="h-3 w-3" />
					All finance estimates
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
				:icon="BanknotesIcon"
				variant="compact"
			>
				<template v-if="isEdit" #actions>
					<button
						:disabled="loading"
						:class="[
							'inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
							loading ? 'bg-tan text-text-muted cursor-not-allowed' : 'bg-primary hover:bg-primary-light text-surface',
						]"
						@click="submitForm"
					>
						<Spinner v-if="loading" size="sm" color="white" />
						<CalculatorIcon v-else class="h-4 w-4" />
						{{ loading ? 'Saving…' : 'Save changes' }}
					</button>
				</template>
			</SectionHeader>

			<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
				<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
					<!-- Main column -->
					<div class="order-2 lg:order-1 grid grid-cols-1 gap-4 lg:col-span-2">
						<FinanceForm
							:form="form"
							:errors="errors"
							:loading="loading"
							:title="headerTitle"
							back-url="/estimates/financing"
							:is-edit="isEdit"
							@submit="submitForm"
						/>

						<ExtraPayments v-model="form.extra_payments_json" :data="form" />
						<AmortizationTable :data="form" />
						<PaymentCharts :data="form" />
					</div>

					<!-- Right sidebar -->
					<aside class="order-1 lg:order-2 lg:sticky lg:top-20 space-y-4">
						<AdvancedCalculations :data="form" />
						<DealGradeCard v-if="isAdmin" agent-slug="deal-grade-finance" calculator-type="finance" :inputs="form" />
					</aside>
				</div>
			</main>
		</template>
	</div>
</template>
