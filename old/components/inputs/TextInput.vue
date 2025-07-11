<script setup lang="ts">
defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	containerClassName: String,
	labelClassName: String,

	value: {
		type: [String, Number],
		// default: '',
	},

	disabled: {
		type: Boolean,
		default: false,
	},
	label: {
		type: String,
	},

	decorator: {
		type: String,
	},

	parser: {
		type: String,
	},
})

const model = defineModel()

const emit = defineEmits(['update:modelValue'])

const value = ref(null)

const decorators = {
	percent: {
		left: '',
		right: '%',
	},
	currency: {
		left: '$',
		right: '',
	},
}

const parsersIn = {
	int: (value) => {
		return value
	},
	decimal: (value) => {
		return !value ? value : formatNumberInput(value)
	},

	phone: (value) => {
		return !value ? value : formatPhoneNumber(value)
	},
}

const parsersOut = {
	int: (value) => {
		if (!value) return [value, false]

		const int = parseInt(value)
		const nan = isNaN(int)

		if (nan) {
			return [null, true]
		}

		return [int, false]
	},

	decimal: (value): [number | string | null, boolean] => {
		if (!value) return [null, false]

		const valueString = value.toString().replace(/,/g, '')

		const hasDecimal = valueString.includes('.')

		const float = parseFloat(valueString)
		const floatString = float.toString()

		const nan = isNaN(float)

		if (nan) {
			return [null, true]
		}

		if (!hasDecimal) {
			return [float, false]
		}

		if (floatString != valueString) {
			return [valueString, false]
		}

		return [float, false]
	},

	phone: (value) => {
		return [!value ? value : extractNumbers(value), false]
	},
}

const defaultLeftSlotContent = computed(() => {
	if (!props.decorator) return ''
	return decorators[props.decorator]?.left
})
const defaultRightSlotContent = computed(() => {
	if (!props.decorator) return ''
	return decorators[props.decorator]?.right
})

function updateValue(inputValue, skipModelUpdate = false) {
	// const lastChar =
	// 	typeof inputValue === 'string' ? inputValue.slice(-1)[0] : null

	// if (props.parser === 'decimal' && ['.'].includes(lastChar)) {
	// 	const hasMultipleDecimals = (inputValue.match(/\./g) || []).length > 1

	// 	if (hasMultipleDecimals) {
	// 		return
	// 	}

	// 	value.value = inputValue
	// 	return
	// }

	const parser = props.parser && parsersOut[props.parser]
	const [outValue, rejectValue] = !!parser
		? parser(inputValue)
		: [inputValue, false]

	if (rejectValue || value.value === outValue) return

	!skipModelUpdate && emit('update:modelValue', outValue)
	value.value = inputValue
}

watchEffect(() => {
	const val = model.value != undefined ? model.value : props.value
	const parser = props.parser && parsersIn[props.parser]
	const formattedValue = !!parser ? parser(val) : val
	const formattedInternalValue = !!parser ? parser(value.value) : value.value

	const existingValue = value.value ?? ''
	const ignoreLastCharacters = ['.']
	const lastCharacter =
		typeof existingValue === 'string' ? existingValue.slice(-1)[0] : null
	const ignoreNewValue = ignoreLastCharacters.includes(lastCharacter)

	if (!ignoreNewValue) {
		updateValue(formattedValue, true)
	}
})
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

		<div class="relative flex">
			<div
				v-if="$slots.left || defaultLeftSlotContent"
				class="pointer-events-none flex items-center pr-2"
			>
				<slot name="left">
					<span class="text-gray-500">
						{{ defaultLeftSlotContent }}
					</span>
				</slot>
			</div>

			<!-- v-model="model" -->
			<input
				class="text-input"
				v-bind="$attrs"
				:disabled="props.disabled"
				:value="value"
				@input="
					(e) => {
						updateValue(e.target.value)
						$forceUpdate()
					}
				"
			/>

			<div
				v-if="$slots.right || defaultRightSlotContent"
				class="pointer-events-none flex items-center pl-2"
			>
				<slot name="right">
					<span class="text-gray-500">
						{{ defaultRightSlotContent }}
					</span>
				</slot>
			</div>
		</div>
	</div>
</template>

<style scoped>
/*  */
</style>
