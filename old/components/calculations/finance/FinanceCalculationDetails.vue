<script setup lang="ts">
import FinanceCalculationPaymentDisplay from './FinanceCalculationPaymentDisplay.vue'
import FinanceCalculationDetailsLineItem from './FinanceCalculationDetailsLineItem.vue'
import { FINANCE_FORM_FIELDS } from '~/enums/forms'

const props = defineProps({
	sheet: Object,
	showAdvanced: Boolean,
})

const savings = ref<number>(0)
const hasSavings = ref<boolean>(false)
const termReductionYears = ref<number>(0)
const termReductionMonths = ref<number>(0)
const termReduction = ref<string>('')

watch(
	() => props.sheet,
	() => {
		savings.value =
			props.sheet?.baseAmortizationDetails?.grandTotal -
			(props.sheet?.reducedAmortizationDetails?.grandTotal || 0)

		hasSavings.value = !!savings.value

		termReductionYears.value = Math.floor(
			props.sheet?.reducedAmortizationDetails?.termReductionInMonths / 12
		)
		termReductionMonths.value =
			props.sheet?.reducedAmortizationDetails?.termReductionInMonths % 12

		termReduction.value =
			!termReductionYears.value && !termReductionMonths.value
				? '< 1 month'
				: `${
						!!termReductionYears.value
							? `${termReductionYears.value} year${
									termReductionYears.value === 1 ? '' : 's'
							  }`
							: ''
				  } ${termReductionMonths.value} month${
						termReductionMonths.value === 1 ? '' : 's'
				  }`
	}
)

const fields = computed(() =>
	[
		{
			label: 'MSRP',
			value: props.sheet?.[FINANCE_FORM_FIELDS.MSRP],
			variant: 'money',
		},
		{
			label: 'Down Payment',
			value: props.sheet?.[FINANCE_FORM_FIELDS.DOWN_PAYMENT],
			variant: 'money',
		},
		{
			label: 'Total Sales Tax',
			value: props.sheet?.[FINANCE_FORM_FIELDS.SALES_TAX_AMOUNT],
			variant: 'money',
		},
		{
			label: 'Loan Amount',
			value: props.sheet?.[FINANCE_FORM_FIELDS.LOAN_AMOUNT],
			variant: 'money',
		},

		{
			label: 'Total Interest',
			baseValue: props.sheet?.baseAmortizationDetails?.totalInterest,
			value: props.sheet?.reducedAmortizationDetails?.totalInterest,
			variant: 'money',
		},

		{
			label: 'Grand Total',
			baseValue: props.sheet?.baseAmortizationDetails?.grandTotal,
			value: props.sheet?.reducedAmortizationDetails?.grandTotal,
			variant: 'money',
		},

		hasSavings.value && {
			label: 'Savings',
			value: savings.value,
			className: 'font-semibold',
			labelClassName: '',
			valueClassName: 'text-success',
			variant: 'money',
		},
		hasSavings.value && {
			label: 'Term Reduction',
			value: termReduction.value,
			className: 'font-semibold',
			labelClassName: '',
			valueClassName: 'text-success',
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
			<FinanceCalculationDetailsLineItem
				v-for="lineItem in fields"
				:key="lineItem.label"
				:item="lineItem"
			/>
		</div>

		<FinanceCalculationPaymentDisplay
			v-if="props.sheet"
			:sheet="props.sheet"
		/>
	</div>

	<FinanceCalculationPaymentDisplay
		v-else-if="props.sheet"
		:sheet="props.sheet"
	/>
</template>
