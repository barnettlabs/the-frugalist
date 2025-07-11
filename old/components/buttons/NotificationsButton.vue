<script setup>
import { BellIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
	colorClass: {
		type: String,
		default: 'text-gray-200',
	},
	sizeClass: {
		type: String,
		default: 'h-6 w-6',
	},
})

const notifications = ref([])
</script>

<template>
	<NuxtLink
		to="/contact"
		class=""
	>
		<div
			class="cursor-pointer relative rounded-full p-1 hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white ml-2"
			:class="[props.colorClass, $attrs.class]"
		>
			<span class="sr-only">View updates</span>

			<span>
				<BellIcon
					class="hover:text-white"
					:class="[props.sizeClass]"
				/>
			</span>

			<span
				v-if="notifications.length"
				class="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"
			/>
		</div>
	</NuxtLink>
</template>

<style scoped>
/*  */
</style>
