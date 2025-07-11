<script setup>
import { LEASE_FORM_FIELDS } from '~/enums/forms'
import LeaseCalculationDetailsLineItem from './LeaseCalculationDetailsLineItem.vue'
import LeaseCalculationPaymentDisplay from './LeaseCalculationPaymentDisplay.vue'

const props = defineProps({
	sheet: Object,
	showAdvanced: Boolean,
})

const fields = computed(() =>
	[
		{
			label: 'MSRP',
			value: props.sheet.msrp,
			variant: 'money',
		},
		{
			label: 'Down Payment',
			value: props.sheet.downPayment,
			variant: 'money',
		},
		{
			label: 'Total Sales Tax',
			value: props.sheet.totalSalesTax,
			variant: 'money',
		},
		{
			label: 'Principal (Loan) Amount',
			value: props.sheet.principalAmount,
			variant: 'money',
		},

		{
			label: 'Interest Rate',
			value: props.sheet.interestRate,
			variant: 'percent',
		},

		{
			label: 'Residual Value',
			value: props.sheet.residualAmount,
			variant: 'money',
		},
		{
			label: 'Residual Value Monthly Interest',
			value: props.sheet[LEASE_FORM_FIELDS.RESIDUAL_MONTHLY_INTEREST_PAYMENT],
			variant: 'money',
		},

		{
			label: 'Total Interest',
			value:
				props.sheet[LEASE_FORM_FIELDS.RESIDUAL_MONTHLY_INTEREST_PAYMENT] *
				props.sheet[LEASE_FORM_FIELDS.LEASE_TERM],
			variant: 'money',
		},

		{
			label: 'Cash Due at Signing',
			value: props.sheet[LEASE_FORM_FIELDS.CASH_DUE_AT_SIGNING],
			variant: 'money',
		},

		{
			label: 'Total Lease Cost',
			value: props.sheet.totalLeaseCost,
			variant: 'money',
		},
	].filter(Boolean)
)
</script>

<template>
	<div
		v-if="props.showAdvanced"
		class="contents"
	>
		<div class="w-full border-spacing-y-2 mt-4 table">
			<LeaseCalculationDetailsLineItem
				v-for="lineItem in fields"
				:key="lineItem.label"
				:item="lineItem"
			/>
		</div>

		<!-- <div class="text-neutral-500 text-center mt-6">
			The total cost of your lease factors in your monthly payments, down
			payment, interest (on the entire cost of the vehicle), sales tax, and
			fees.
		</div> -->

		<LeaseCalculationPaymentDisplay :sheet="props.sheet" />
	</div>

	<LeaseCalculationPaymentDisplay
		v-else
		:sheet="props.sheet"
	/>
</template>
