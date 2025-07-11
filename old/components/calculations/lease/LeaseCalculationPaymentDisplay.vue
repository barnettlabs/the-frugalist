<script setup>
const props = defineProps({
	sheet: Object,
})
</script>

<template>
	<div class="flex flex-col items-center mt-6 text-center">
		<span class="text-md text-gray-500">Payment</span>
		<span
			v-if="!['NaN', '0', 0].includes(props.sheet.leasePayment)"
			class="text-xl text-gray-800 font-bold"
		>
			$
			{{
				parseFloat(props.sheet.leasePayment).toLocaleString('en', {
					useGrouping: true,
					minimumFractionDigits: 2,
				})
			}}
			/month
		</span>

		<span
			v-else
			class="text-gray-600 font-bold"
		>
			Waiting for values...</span
		>
	</div>
</template>
