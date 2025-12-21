<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'
import { computed } from 'vue'

type AlertVariant = 'success' | 'warning' | 'danger' | 'info'

interface Props {
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const variantConfig = {
  success: {
    icon: CheckCircleIcon,
    bg: 'bg-success/10',
    border: 'border-success/20',
    iconColor: 'text-success',
    titleColor: 'text-success',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    iconColor: 'text-warning',
    titleColor: 'text-warning',
  },
  danger: {
    icon: XCircleIcon,
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    iconColor: 'text-danger',
    titleColor: 'text-danger',
  },
  info: {
    icon: InformationCircleIcon,
    bg: 'bg-info/10',
    border: 'border-info/20',
    iconColor: 'text-info',
    titleColor: 'text-info',
  },
}

const config = computed(() => variantConfig[props.variant])
</script>

<template>
  <div
    :class="[config.bg, config.border, 'border rounded-lg p-4 flex items-start gap-3']"
    role="alert"
  >
    <component
      :is="config.icon"
      :class="[config.iconColor, 'h-5 w-5 flex-shrink-0 mt-0.5']"
      aria-hidden="true"
    />
    <div class="flex-1 min-w-0">
      <p v-if="title" :class="[config.titleColor, 'font-medium']">{{ title }}</p>
      <div class="text-sm text-gray-600">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      @click="emit('dismiss')"
    >
      <span class="sr-only">Dismiss</span>
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
