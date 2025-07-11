<script setup>
const props = defineProps({
	sheet: Object,
})

const amortizationColumnDefs = [
	{
		label: '#',
		field: 'paymentNumber',
		// style: {
		//   minWidth: 100
		// },
		headerCellStyle: {},
		dataCellStyle: {
			// padding: '0.5rem 0',
			// border: '1px solid var(--blue)'
		},
	},
	{
		label: 'Month',
		field: 'month',
	},
	{
		label: 'Year',
		field: 'year',
	},
	{
		label: 'Interest',
		field: 'monthlyInterestAmount',
		isDollarAmount: true,
	},
	{
		label: 'Principal',
		field: 'monthlyPrincipalAmount',
		isDollarAmount: true,
	},
	// {
	//   label: 'Total',
	//   field: 'totalPaidForMonth',
	//   isDollarAmount: true
	// },
	{
		label: 'Remaining',
		field: 'remainingBalance',
		isDollarAmount: true,
	},
	{
		label: 'LTV',
		field: 'loanToValue',
		isPercentage: true,
	},
]

const tableRowClassNames = 'table-row'
const tableCellClassNames =
	'table-cell py-1 px-5 text-left first:pl-0 last:pr-0'
</script>

<template>
	<div class="table">
		<section :class="[tableRowClassNames, 'text-gray-500']">
			<div
				v-for="{
					label,
					field,
					style,
					headerCellStyle,
				} in amortizationColumnDefs"
				:key="`amortization__header__${field}`"
				:class="tableCellClassNames"
				:style="[style, headerCellStyle]"
			>
				{{ label }}
			</div>
		</section>

		<div
			v-for="rowData in sheet?.reducedAmortization"
			:key="`amortization__row__${rowData.month}_${rowData.year}`"
			:class="tableRowClassNames"
		>
			<div
				v-for="{
					field,
					isDollarAmount,
					isPercentage,
					formatWithCommas,
					style,
					dataCellStyle,
				} in amortizationColumnDefs"
				:key="`amortization__row__${field}`"
				:class="tableCellClassNames"
				:style="[style, dataCellStyle]"
			>
				<span v-if="isDollarAmount">$</span>

				<span>
					{{
						formatWithCommas || isDollarAmount || isPercentage
							? Number(rowData[field], 2).toLocaleString('en', {
									minimumFractionDigits: 2,
							  })
							: rowData[field]
					}}
				</span>

				<span v-if="isPercentage">%</span>
			</div>
		</div>
	</div>
</template>
