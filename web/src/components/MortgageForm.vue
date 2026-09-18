<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import FormField from '@/components/FormField.vue';
import MaskedNumberInput from '@/components/MaskedNumberInput.vue';
import { FormErrors, MortgageFormData, propertyTypeOptions } from '@/types';
import { formatCurrency, parseOrZero } from '@/utils/formatters';

interface Props {
	form: MortgageFormData;
	errors: FormErrors;
}

const props = defineProps<Props>();

const downPaymentMode = ref<'dollar' | 'percent'>('dollar');
const downPaymentPercent = ref<string>('');

watch(
	() => [props.form.property_value, props.form.down_payment],
	() => {
		const pv = parseOrZero(props.form.property_value as any);
		const dp = parseOrZero(props.form.down_payment as any);
		downPaymentPercent.value = pv > 0 ? ((dp / pv) * 100).toFixed(2) : '';
	},
	{ immediate: true }
);

const principalDisplay = computed(() => {
	const pv = parseOrZero(props.form.property_value as any);
	const dp = parseOrZero(props.form.down_payment as any);
	return pv > 0 ? Math.max(0, pv - dp).toFixed(2) : '';
});

const onPrincipalUpdate = (val: string) => {
	const newPrincipal = parseOrZero(val);
	const pv = parseOrZero(props.form.property_value as any);
	if (pv > 0) {
		(props.form as any).down_payment = String(Math.max(0, pv - newPrincipal));
	} else if (newPrincipal > 0) {
		const dp = parseOrZero(props.form.down_payment as any);
		(props.form as any).property_value = String(newPrincipal + dp);
	}
};

const onPercentUpdate = (val: string) => {
	downPaymentPercent.value = val;
	const pct = parseOrZero(val);
	const pv = parseOrZero(props.form.property_value as any);
	if (pv > 0) {
		(props.form as any).down_payment = String(Math.max(0, (pv * pct) / 100));
	}
};

const downPaymentEquivPercent = computed(() => {
	const pv = parseOrZero(props.form.property_value as any);
	const dp = parseOrZero(props.form.down_payment as any);
	return pv > 0 ? ((dp / pv) * 100).toFixed(2) : '0.00';
});

const downPaymentEquivDollars = computed(() => {
	const pv = parseOrZero(props.form.property_value as any);
	const pct = parseOrZero(downPaymentPercent.value);
	return pv > 0 ? (pv * pct) / 100 : 0;
});
</script>

<template>
	<div class="space-y-4">
		<!-- 01 · Basic information -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 01</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Basic information</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<FormField v-model="form.sheet_name" name="sheet_name" label="Estimate name" :error="errors.sheet_name" />
					<FormField
						v-model="form.property_address"
						name="property_address"
						label="Property address"
						:error="errors.property_address"
					/>
					<FormField
						v-model="form.property_type"
						name="property_type"
						label="Property type"
						type="select"
						:options="propertyTypeOptions"
						:error="errors.property_type"
					/>
				</div>
			</div>
		</section>

		<!-- 02 · Contact information -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 02</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Contact information</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

		<!-- 03 · Property + loan -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 03</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Property &amp; loan</h3>
			</div>
			<div class="p-5 sm:p-6 space-y-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<label class="block text-sm font-medium text-primary mb-1.5">Property value</label>
						<MaskedNumberInput
							v-model="form.property_value"
							prefix="$"
							placeholder="0.00"
							:error="!!errors.property_value"
						/>
						<p v-if="errors.property_value" class="mt-1.5 text-xs text-danger">{{ errors.property_value[0] }}</p>
					</div>

					<!-- Down payment with dollar/percent toggle -->
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label class="block text-sm font-medium text-primary">Down payment</label>
							<div class="flex items-center gap-1 border border-border rounded-md p-0.5">
								<button
									type="button"
									:class="[
										'px-2 py-0.5 text-[0.625rem] font-medium rounded-sm transition-colors',
										downPaymentMode === 'dollar' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
									]"
									@click="downPaymentMode = 'dollar'"
								>
									$
								</button>
								<button
									type="button"
									:class="[
										'px-2 py-0.5 text-[0.625rem] font-medium rounded-sm transition-colors',
										downPaymentMode === 'percent' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
									]"
									@click="downPaymentMode = 'percent'"
								>
									%
								</button>
							</div>
						</div>

						<MaskedNumberInput
							v-if="downPaymentMode === 'dollar'"
							v-model="form.down_payment"
							prefix="$"
							placeholder="0.00"
							:error="!!errors.down_payment"
						/>
						<MaskedNumberInput
							v-else
							:model-value="downPaymentPercent"
							suffix="%"
							placeholder="0.00"
							:decimals="2"
							@update:model-value="onPercentUpdate"
						/>

						<p class="numeral text-xs text-text-muted mt-1">
							<template v-if="downPaymentMode === 'dollar'">
								= {{ downPaymentEquivPercent }}% of property value
							</template>
							<template v-else> = ${{ formatCurrency(downPaymentEquivDollars) }} </template>
						</p>
						<p v-if="errors.down_payment" class="mt-1.5 text-xs text-danger">{{ errors.down_payment[0] }}</p>
					</div>
				</div>

				<!-- Principal (computed but editable) -->
				<div class="rounded-md border border-accent/20 bg-accent/5 p-4">
					<div class="flex items-center gap-2 mb-1.5">
						<label class="block text-sm font-medium text-primary">Loan principal</label>
						<span class="numeral text-[0.625rem] text-text-muted">
							= property − down payment · edit to back-solve down payment
						</span>
					</div>
					<MaskedNumberInput
						:model-value="principalDisplay"
						prefix="$"
						placeholder="0.00"
						@update:model-value="onPrincipalUpdate"
					/>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<div>
						<label class="block text-sm font-medium text-primary mb-1.5">Interest rate</label>
						<MaskedNumberInput
							v-model="form.interest_rate"
							suffix="%"
							placeholder="0.00"
							:decimals="3"
							:error="!!errors.interest_rate"
						/>
						<p v-if="errors.interest_rate" class="mt-1.5 text-xs text-danger">{{ errors.interest_rate[0] }}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-primary mb-1.5">Loan term (years)</label>
						<MaskedNumberInput
							v-model="form.loan_term_years"
							placeholder="30"
							:allow-decimals="false"
							:error="!!errors.loan_term_years"
						/>
						<p v-if="errors.loan_term_years" class="mt-1.5 text-xs text-danger">{{ errors.loan_term_years[0] }}</p>
					</div>
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

		<!-- 04 · Notes -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 04</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Notes</h3>
			</div>
			<div class="p-5 sm:p-6">
				<FormField v-model="form.notes" name="notes" label="Notes" type="textarea" :error="errors.notes" />
			</div>
		</section>
	</div>
</template>
