<script setup lang="ts">
import logoDefault from '@shared/assets/logos/logo.png'
import logoPadded from '@shared/assets/logos/logo-padded.png'
import logoOutline from '@shared/assets/logos/logo-outline.png'

interface Props {
  variant?: 'default' | 'padded' | 'outline' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  class: '',
})

const logoSrc = {
  default: logoDefault,
  padded: logoPadded,
  outline: logoOutline,
  white: logoPadded, // Use padded for white variant, apply filter
}

const sizeClass = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12',
  '2xl': 'h-16',
}
</script>

<template>
  <img
    :src="logoSrc[props.variant]"
    alt="TheFrugalist"
    :class="[
      sizeClass[props.size],
      'w-auto',
      props.variant === 'white' && 'brightness-0 invert',
      props.class
    ]"
  />
</template>
