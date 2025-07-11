<script setup>
import { isNumeric } from '~/utils/number'

const props = defineProps({
	item: Object,
})

const value = computed(() =>
	props.item.variant === 'money'
		? isNumeric(props.item.value)
			? parseFloat(props.item.value.toString()).toLocaleString('en', {
					useGrouping: true,
					minimumFractionDigits: 2,
			  })
			: null
		: props.item.value
)
const valueLeftDecorator = computed(() =>
	props.item.variant === 'money' ? '$' : ''
)
const valueRightDecorator = computed(() =>
	props.item.variant === 'percent' ? '%' : ''
)
</script>

<template>
	<div
		class="table-row truncate text-sm text-gray-500"
		:class="props.item.className"
	>
		<span
			class="table-cell text-dark text-lg text-wrap"
			:class="props.item.labelClassName"
		>
			{{ props.item.label }}:
		</span>
		<span
			class="table-cell text-right text-lg align-middle"
			:class="props.item.valueClassName"
		>
			<span>
				{{ valueLeftDecorator + ' ' }}
				{{ value }}
				{{ ' ' + valueRightDecorator }}
			</span>
		</span>
	</div>
</template>
