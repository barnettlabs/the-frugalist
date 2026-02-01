<script setup lang="ts">
import logoBlue from '@shared/assets/logos/logo-blue.png'
import logoWhite from '@shared/assets/logos/logo-white.png'
import logoPadded from '@shared/assets/logos/logo-padded.png'
import logoOutline from '@shared/assets/logos/logo-outline.png'

interface Props {
  variant?: 'default' | 'padded' | 'outline' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'lg',
  class: '',
})

const logoSrc = {
  default: logoBlue,
  white: logoWhite,
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
  <img :src="logoSrc[props.variant]" alt="TheFrugalist" :class="[
    sizeClass[props.size],
    'w-auto',
    props.class
  ]" />
</template>
