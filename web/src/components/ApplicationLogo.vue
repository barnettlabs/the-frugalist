<script setup lang="ts">
import FoxLogo from '@/../assets/logos/sneaky-salesman/fox-logo.svg'

interface Props {
  variant?: 'white' | 'black' | 'primary'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'black',
  class: 'h-8 w-auto',
})

const fillClass = {
  white: 'fill-white',
  black: 'fill-black',
  primary: 'fill-primary',
}
</script>

<template>
  <FoxLogo :class="[fillClass[props.variant], props.class]" />
</template>
