<template>
  <BaseInput
    v-model="modelValue"
    :id="id"
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
    :min="min"
    :max="max"
    :step="step"
    :prefix="prefix"
    :suffix="suffix"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
    v-bind="$attrs"
  />
</template>

<script setup>
import BaseInput from './BaseInput.vue'

defineEmits(['focus', 'blur'])

const modelValue = defineModel({
  type: [String, Number],
  default: '',
})

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
    default: '1',
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
})
</script>
