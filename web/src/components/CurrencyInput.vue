<template>
	<BaseInput
		:id="id"
		v-model="modelValue"
		:name="name"
		type="number"
		:placeholder="placeholder"
		:disabled="disabled"
		:readonly="readonly"
		:required="required"
		:autofocus="autofocus"
		:autocomplete="autocomplete"
		:error="error"
		:size="size"
		:min="min || 0"
		:max="max"
		:step="step || '0.01'"
		prefix="$"
		v-bind="$attrs"
		@focus="$emit('focus', $event)"
		@blur="$emit('blur', $event)"
	/>
</template>

<script setup>
import BaseInput from './BaseInput.vue';

defineEmits(['focus', 'blur']);

const modelValue = defineModel({
	type: [String, Number],
	default: '',
});

defineProps({
	id: {
		type: String,
		default: '',
	},
	name: {
		type: String,
		default: '',
	},
	placeholder: {
		type: String,
		default: '0.00',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
	required: {
		type: Boolean,
		default: false,
	},
	autofocus: {
		type: Boolean,
		default: false,
	},
	autocomplete: {
		type: String,
		default: '',
	},
	step: {
		type: [String, Number],
		default: '0.01',
	},
	min: {
		type: [String, Number],
		default: 0,
	},
	max: {
		type: [String, Number],
		default: undefined,
	},
	error: {
		type: [String, Array],
		default: '',
	},
	size: {
		type: String,
		default: 'md',
		validator: value => ['sm', 'md', 'lg'].includes(value),
	},
});
</script>
