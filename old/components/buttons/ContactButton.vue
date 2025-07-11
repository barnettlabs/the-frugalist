<script setup>
import { PhoneIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
	colorClass: {
		type: String,
		default: 'text-gray-200',
	},
	sizeClass: {
		type: String,
		default: 'h-5 w-5',
	},
})
</script>

<template>
	<NuxtLink to="/contact">
		<div
			class="cursor-pointer relative rounded-full p-1 hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white ml-2"
			:class="[props.colorClass, $attrs.class]"
		>
			<span class="sr-only">View updates</span>

			<span>
				<PhoneIcon
					class="hover:text-white"
					:class="[props.sizeClass]"
				/>
			</span>
		</div>
	</NuxtLink>
</template>

<style scoped>
/*  */
</style>
