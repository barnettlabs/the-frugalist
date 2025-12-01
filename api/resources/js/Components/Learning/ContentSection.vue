<script setup lang="ts">
interface Props {
  title: string
  icon?: any
}

defineProps<Props>()
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <component v-if="icon" :is="icon" class="h-6 w-6 text-primary" />
      <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
    </div>
    <div class="space-y-4">
      <slot />
    </div>
  </div>
</template>
