<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import logoBlue from '@shared/assets/logos/logo-blue.png'
import logoWhite from '@shared/assets/logos/logo-white.png'

interface Props {
  variant?: 'default' | 'white' | 'auto'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'lg',
  class: '',
})

const isDark = ref(false)

const checkDarkMode = () => {
  isDark.value =
    document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark'
}

let observer: MutationObserver | null = null

onMounted(() => {
  checkDarkMode()
  observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

const logoSrc = computed(() => {
  if (props.variant === 'auto') {
    return isDark.value ? logoWhite : logoBlue
  }
  return props.variant === 'white' ? logoWhite : logoBlue
})

const sizeClass = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12',
  '2xl': 'h-16',
}
</script>

<template>
  <img :src="logoSrc" alt="TheFrugalist" :class="[
    sizeClass[props.size],
    'w-auto',
    props.class
  ]" />
</template>
