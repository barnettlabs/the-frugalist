<script setup>
import { PlusIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const route = useRoute()
</script>

<template>
	<NuxtLink
		:href="`${route.path}/create`"
		class="text-sm font-medium rounded-md px-3 py-2 flex flex-row items-center bg-primary text-white sm:bg-white mt-4 sm:bg-white sm:bg-opacity-0 sm:hover:bg-opacity-10 text-white sm:mt-0"
	>
		<PlusIcon
			class="h-6 w-6 mr-0 sm:mr-2"
			aria-hidden="true"
		/>
		<span class="hidden sm:block">Add Sheet</span>
	</NuxtLink>
</template>
