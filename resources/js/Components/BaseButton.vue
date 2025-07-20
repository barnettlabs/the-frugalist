<template>
  <button :class="buttonClasses" :disabled="disabled" :type="type" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
})

const buttonClasses = computed(() => {
  const baseClasses =
    'inline-flex items-center rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50'

  const variantClasses = {
    primary:
      'border-transparent bg-gray-800 text-white hover:bg-gray-700 focus:bg-gray-700 focus:ring-indigo-500 active:bg-gray-900',
    secondary: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger:
      'border-transparent bg-red-600 text-white hover:bg-red-500 focus:bg-red-500 focus:ring-red-500 active:bg-red-700',
  }

  return `${baseClasses} ${variantClasses[props.variant]}`
})
</script>
