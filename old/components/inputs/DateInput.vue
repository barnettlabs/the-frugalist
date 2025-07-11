<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	containerClassName: String,
	labelClassName: String,

	disabled: {
		type: Boolean,
		default: false,
	},
	label: {
		type: String,
		default: '',
	},
})

const model = defineModel()
</script>

<template>
	<div
		class="text-input-container"
		:class="[
			{
				'text-input-container--disabled': props.disabled,
			},
			containerClassName,
		]"
	>
		<label
			v-if="props.label"
			htmlFor="name"
			class="text-input-label"
			:class="labelClassName"
		>
			{{ label }}
		</label>

		<div class="relative">
			<div
				class="pointer-events-none absolute inset-y-0 left-0 flex items-center"
			>
				<slot name="left"></slot>
			</div>

			<VueDatePicker
				v-model="model"
				class="text-input"
				v-bind="$attrs"
				:disabled="props.disabled"
				hideInputIcon
			></VueDatePicker>

			<div
				class="pointer-events-none absolute inset-y-0 right-0 flex items-center"
			>
				<slot name="right"></slot>
			</div>
		</div>
	</div>
</template>

<style scoped>
/*  */
</style>
