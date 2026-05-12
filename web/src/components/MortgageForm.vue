<script setup lang="ts">
import { CalculatorIcon } from '@heroicons/vue/24/outline';
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { MortgageFormData, FormErrors, propertyTypeOptions } from '@/types';
import { parseOrZero } from '@/utils/formatters';

import FormField from './FormField.vue';
import Spinner from './Spinner.vue';

interface Props {
	form: MortgageFormData;
	errors: FormErrors;
	loading: boolean;
	title: string;
	backUrl: string;
	isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	isEdit: false,
});

defineEmits<{
	submit: [];
}>();

// Down payment can be entered as dollar OR percent.
const downPaymentMode = ref<'dollar' | 'percent'>('dollar');
const downPaymentPercent = ref<string>('');

// Sync percent display with form down_payment / property_value
watch(
	() => [props.form.property_value, props.form.down_payment],
	() => {
		const pv = parseOrZero(props.form.property_value as any);
		const dp = parseOrZero(props.form.down_payment as any);
		downPaymentPercent.value = pv > 0 ? ((dp / pv) * 100).toFixed(2) : '';
	},
	{ immediate: true }
);

// Editable principal — derives from property_value − down_payment.
const principal = computed({
	get: () => {
		const pv = parseOrZero(props.form.property_value as any);
		const dp = parseOrZero(props.form.down_payment as any);
		return pv > 0 ? Math.max(0, pv - dp).toFixed(2) : '';
	},
	set: (val: string | number) => {
		const newPrincipal = parseOrZero(val);
		const pv = parseOrZero(props.form.property_value as any);
		if (pv > 0) {
			// Adjust down_payment to satisfy property_value - down_payment = principal
			const newDp = Math.max(0, pv - newPrincipal);
			(props.form as any).down_payment = newDp;
		} else if (newPrincipal > 0) {
			// No property value yet — set property_value = principal + current down_payment
			const dp = parseOrZero(props.form.down_payment as any);
			(props.form as any).property_value = newPrincipal + dp;
		}
	},
});

const onPercentInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	downPaymentPercent.value = target.value;
	const pct = parseOrZero(target.value);
	const pv = parseOrZero(props.form.property_value as any);
	if (pv > 0) {
		(props.form as any).down_payment = Math.max(0, (pv * pct) / 100);
	}
};
</script>

<template>
	<form class="space-y-4" @submit.prevent="$emit('submit')">
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

		<!-- 03 · Loan -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 03</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Property &amp; loan</h3>
			</div>
			<div class="p-5 sm:p-6 space-y-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<FormField
						v-model="form.property_value"
						name="property_value"
						label="Property value"
						type="currency"
						:error="errors.property_value"
					/>

					<!-- Down payment with dollar/percent toggle -->
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label class="block text-xs font-medium text-text-muted">Down payment</label>
							<div class="flex items-center gap-1 border border-border rounded-md p-0.5">
								<button
									type="button"
									:class="[
										'px-2 py-0.5 text-[0.625rem] font-medium rounded transition-colors',
										downPaymentMode === 'dollar' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
									]"
									@click="downPaymentMode = 'dollar'"
								>
									$
								</button>
								<button
									type="button"
									:class="[
										'px-2 py-0.5 text-[0.625rem] font-medium rounded transition-colors',
										downPaymentMode === 'percent' ? 'bg-primary text-surface' : 'text-text-muted hover:text-primary',
									]"
									@click="downPaymentMode = 'percent'"
								>
									%
								</button>
							</div>
						</div>
						<FormField
							v-if="downPaymentMode === 'dollar'"
							v-model="form.down_payment"
							name="down_payment"
							label=""
							type="currency"
							:error="errors.down_payment"
						/>
						<div v-else>
							<input
								:value="downPaymentPercent"
								type="number"
								step="0.01"
								min="0"
								max="100"
								class="block w-full rounded-md border-border bg-surface shadow-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
								placeholder="20.00"
								@input="onPercentInput"
							/>
							<p class="numeral text-xs text-text-muted mt-1">
								= ${{ Number(form.down_payment || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
							</p>
						</div>
					</div>
				</div>

				<!-- Principal (computed but editable) -->
				<div class="rounded-md border border-accent/20 bg-accent/5 p-4">
					<div class="flex items-center gap-2 mb-1.5">
						<label class="block text-xs font-medium text-primary">Loan principal</label>
						<span class="numeral text-[0.625rem] text-text-muted">
							= property − down payment · edit to back-solve down payment
						</span>
					</div>
					<input
						:value="principal"
						type="number"
						step="0.01"
						min="0"
						class="block w-full rounded-md border-accent/30 bg-surface shadow-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
						placeholder="0.00"
						@input="(e) => (principal = (e.target as HTMLInputElement).value)"
					/>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<FormField
						v-model="form.interest_rate"
						name="interest_rate"
						label="Interest rate"
						type="percentage"
						:error="errors.interest_rate"
					/>
					<FormField
						v-model="form.loan_term_years"
						name="loan_term_years"
						label="Loan term (years)"
						type="number"
						:min="1"
						:max="50"
						:error="errors.loan_term_years"
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

		<!-- 04 · Monthly + annual expenses -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 04</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Recurring expenses</h3>
			</div>
			<div class="p-5 sm:p-6">
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<FormField
						v-model="form.monthly_hoa"
						name="monthly_hoa"
						label="Monthly HOA"
						type="currency"
						:error="errors.monthly_hoa"
					/>
					<FormField
						v-model="form.annual_insurance"
						name="annual_insurance"
						label="Annual insurance"
						type="currency"
						:error="errors.annual_insurance"
					/>
					<FormField
						v-model="form.annual_property_tax"
						name="annual_property_tax"
						label="Annual property tax"
						type="currency"
						:error="errors.annual_property_tax"
					/>
				</div>
			</div>
		</section>

		<!-- 05 · Notes -->
		<section class="card overflow-hidden">
			<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
				<span class="numeral text-xs text-text-muted">№ 05</span>
				<h3 class="font-display text-xl text-primary tracking-tight">Notes</h3>
			</div>
			<div class="p-5 sm:p-6">
				<FormField v-model="form.notes" name="notes" label="Notes" type="textarea" :error="errors.notes" />
			</div>
		</section>

		<!-- Submit (Create only) -->
		<div v-if="!isEdit" class="flex items-center justify-end gap-3 pt-2">
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
				{{ loading ? 'Creating…' : 'Create mortgage estimate' }}
			</button>
		</div>
	</form>
</template>
