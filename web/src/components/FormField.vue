<script setup lang="ts">
import FormInput from './FormInput.vue';

interface SelectOption {
	value: string | number;
	label: string;
}

interface Props {
	label?: string;
	name: string;
	id?: string;
	type?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
	autofocus?: boolean;
	autocomplete?: string;
	error?: string | string[];
	helpText?: string;
	size?: 'sm' | 'md' | 'lg';
	step?: string | number;
	min?: string | number;
	max?: string | number;
	prefix?: string;
	suffix?: string;
	rows?: number;
	cols?: number;
	maxlength?: number;
	showCharacterCount?: boolean;
	resize?: 'none' | 'vertical' | 'horizontal' | 'both';
	options?: SelectOption[];
}

withDefaults(defineProps<Props>(), {
	label: '',
	id: '',
	type: 'text',
	placeholder: '',
	disabled: false,
	readonly: false,
	required: false,
	autofocus: false,
	autocomplete: '',
	error: '',
	helpText: '',
	size: 'md',
	step: undefined,
	min: undefined,
	max: undefined,
	prefix: '',
	suffix: '',
	rows: 4,
	cols: undefined,
	maxlength: undefined,
	showCharacterCount: false,
	resize: 'vertical',
	options: () => [],
});

const modelValue = defineModel<string | number>({
	default: '',
});

defineEmits<{
	focus: [event: Event];
	blur: [event: Event];
}>();
</script>

<template>
	<FormInput
		:id="id"
		v-model="modelValue"
		:label="label"
		:name="name"
		:type="type"
		:placeholder="placeholder"
		:disabled="disabled"
		:readonly="readonly"
		:required="required"
		:autofocus="autofocus"
		:autocomplete="autocomplete"
		:error="error"
		:help-text="helpText"
		:size="size"
		:step="step"
		:min="min"
		:max="max"
		:prefix="prefix"
		:suffix="suffix"
		:rows="rows"
		:cols="cols"
		:maxlength="maxlength"
		:show-character-count="showCharacterCount"
		:resize="resize"
		:options="options"
		v-bind="$attrs"
		@focus="$emit('focus', $event)"
		@blur="$emit('blur', $event)"
	>
		<!-- Pass through slot content -->
		<slot />
	</FormInput>
</template>
