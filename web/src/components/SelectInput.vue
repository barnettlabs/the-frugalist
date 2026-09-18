<template>
	<div class="relative">
		<select
			:id="id"
			v-bind="$attrs"
			ref="select"
			:name="name"
			:value="modelValue"
			:disabled="disabled"
			:required="required"
			:autofocus="autofocus"
			:autocomplete="autocomplete"
			:class="selectClasses"
			@change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
			@focus="$emit('focus', $event)"
			@blur="$emit('blur', $event)"
		>
			<!-- Default/placeholder option -->
			<option v-if="placeholder" value="" disabled :selected="!modelValue">
				{{ placeholder }}
			</option>

			<!-- Options from array -->
			<option v-for="option in normalizedOptions" :key="option.value" :value="option.value" :disabled="option.disabled">
				{{ option.label }}
			</option>

			<!-- Slot for custom options -->
			<slot />
		</select>

		<!-- Custom dropdown icon -->
		<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
			<svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import type { InputSize, SelectOptionInput } from '@/types/ui';

defineEmits(['update:modelValue', 'focus', 'blur']);

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: '',
	},
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
		default: '',
	},
	disabled: {
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
	options: {
		type: Array as PropType<readonly SelectOptionInput[]>,
		default: () => [],
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

const select = ref<HTMLSelectElement | null>(null);

// Size classes
const sizeClasses: Record<InputSize, string> = {
	sm: 'px-2 py-1 pr-8 text-sm',
	md: 'px-3 py-2 pr-10 text-sm',
	lg: 'px-4 py-2 pr-12 text-base',
};

// Select classes computation
const selectClasses = computed(() => {
	const baseClasses =
		'block w-full rounded-md border-border bg-surface text-primary shadow-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed appearance-none transition-colors';
	const sizeClass = sizeClasses[props.size];
	const errorClass = props.error ? 'border-danger focus:border-danger focus:ring-danger' : '';

	return `${baseClasses} ${sizeClass} ${errorClass}`;
});

// Normalize options to support both string arrays and object arrays
const normalizedOptions = computed(() => {
	if (!props.options || props.options.length === 0) {
		return [];
	}

	return props.options.map(option => {
		if (typeof option === 'string') {
			return { value: option, label: option, disabled: false };
		}

		const value = option.value ?? option.id ?? '';
		const label = option.label ?? option.name ?? option.text ?? String(value);

		return { value, label, disabled: option.disabled ?? false };
	});
});

// Expose focus method
defineExpose({
	focus: () => select.value?.focus(),
	blur: () => select.value?.blur(),
});
</script>
