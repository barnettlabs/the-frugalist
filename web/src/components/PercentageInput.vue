<script setup lang="ts">
import type { PropType } from 'vue';

import type { InputSize } from '@/types/ui';

import BaseInput from './BaseInput.vue';

defineEmits(['focus', 'blur']);

const modelValue = defineModel<string | number>({ default: '' });

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
		default: 100,
	},
	error: {
		type: [String, Array],
		default: '',
	},
	size: {
		type: String as PropType<InputSize>,
		default: 'md',
		validator: (value: unknown): boolean => ['sm', 'md', 'lg'].includes(value as string),
	},
});
</script>

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
		:max="max || 100"
		:step="step || '0.01'"
		suffix="%"
		v-bind="$attrs"
		@focus="$emit('focus', $event)"
		@blur="$emit('blur', $event)"
	/>
</template>
