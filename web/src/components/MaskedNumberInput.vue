<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

interface Props {
	modelValue: string | number | null | undefined;
	prefix?: string;
	suffix?: string;
	placeholder?: string;
	allowDecimals?: boolean;
	decimals?: number;
	min?: number;
	max?: number;
	ariaLabel?: string;
	error?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	prefix: '',
	suffix: '',
	placeholder: '0',
	allowDecimals: true,
	decimals: 2,
	error: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	focus: [];
	blur: [];
}>();

const focused = ref(false);
const rawInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const CONTENT_RE = /[0-9.\-]/;

function countContentChars(s: string): number {
	let count = 0;
	for (const c of s) if (CONTENT_RE.test(c)) count++;
	return count;
}

function cleanNumeric(input: string): string {
	let val = String(input).replace(/[^0-9.\-]/g, '');
	const dotIdx = val.indexOf('.');
	if (dotIdx !== -1) {
		val = val.slice(0, dotIdx + 1) + val.slice(dotIdx + 1).replace(/\./g, '');
		if (!props.allowDecimals) {
			val = val.slice(0, dotIdx);
		} else if (val.slice(dotIdx + 1).length > props.decimals) {
			val = val.slice(0, dotIdx + 1 + props.decimals);
		}
	}
	const minusIdx = val.indexOf('-');
	if (minusIdx > 0) {
		val = val.replace(/-/g, '');
	} else if (minusIdx === 0) {
		val = '-' + val.slice(1).replace(/-/g, '');
	}
	return val;
}

function formatWithCommas(val: string): string {
	if (!val || val === '-' || val === '.' || val === '-.') return val;
	const parts = val.split('.');
	const intPart = parts[0];
	const negative = intPart.startsWith('-');
	const digits = negative ? intPart.slice(1) : intPart;
	const formatted = digits ? Number(digits).toLocaleString('en-US') : '';
	const result = (negative ? '-' : '') + formatted;
	if (parts.length === 2) return result + '.' + parts[1];
	return result;
}

function modelToDisplay(val: string | number | null | undefined, withCommas: boolean): string {
	if (val === null || val === undefined || val === '' || val === 0) {
		return val === 0 ? '0' : '';
	}
	const cleaned = cleanNumeric(String(val));
	if (!cleaned) return '';
	return withCommas ? formatWithCommas(cleaned) : cleaned;
}

watch(
	() => props.modelValue,
	val => {
		if (!focused.value) {
			rawInput.value = modelToDisplay(val, true);
		}
	},
	{ immediate: true }
);

function onInput(e: Event) {
	const target = e.target as HTMLInputElement;
	const caret = target.selectionStart ?? target.value.length;
	const contentBeforeCaret = countContentChars(target.value.slice(0, caret));

	const cleaned = cleanNumeric(target.value);
	const formatted = formatWithCommas(cleaned);

	rawInput.value = formatted;
	emit('update:modelValue', cleaned);

	nextTick(() => {
		if (!inputRef.value) return;
		let newCaret = 0;
		let count = 0;
		for (let i = 0; i < formatted.length; i++) {
			if (count >= contentBeforeCaret) break;
			if (CONTENT_RE.test(formatted[i])) count++;
			newCaret = i + 1;
		}
		if (count < contentBeforeCaret) newCaret = formatted.length;
		try {
			inputRef.value.setSelectionRange(newCaret, newCaret);
		} catch {
			// some browsers throw on non-text inputs; ignore
		}
	});
}

function onFocus() {
	focused.value = true;
	rawInput.value = modelToDisplay(props.modelValue, true);
	emit('focus');
}

function onBlur() {
	focused.value = false;
	rawInput.value = modelToDisplay(props.modelValue, true);
	emit('blur');
}
</script>

<template>
	<div class="relative">
		<div
			v-if="prefix"
			class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10 flex items-center text-sm pointer-events-none"
		>
			{{ prefix }}
		</div>
		<input
			ref="inputRef"
			type="text"
			inputmode="decimal"
			autocomplete="off"
			:class="[
				'block w-full rounded-md bg-surface text-primary placeholder:text-text-muted/60 shadow-none focus:ring-1 transition-colors px-3 py-2 text-sm',
				prefix ? 'pl-7' : '',
				suffix ? 'pr-8' : '',
				error
					? 'border-danger focus:border-danger focus:ring-danger'
					: 'border-border focus:border-accent focus:ring-accent',
			]"
			:placeholder="placeholder"
			:value="rawInput"
			:aria-label="ariaLabel"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
		/>
		<div
			v-if="suffix"
			class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted z-10 flex items-center text-sm pointer-events-none"
		>
			{{ suffix }}
		</div>
	</div>
</template>
