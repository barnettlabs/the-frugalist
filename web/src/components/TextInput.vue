<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

defineProps({
  prefix: {
    type: String,
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
})

const model = defineModel({
  type: String,
  required: true,
})

const input = ref(null)

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <BaseInput v-model="model" :prefix="prefix" :suffix="suffix" :input-class="inputClass" v-bind="$attrs" ref="input">
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </BaseInput>
</template>
