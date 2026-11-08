<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import AddOnsEditor from '@/components/Lease/AddOnsEditor.vue';
import FeeField from '@/components/Lease/FeeField.vue';
import MaskedNumberInput from '@/components/MaskedNumberInput.vue';
import { FormErrors, LeaseFormData, leaseTaxMethodOptions, vehicleTypeOptions } from '@/types';
import { formatCurrency, parseOrZero } from '@/utils/formatters';

import FormField from './FormField.vue';

defineProps<{
	errors: FormErrors;
}>();

// The parent owns the sheet; fields bind straight to it through v-model:form.
const form = defineModel<LeaseFormData>('form', { required: true });

defineEmits<{
	submit: [];
}>();

const isSet = (value: unknown) => value !== null && value !== undefined && value !== '';

const msrp = computed(() => parseOrZero(form.value.msrp));

/*
 * The residual can be entered in dollars, as contracts print it, or as a
 * percent of MSRP, as rate sheets quote it. In dollars, residual_amount is the
 * figure and residual_percent is kept in step for the lists that show it; as a
 * percent, residual_amount is cleared so the calculator follows MSRP.
 */
const residualMode = ref<'dollar' | 'percent'>('percent');

watch(
	() => form.value.residual_amount,
	value => {
		if (isSet(value)) residualMode.value = 'dollar';
	},
	{ immediate: true }
);

const residualFromPercent = computed(() => msrp.value * (parseOrZero(form.value.residual_percent) / 100));
const residualAsPercent = computed(() =>
	msrp.value > 0 ? (parseOrZero(form.value.residual_amount) / msrp.value) * 100 : 0
);

const syncResidualPercent = () => {
	if (residualMode.value !== 'dollar' || msrp.value <= 0 || !isSet(form.value.residual_amount)) return;
	// Only when it has moved, so opening a saved sheet does not count as an edit.
	if (Math.abs(parseOrZero(form.value.residual_percent) - residualAsPercent.value) > 0.00005) {
		form.value.residual_percent = residualAsPercent.value.toFixed(4);
	}
};

watch(() => [form.value.residual_amount, form.value.msrp], syncResidualPercent);

const setResidualMode = (mode: 'dollar' | 'percent') => {
	if (mode === residualMode.value) return;

	if (mode === 'dollar') {
		form.value.residual_amount = residualFromPercent.value ? residualFromPercent.value.toFixed(2) : '';
	} else {
		if (isSet(form.value.residual_amount) && msrp.value > 0) {
			form.value.residual_percent = residualAsPercent.value.toFixed(4);
		}
		form.value.residual_amount = '';
	}
	residualMode.value = mode;
};

const agreedValueHelp = computed(() => {
	const agreed = parseOrZero(form.value.agreed_value);
	if (!msrp.value || !isSet(form.value.agreed_value)) return 'The selling price on the contract - often below MSRP.';
	const discount = msrp.value - agreed;
	return discount >= 0 ? `$${formatCurrency(discount)} below MSRP` : `$${formatCurrency(-discount)} above MSRP`;
});

const aprHelp = computed(() => {
	const mf = parseOrZero(form.value.money_factor);
	return mf > 0 ? `About ${(mf * 2400).toFixed(2)}% APR` : 'Multiply by 2,400 to compare it with an APR.';
});

