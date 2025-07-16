<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    variant?: 'white' | 'black';
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'black',
    class: 'h-8 w-auto'
});

const logoSrc = computed(() => {
    return props.variant === 'white' 
        ? '/logos/sneaky-salesman-logo-white.png'
        : '/logos/sneaky-salesman-logo-black.png';
});
</script>

<template>
    <img 
        :src="logoSrc" 
        :class="props.class"
        alt="Sneaky Salesman Logo"
        loading="lazy"
    />
</template>
