<script setup lang="ts">
import { CalculatorIcon } from '@heroicons/vue/24/outline';
import { RouterLink } from 'vue-router';

import { FormErrors, LeaseFormData, vehicleTypeOptions } from '@/types';

import FormField from './FormField.vue';
import Spinner from './Spinner.vue';

interface Props {
	form: LeaseFormData;
	errors: FormErrors;
	loading: boolean;
	title: string;
	backUrl: string;
	isEdit?: boolean;
	submitLabel?: string;
}

withDefaults(defineProps<Props>(), {
	isEdit: false,
	submitLabel: 'Create lease estimate',
});

defineEmits<{
	submit: [];
}>();
</script>

<template>
	<form class="space-y-4" @submit.prevent="$emit('submit')">
		<!-- 01 · Basic Information -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 01</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Basic information</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<FormField v-model="form.sheet_name" name="sheet_name" label="Estimate name" :error="errors.sheet_name" />
					<FormField
						v-model="form.dealership_name"
						name="dealership_name"
						label="Dealership"
						:error="errors.dealership_name"
					/>
					<FormField
						v-model="form.vehicle_type"
						name="vehicle_type"
						label="Vehicle type"
						type="select"
						:options="vehicleTypeOptions"
						:error="errors.vehicle_type"
					/>
				</div>
			</div>
		</section>

		<!-- 02 · Contact Information -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 02</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Contact information</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<FormField
						v-model="form.sales_consultant"
						name="sales_consultant"
						label="Sales consultant"
						:error="errors.sales_consultant"
					/>
					<FormField
						v-model="form.contact_email"
						name="contact_email"
						label="Contact email"
						type="email"
						:error="errors.contact_email"
					/>
					<FormField
						v-model="form.contact_phone"
						name="contact_phone"
						label="Contact phone"
						type="tel"
						:error="errors.contact_phone"
					/>
				</div>
			</div>
		</section>

		<!-- 03 · Vehicle Information -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 03</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Vehicle information</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField
						v-model="form.vehicle_year"
						name="vehicle_year"
						label="Year"
						type="number"
						:min="1900"
						:max="2030"
						:error="errors.vehicle_year"
					/>
					<FormField v-model="form.vehicle_make" name="vehicle_make" label="Make" :error="errors.vehicle_make" />
					<FormField v-model="form.vehicle_model" name="vehicle_model" label="Model" :error="errors.vehicle_model" />
					<FormField v-model="form.vehicle_trim" name="vehicle_trim" label="Trim" :error="errors.vehicle_trim" />
				</div>
			</div>
		</section>

		<!-- 04 · Pricing -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 04</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Pricing</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField v-model="form.msrp" name="msrp" label="MSRP" type="currency" :error="errors.msrp" />
					<FormField
						v-model="form.dealer_contribution"
						name="dealer_contribution"
						label="Dealer contribution"
						type="currency"
						:error="errors.dealer_contribution"
					/>
					<FormField
						v-model="form.trade_in"
						name="trade_in"
						label="Trade-in value"
						type="currency"
						:error="errors.trade_in"
					/>
					<FormField
						v-model="form.doc_fee"
						name="doc_fee"
						label="Documentation fee"
						type="currency"
						:error="errors.doc_fee"
					/>
					<FormField
						v-model="form.acquisition_fee"
						name="acquisition_fee"
						label="Acquisition fee"
						type="currency"
						:error="errors.acquisition_fee"
					/>
					<FormField
						v-model="form.misc_fees"
						name="misc_fees"
						label="Miscellaneous fees"
						type="currency"
						:error="errors.misc_fees"
					/>
					<FormField
						v-model="form.lease_cash"
						name="lease_cash"
						label="Lease cash"
						type="currency"
						:error="errors.lease_cash"
					/>
					<FormField
						v-model="form.down_payment"
						name="down_payment"
						label="Down payment"
						type="currency"
						:error="errors.down_payment"
					/>
					<FormField
						v-model="form.sales_tax_percent"
						name="sales_tax_percent"
						label="Sales tax percent"
						type="percentage"
						:error="errors.sales_tax_percent"
					/>
				</div>
			</div>
		</section>

		<!-- 05 · Lease Terms -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 05</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Lease terms</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField
						v-model="form.money_factor"
						name="money_factor"
						label="Money factor"
						type="number"
						step="0.0001"
						:min="0"
						:max="1"
						:error="errors.money_factor"
					/>
					<FormField
						v-model="form.residual_percent"
						name="residual_percent"
						label="Residual percent"
						type="percentage"
						:error="errors.residual_percent"
					/>
					<FormField
						v-model="form.lease_term"
						name="lease_term"
						label="Lease term (months)"
						type="number"
						:min="1"
						:max="60"
						:error="errors.lease_term"
					/>
					<FormField
						name="start_date"
						label="Start date"
						type="date"
						:error="errors.start_date"
						:model-value="form.start_date ? form.start_date.substring(0, 10) : ''"
						@input="
							(event: any) => {
								form.start_date = event.target.value;
							}
						"
					/>
				</div>
			</div>
		</section>

		<!-- 06 · Notes -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 06</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Notes</h3>
			</div>
			<div class="p-5 sm:p-6">
				<FormField v-model="form.notes" name="notes" label="Notes" type="textarea" :error="errors.notes" />
			</div>
		</section>

		<!-- Submit -->
		<div class="flex items-center justify-end gap-3 pt-2">
			<RouterLink
				:to="backUrl"
				class="px-5 py-2.5 rounded-md text-sm font-medium text-text-muted hover:text-primary hover:bg-tan/50 transition-colors"
			>
				Cancel
			</RouterLink>
			<button
				type="submit"
				:disabled="loading"
				:class="[
					'inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors',
					loading ? 'bg-tan text-text-muted cursor-not-allowed' : 'bg-primary hover:bg-primary-light text-surface',
				]"
			>
				<Spinner v-if="loading" size="sm" color="white" />
				<CalculatorIcon v-else class="h-4 w-4" />
				{{ loading ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Update lease estimate' : submitLabel }}
			</button>
		</div>
	</form>
</template>
