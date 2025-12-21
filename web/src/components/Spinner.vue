<script setup lang="ts">
import { computed } from 'vue'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
type SpinnerColor = 'primary' | 'secondary' | 'accent' | 'white' | 'gray'

interface Props {
  size?: SpinnerSize
  color?: SpinnerColor
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
})

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

const colorClasses = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  accent: 'border-accent',
  white: 'border-white',
  gray: 'border-gray-900',
}

const classes = computed(() => [
  'animate-spin rounded-full border-b-2',
  sizeClasses[props.size],
  colorClasses[props.color],
])
</script>

<template>
  <div :class="classes" role="status" aria-label="Loading">
    <span class="sr-only">Loading...</span>
  </div>
</template>