const netTradeIn = computed(() => parseOrZero(form.value.trade_in) - parseOrZero(form.value.trade_in_payoff));
const hasTradeIn = computed(() => isSet(form.value.trade_in) || isSet(form.value.trade_in_payoff));
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

		<!-- 04 · Price -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 04</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Price</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField
						v-model="form.msrp"
						name="msrp"
						label="MSRP"
						type="currency"
						help-text="The sticker price. The residual percent is figured from it."
						:error="errors.msrp"
					/>
					<FormField
						v-model="form.agreed_value"
						name="agreed_value"
						label="Agreed value of the vehicle"
						type="currency"
						:help-text="agreedValueHelp"
						:error="errors.agreed_value"
					/>
				</div>
			</div>
		</section>

		<!-- 05 · Added to the lease (gross capitalized cost) -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 05</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Taxes, fees &amp; add-ons</h3>
			</div>
			<div class="p-5 sm:p-6 space-y-6">
				<p class="text-sm text-text-muted -mt-1">
					What the contract lists in the gross capitalized cost. Mark a fee "At signing" if you pay it up front instead.
				</p>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FeeField
						v-model:amount="form.acquisition_fee"
						v-model:upfront="form.acquisition_fee_upfront"
						label="Acquisition fee"
						:error="errors.acquisition_fee"
					/>
					<FeeField
						v-model:amount="form.doc_fee"
						v-model:upfront="form.doc_fee_upfront"
						label="Documentation fee"
						:error="errors.doc_fee"
					/>
					<FeeField
						v-model:amount="form.title_registration_fees"
						v-model:upfront="form.title_registration_fees_upfront"
						label="Title, license &amp; registration"
						:error="errors.title_registration_fees"
					/>
					<FeeField
						v-model:amount="form.misc_fees"
						v-model:upfront="form.misc_fees_upfront"
						label="Other fees"
						:error="errors.misc_fees"
					/>
					<FormField
						v-model="form.capitalized_taxes"
						name="capitalized_taxes"
						label="Taxes rolled into the lease"
						type="currency"
						help-text="Upfront sales tax financed in the lease, where your state charges it that way."
						:error="errors.capitalized_taxes"
					/>
					<FormField
						v-model="form.prior_balance"
						name="prior_balance"
						label="Prior lease or loan balance"
						type="currency"
						help-text="Anything owed on a previous vehicle that is carried into this lease."
						:error="errors.prior_balance"
					/>
				</div>
				<AddOnsEditor v-model="form.add_ons_json" />
				<p v-if="errors.add_ons_json" class="text-xs text-danger">{{ errors.add_ons_json[0] }}</p>
			</div>
		</section>

		<!-- 06 · Cap cost reductions -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 06</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Down payment, rebates &amp; trade-in</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField
						v-model="form.down_payment"
						name="down_payment"
						label="Cash down"
						type="currency"
						help-text="Cash you pay to lower the capitalized cost."
						:error="errors.down_payment"
					/>
					<FormField
						v-model="form.lease_cash"
						name="lease_cash"
						label="Rebates &amp; incentives"
						type="currency"
						help-text="Lease cash and other credits applied to the capitalized cost."
						:error="errors.lease_cash"
					/>
					<FormField
						v-model="form.trade_in"
						name="trade_in"
						label="Trade-in allowance"
						type="currency"
						:error="errors.trade_in"
					/>
					<FormField
						v-model="form.trade_in_payoff"
						name="trade_in_payoff"
						label="Trade-in payoff"
						type="currency"
						help-text="What you still owe on the trade-in."
						:error="errors.trade_in_payoff"
					/>
				</div>
				<p v-if="hasTradeIn" class="numeral text-xs mt-3" :class="netTradeIn < 0 ? 'text-danger' : 'text-text-muted'">
					<template v-if="netTradeIn >= 0">Net trade-in: ${{ formatCurrency(netTradeIn) }} off the lease</template>
					<template v-else>Negative equity: ${{ formatCurrency(-netTradeIn) }} is added to the lease</template>
				</p>
			</div>
		</section>

		<!-- 07 · Lease Terms -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 07</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Lease terms</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<!-- Residual with dollar/percent toggle -->
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label class="block text-sm font-medium text-primary">Residual value</label>
							<div
								class="flex items-center gap-1 border border-border rounded-md p-0.5"
								role="group"
								aria-label="Residual in dollars or percent"
							>
								<button
									type="button"
									:aria-pressed="residualMode === 'dollar'"
									:class="[
										'px-2 py-0.5 text-[0.625rem] font-medium rounded-sm transition-colors',
										residualMode === 'dollar' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
									]"
									@click="setResidualMode('dollar')"
								>
									$
								</button>
								<button
									type="button"
									:aria-pressed="residualMode === 'percent'"
									:class="[
										'px-2 py-0.5 text-[0.625rem] font-medium rounded-sm transition-colors',
										residualMode === 'percent' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
									]"
									@click="setResidualMode('percent')"
								>
									%
								</button>
							</div>
						</div>

						<MaskedNumberInput
							v-if="residualMode === 'dollar'"
							v-model="form.residual_amount"
							prefix="$"
							placeholder="0.00"
							aria-label="Residual value in dollars"
							:error="!!errors.residual_amount"
						/>
						<MaskedNumberInput
							v-else
							v-model="form.residual_percent"
							suffix="%"
							placeholder="0.00"
							:decimals="2"
							aria-label="Residual value as a percent of MSRP"
							:error="!!errors.residual_percent"
						/>

						<p class="numeral text-xs text-text-muted mt-1">
							<template v-if="residualMode === 'dollar'">
								<template v-if="msrp > 0">= {{ residualAsPercent.toFixed(2) }}% of MSRP</template>
								<template v-else>Enter the MSRP to see it as a percent</template>
							</template>
							<template v-else>= ${{ formatCurrency(residualFromPercent) }}</template>
						</p>
						<p v-if="errors.residual_amount || errors.residual_percent" class="mt-1.5 text-xs text-danger">
							{{ (errors.residual_amount || errors.residual_percent)![0] }}
						</p>
					</div>

					<FormField
						v-model="form.money_factor"
						name="money_factor"
						label="Money factor"
						type="number"
						step="0.00001"
						:min="0"
						:max="1"
						:help-text="aprHelp"
						:error="errors.money_factor"
					/>
					<FormField
						v-model="form.lease_term"
						name="lease_term"
						label="Lease term (months)"
						type="number"
						:min="1"
						:max="120"
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

		<!-- 08 · Tax & signing -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 08</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Sales tax &amp; deposit</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField
						v-model="form.sales_tax_percent"
						name="sales_tax_percent"
						label="Sales tax rate"
						type="percentage"
						help-text="Also charged at signing on cash down and rebates."
						:error="errors.sales_tax_percent"
					/>
					<FormField
						v-model="form.tax_method"
						name="tax_method"
						label="How sales tax is charged"
						type="select"
						:options="leaseTaxMethodOptions"
						:help-text="
							form.tax_method === 'upfront'
								? 'Enter the tax amount under taxes rolled into the lease.'
								: 'Added to every monthly payment.'
						"
						:error="errors.tax_method"
					/>
					<FormField
						v-model="form.security_deposit"
						name="security_deposit"
						label="Security deposit"
						type="currency"
						help-text="Paid at signing and refunded at the end."
						:error="errors.security_deposit"
					/>
				</div>
			</div>
		</section>

		<!-- 09 · End of lease -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 09</span>
				<h3 class="font-display text-xl text-primary tracking-tight">End of lease</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField
						v-model="form.miles_per_year"
						name="miles_per_year"
						label="Miles per year"
						type="number"
						:min="0"
						:max="100000"
						:error="errors.miles_per_year"
					/>
					<FormField
						v-model="form.excess_mile_rate"
						name="excess_mile_rate"
						label="Charge per extra mile"
						type="currency"
						:error="errors.excess_mile_rate"
					/>
					<FormField
						v-model="form.purchase_option_fee"
						name="purchase_option_fee"
						label="Purchase option fee"
						type="currency"
						help-text="Added to the residual if you buy the vehicle at the end."
						:error="errors.purchase_option_fee"
					/>
					<FormField
						v-model="form.disposition_fee"
						name="disposition_fee"
						label="Turn-in fee"
						type="currency"
						help-text="Charged if you return the vehicle instead of buying it."
						:error="errors.disposition_fee"
					/>
				</div>
			</div>
		</section>

		<!-- 10 · Notes -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 10</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Notes</h3>
			</div>
			<div class="p-5 sm:p-6">
				<FormField v-model="form.notes" name="notes" label="Notes" type="textarea" :error="errors.notes" />
			</div>
		</section>
	</form>
</template>
