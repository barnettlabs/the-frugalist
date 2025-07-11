<script setup>
import { PlusIcon } from '@heroicons/vue/24/solid'
</script>

<template>
	<div
		class="h-full min-h-[100px] sm:min-h-[225px] col-span-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-200 flex flex-col items-center justify-center cursor-pointer"
	>
		<PlusIcon
			class="h-6 w-6 text-gray-400 mb-0 sm:mr-0 sm:mb-2"
			aria-hidden="true"
		/>

		<p class="font-medium text-gray-400">Create a new sheet</p>
	</div>
</template>
