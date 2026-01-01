<script setup lang="ts">
interface Props {
  variant?: 'white' | 'black' | 'primary' | 'accent'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  class: '',
})

const colorClass = {
  white: 'text-white',
  black: 'text-black',
  primary: 'text-primary',
  accent: 'text-accent',
}

const sizeClass = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}
</script>

<template>
  <span
    :class="[
      'font-medium tracking-tight select-none',
      colorClass[props.variant],
      sizeClass[props.size],
      props.class
    ]"
  >
    thefrugalist
  </span>
</template>
