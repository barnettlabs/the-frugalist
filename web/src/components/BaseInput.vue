<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

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
  inputClass: {
    type: String,
    default: '',
  },
})

const slots = useSlots()
const input = ref(null)

// Check if slots are provided
const hasPrefix = computed(() => !!slots.prefix || !!props.prefix)
const hasSuffix = computed(() => !!slots.suffix || !!props.suffix)

// Size classes
const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
}

// Input classes computation
const inputClasses = computed(() => {
  const baseClasses =
    'block w-full rounded-md border-border bg-surface text-primary placeholder:text-text-muted/60 shadow-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-dark transition-colors'
  const sizeClass = sizeClasses[props.size]
  const paddingClass = getPaddingClass()
  const errorClass = props.error
    ? 'border-danger focus:border-danger focus:ring-danger'
    : ''

  return `${baseClasses} ${sizeClass} ${paddingClass} ${errorClass} ${props.inputClass}`
})

// Dynamic padding based on prefix/suffix
const getPaddingClass = () => {
  if (hasPrefix.value && hasSuffix.value) {
    return 'pl-8 pr-8'
  } else if (hasPrefix.value) {
    return 'pl-8'
  } else if (hasSuffix.value) {
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
    <!-- Prefix slot or text -->
    <div
      v-if="hasPrefix"
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted z-10 flex items-center"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </div>

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

    <!-- Suffix slot or text -->
    <div
      v-if="hasSuffix"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted z-10 flex items-center"
    >
      <slot name="suffix">{{ suffix }}</slot>
    </div>
  </div>
</template>
