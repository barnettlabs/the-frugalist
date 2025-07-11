<script setup>
const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
})

const router = useRouter()

const path = computed(() => {
	return router.currentRoute.value.path
})

const isCurrentPage = computed(() =>
	props.item.exact
		? path.value === props.item.href
		: path.value.startsWith(props.item.href)
)
</script>

<template>
	<NuxtLink :href="item.href">
		<button
			type="button"
			class="text-sm font-medium rounded-md bg-white px-3 py-2"
			:class="[
				isCurrentPage
					? 'text-white bg-opacity-20 hover:bg-opacity-20 pointer-events-none'
					: 'text-gray-200 bg-opacity-0 hover:bg-opacity-10',
			]"
			:aria-current="isCurrentPage ? 'page' : undefined"
		>
			{{ item.name }}
		</button>
	</NuxtLink>
</template>
