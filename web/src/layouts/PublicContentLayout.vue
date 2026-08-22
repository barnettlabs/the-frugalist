<script setup lang="ts">
/**
 * Layout for pages that are publicly indexable but also part of the signed-in
 * app: the guides and the calculators.
 *
 * Signed-in visitors keep the full app chrome; guests and crawlers get the
 * marketing shell. Both wrapped layouts render their own `<RouterView />`, so
 * the child route resolves identically either way.
 *
 * The router's `beforeEach` awaits `authStore.initialize()`, so `isAuthenticated`
 * is already settled by first render — the layout does not flip after mount.
 */
import { computed } from 'vue';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import GuestLayout from '@/layouts/GuestLayout.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const layout = computed(() => (authStore.isAuthenticated ? AuthenticatedLayout : GuestLayout));
</script>

<template>
	<component :is="layout" />
</template>
