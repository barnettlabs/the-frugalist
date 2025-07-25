<script setup lang="ts">
import { computed } from 'vue'
import FoxLogo from '@/../assets/logos/fox-logo.svg'

interface Props {
  variant?: 'white' | 'black'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'black',
  class: 'h-8 w-auto',
})
</script>

<template>
  <!-- <img :src="logoSrc" :class="props.class" alt="Sneaky Salesman Logo" loading="lazy" /> -->
  <FoxLogo :class="[props.variant === 'white' ? 'fill-white' : 'fill-black', props.class]" />
</template>
