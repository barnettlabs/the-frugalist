<script setup>
defineProps({
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-tan-light text-primary px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
  >
    <slot />
  </button>
</template>
