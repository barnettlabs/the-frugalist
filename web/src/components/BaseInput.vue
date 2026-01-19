<script setup lang="ts">
import { watch } from 'vue'
import { computed, ref } from 'vue'

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
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
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
    default: undefined,
  },
  min: {
    type: [String, Number],
    default: undefined,
  },
  max: {
    type: [String, Number],
    default: undefined,
  },
  prefix: {
    type: String,
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
  error: {
    type: [String, Array],
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  class: {
    type: String
  }
})

const input = ref(null)

// Size classes
const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
}

// Input classes computation
const inputClasses = computed(() => {
  const baseClasses =
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed'
  const sizeClass = sizeClasses[props.size]
  const paddingClass = getPaddingClass()
  const errorClass = props.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''

  return `${baseClasses} ${sizeClass} ${paddingClass} ${errorClass} ${props.class}`
})

// Dynamic padding based on prefix/suffix
const getPaddingClass = () => {
  if (props.prefix && props.suffix) {
    return 'pl-8 pr-8'
  } else if (props.prefix) {
    return 'pl-8'
  } else if (props.suffix) {
    return 'pr-8'
  }
  return ''
}

// Event handlers
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

// Expose focus method
defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur(),
})
</script>

<template>
  <div class="relative">
    <!-- Prefix for currency/symbols -->
    <span
      v-if="prefix"
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
    >
      {{ prefix }}
    </span>

    <!-- Input element -->
    <input
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :autofocus="autofocus"
      :autocomplete="autocomplete"
      :step="step"
      :min="min"
      :max="max"
      :class="inputClasses"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      v-bind="$attrs"
      ref="input"
    />

    <!-- Suffix for percentage/units -->
    <span
      v-if="suffix"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
    >
      {{ suffix }}
    </span>
  </div>
</template>
