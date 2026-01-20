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
})

const model = defineModel({
  type: String,
  required: true,
})

const input = ref(null)

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <BaseInput v-model="model" :prefix="prefix" :suffix="suffix" v-bind="$attrs" ref="input" />
</template>
