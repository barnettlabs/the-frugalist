<script setup lang="ts">
interface Props {
  keyword: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
    <span>{{ keyword }}</span>
    <span v-if="description" class="text-xs text-gray-600 hidden sm:inline">- {{ description }}</span>
  </div>
</template>
