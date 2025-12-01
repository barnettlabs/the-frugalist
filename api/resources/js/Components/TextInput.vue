<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

const model = defineModel({
  type: String,
  required: true,
})

const input = ref(null)

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <BaseInput v-model="model" v-bind="$attrs" ref="input" />
</template>
