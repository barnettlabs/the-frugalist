<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

const variantClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary-dark',
  accent: 'bg-accent/10 text-accent-dark',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-gray-100 text-gray-600',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-3 py-1',
  lg: 'text-sm px-3 py-1',
}

const classes = computed(() => [
  variantClasses[props.variant],
  sizeClasses[props.size],
  'inline-flex items-center rounded-full font-medium',
])
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
