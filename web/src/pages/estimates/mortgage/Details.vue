<script setup lang="ts">
import { ArrowLeftIcon, CalculatorIcon, HomeModernIcon } from '@heroicons/vue/24/outline';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
import type { MortgageFormData, FormErrors } from '@/types';
import { PropertyType } from '@/types';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const sheetId = computed(() => route.params.id as string);

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

const loading = ref(false);
const loadingSheet = ref(false);
const errors = ref<FormErrors>({});

const propertyTitle = computed(() => {
	return form.value.property_address || form.value.sheet_name || 'Mortgage estimate';
});

const headerTitle = computed(() => (isEdit.value ? propertyTitle.value : 'New mortgage estimate.'));
const headerEyebrow = computed(() =>
	isEdit.value ? 'Compute · Mortgage · Edit' : 'Compute · Mortgage · New'
);
const headerDescription = computed(() =>
	isEdit.value
		? 'Refine the numbers behind this loan. Changes save when you click update.'
		: 'Run any mortgage through the math. Principal, escrow, extra payments, the term reduction. All in one sheet.'
);

const loadSheet = async () => {
	if (!isEdit.value) return;
	loadingSheet.value = true;
	try {
		const sheet = await mortgageApi.get(sheetId.value);
		Object.assign(form.value, sheet);
	} catch (error) {
		console.error('Error loading sheet:', error);
		router.push('/estimates/mortgage');
	} finally {
		loadingSheet.value = false;
	}
};

const submitForm = async () => {
	loading.value = true;
	errors.value = {};

	try {
		if (isEdit.value) {
			await mortgageApi.update(sheetId.value, form.value);
		} else {
			await mortgageApi.create(form.value);
		}
		router.push('/estimates/mortgage');
	} catch (error: any) {
		if (error.response?.data?.errors) {
			errors.value = error.response.data.errors;
		} else {
			console.error(`Error ${isEdit.value ? 'updating' : 'creating'} mortgage sheet:`, error);
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
		<div v-if="loadingSheet" class="flex items-center justify-center py-32">
			<Spinner size="lg" color="accent" />
		</div>

		<template v-else>
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
				<RouterLink
					to="/estimates/mortgage"
					class="inline-flex items-center gap-1.5 text-xs eyebrow hover:text-primary transition-colors"
				>
					<ArrowLeftIcon class="h-3 w-3" />
					All mortgage estimates
				</RouterLink>
			</div>

			<SectionHeader
				:eyebrow="headerEyebrow"
				:title="headerTitle"
				:description="headerDescription"
				:icon="HomeModernIcon"
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
					<div class="order-2 lg:order-1 grid grid-cols-1 gap-4 lg:col-span-2">
						<MortgageForm :form="form" :errors="errors" />

						<RecurringExpenses :form="form" :errors="errors" />
						<ExtraExpenses v-model="form.extra_expenses_json" />
						<ExtraPayments v-model="form.extra_payments_json" :data="form" />
						<AmortizationTable :data="form" />
						<PaymentCharts :data="form" />

						<!-- Submit/cancel at the very bottom -->
						<div v-if="!isEdit" class="flex items-center justify-end gap-3 pt-2">
							<RouterLink
								to="/estimates/mortgage"
								class="px-5 py-2.5 rounded-md text-sm font-medium text-text-muted hover:text-primary hover:bg-tan/50 transition-colors"
							>
								Cancel
							</RouterLink>
							<button
								type="button"
								:disabled="loading"
								:class="[
									'inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors',
									loading
										? 'bg-tan text-text-muted cursor-not-allowed'
										: 'bg-primary hover:bg-primary-light text-surface',
								]"
								@click="submitForm"
							>
								<Spinner v-if="loading" size="sm" color="white" />
								<CalculatorIcon v-else class="h-4 w-4" />
								{{ loading ? 'Creating…' : 'Create mortgage estimate' }}
							</button>
						</div>
					</div>

					<aside class="order-1 lg:order-2 lg:sticky lg:top-20 space-y-4">
						<AdvancedCalculations :data="form" />
					</aside>
				</div>
			</main>
		</template>
	</div>
</template>
