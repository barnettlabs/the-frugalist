<template>
  <div class="relative">
    <textarea
      :id="id"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :autofocus="autofocus"
      :autocomplete="autocomplete"
      :rows="rows"
      :cols="cols"
      :maxlength="maxlength"
      :class="textareaClasses"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      v-bind="$attrs"
      ref="textarea"
    />

    <!-- Character count -->
    <div v-if="maxlength && showCharacterCount" class="mt-1 text-right text-xs text-text-muted numeral">
      {{ characterCount }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

defineEmits(['update:modelValue', 'focus', 'blur'])

const props = defineProps({
  modelValue: {
    type: String,
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
  rows: {
    type: Number,
    default: 4,
  },
  cols: {
    type: Number,
    default: undefined,
  },
  maxlength: {
    type: Number,
    default: undefined,
  },
  showCharacterCount: {
    type: Boolean,
    default: false,
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
  resize: {
    type: String,
    default: 'vertical',
    validator: (value) => ['none', 'both', 'horizontal', 'vertical'].includes(value),
  },
})

const textarea = ref(null)

// Size classes
const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
}

// Resize classes
const resizeClasses = {
  none: 'resize-none',
  both: 'resize',
  horizontal: 'resize-x',
  vertical: 'resize-y',
}

// Textarea classes computation
const textareaClasses = computed(() => {
  const baseClasses =
    'block w-full rounded-md border-border bg-surface text-primary placeholder:text-text-muted/60 shadow-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-dark transition-colors'
  const sizeClass = sizeClasses[props.size]
  const resizeClass = resizeClasses[props.resize]
  const errorClass = props.error
    ? 'border-danger focus:border-danger focus:ring-danger'
    : ''

  return `${baseClasses} ${sizeClass} ${resizeClass} ${errorClass}`
})

// Character count
const characterCount = computed(() => {
  return props.modelValue ? props.modelValue.length : 0
})

// Expose focus method
defineExpose({
  focus: () => textarea.value?.focus(),
  blur: () => textarea.value?.blur(),
})
</script>
