<script setup>
import { RouterLink } from 'vue-router';

defineProps({
	href: {
		type: String,
		required: true,
	},
});
</script>

<template>
	<RouterLink
		:to="href"
		class="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden"
	>
		<slot />
	</RouterLink>
</template>
