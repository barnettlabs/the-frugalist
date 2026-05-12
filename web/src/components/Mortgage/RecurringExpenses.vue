<script setup lang="ts">
import MaskedNumberInput from '@/components/MaskedNumberInput.vue';
import { MortgageFormData, FormErrors } from '@/types';

interface Props {
	form: MortgageFormData;
	errors: FormErrors;
}

defineProps<Props>();
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Recurring</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Standard expenses</h3>
			<span class="numeral text-xs text-text-muted ml-auto">HOA, insurance, taxes</span>
		</div>
		<div class="p-5 sm:p-6">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				<div>
					<label class="block text-sm font-medium text-primary mb-1.5">Monthly HOA</label>
					<MaskedNumberInput v-model="form.monthly_hoa" prefix="$" placeholder="0.00" :error="!!errors.monthly_hoa" />
					<p v-if="errors.monthly_hoa" class="mt-1.5 text-xs text-danger">{{ errors.monthly_hoa[0] }}</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-primary mb-1.5">Annual insurance</label>
					<MaskedNumberInput
						v-model="form.annual_insurance"
						prefix="$"
						placeholder="0.00"
						:error="!!errors.annual_insurance"
					/>
					<p v-if="errors.annual_insurance" class="mt-1.5 text-xs text-danger">{{ errors.annual_insurance[0] }}</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-primary mb-1.5">Annual property tax</label>
					<MaskedNumberInput
						v-model="form.annual_property_tax"
						prefix="$"
						placeholder="0.00"
						:error="!!errors.annual_property_tax"
					/>
					<p v-if="errors.annual_property_tax" class="mt-1.5 text-xs text-danger">{{ errors.annual_property_tax[0] }}</p>
				</div>
			</div>
		</div>
	</section>
</template>
