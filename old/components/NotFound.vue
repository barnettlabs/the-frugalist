<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
const router = useRouter()
</script>

<template>
	<main
		class="absolute top-0 right-0 bottom-0 left-0 bg-cover bg-top sm:bg-top flex flex-col justify-center"
	>
		<img
			src="https://images.unsplash.com/photo-1537090357686-51aaa968f2ab?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2398&q=80"
			class="absolute top-0 right-0 bottom-0 left-0 w-full h-full object-cover"
			alt="car stuck in between two walls facing away from the camera"
		/>
		<div
			class="w-full h-full flex flex-col justify-end pb-12 lg:pb-12 items-center z-10 px-4"
		>
			<p
				class="text-3xl lg:text-5xl font-semibold text-white text-opacity-50 text-center"
			>
				404
			</p>
			<h1
				class="mt-2 text-2xl sm:text-6x lg:text-4xl font-bold tracking-tight text-white text-center"
			>
				Uh oh! I think you’re lost.
			</h1>
			<p
				class="mt-2 text-sm lg:text-lg font-medium text-white text-opacity-75 text-center"
			>
				It looks like the page you’re looking for doesn't exist.
			</p>
			<div class="mt-6 flex space-x-4">
				<button
					class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white"
					@click="router.back()"
				>
					<ChevronLeftIcon class="w-6 h-6" />
					<span>Back</span>
				</button>

				<NuxtLink
					href="/"
					replace=""
				>
					<button
						class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white"
					>
						Home
						<ChevronRightIcon class="w-6 h-6" />
					</button>
				</NuxtLink>
			</div>
		</div>
	</main>
</template>
