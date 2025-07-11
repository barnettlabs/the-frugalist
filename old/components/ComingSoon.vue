<script setup>
const router = useRouter()
</script>

<template>
	<main
		class="absolute top-0 right-0 bottom-0 left-0 bg-cover bg-top sm:bg-top flex flex-col justify-center items-center"
	>
		<img
			src="https://images.unsplash.com/photo-1567789884554-0b844b597180?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2370&q=80"
			class="absolute top-0 right-0 bottom-0 left-0 w-full h-full object-cover"
			alt="car being manufactured and welded by robotic arm"
		/>
		<div
			class="w-full h-full flex flex-col justify-center items-center z-10"
			style="backdrop-filter: blur(10px)"
		>
			<h1 class="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">
				Coming Soon!
			</h1>
			<p class="mt-2 text-lg font-medium text-white text-opacity-75">
				Our developers are hard at work building great new features
			</p>
			<div class="mt-6 space-x-4">
				<button
					class="inline-flex items-center rounded-md border border-transparent bg-white bg-opacity-75 px-4 py-2 text-sm font-medium text-black"
					@click="router.back()"
				>
					Go Back
				</button>
				<NuxtLink
					href="/"
					replace
				>
					<button
						class="inline-flex items-center rounded-md border border-transparent bg-white bg-opacity-75 px-4 py-2 text-sm font-medium text-black"
					>
						Go Home
					</button>
				</NuxtLink>
			</div>
		</div>
	</main>
</template>
