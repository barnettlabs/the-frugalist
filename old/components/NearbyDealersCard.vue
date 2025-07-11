<script setup>
import Button from './buttons/Button.vue'

const props = defineProps({
	condensed: Boolean,
})

const nearbyDealers = [
	{
		name: 'BMW of Akron',
		distance: 4.1,
		imageUrl: 'https://pngimg.com/uploads/bmw_logo/bmw_logo_PNG19707.png',
		href: '#',
	},
	{
		name: 'Summit Toyota',
		distance: 5.3,
		imageUrl:
			'https://png.monster/wp-content/uploads/2021/03/pngwing.com-2-3691ef4e.png',
		href: '#',
	},
	{
		name: 'Cascade Subaru',
		distance: 10.2,
		imageUrl:
			'https://i.pinimg.com/originals/a8/68/9b/a8689bec0f5e1cea21d4ce3d69cab172.png',
		href: '#',
	},
	{
		name: 'Kia of Streetsboro',
		distance: 16.7,
		imageUrl: 'https://logos-world.net/wp-content/uploads/2021/03/Kia-Logo.png',
		href: '#',
	},
]
</script>

<template>
	<section aria-labelledby="dealers-nearby-title">
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="p-6">
				<CardTitle>Dealers Nearby</CardTitle>
				<h2 class="text-sm text-gray-400">(this feature is coming soon)</h2>

				<div class="mt-6 flow-root">
					<ul class="-my-5 divide-y divide-gray-200">
						<li
							v-for="dealer in nearbyDealers"
							:key="dealer.name"
							class="py-4"
						>
							<div class="flex items-center space-x-4">
								<div class="flex-shrink-0">
									<img
										class="w-8"
										:src="dealer.imageUrl"
										alt=""
									/>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-gray-900">
										{{ dealer.name }}
									</p>
									<p class="truncate text-sm text-gray-500">
										{{ dealer.distance }} miles away
									</p>
								</div>
								<div>
									<NuxtLink
										:href="dealer.href"
										class="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm font-medium leading-5 text-gray-700 shadow-sm hover:bg-gray-50"
									>
										View
									</NuxtLink>
								</div>
							</div>
						</li>
					</ul>
				</div>

				<div class="mt-6">
					<Button
						:disabled="!props.condensed"
						:label="props.condensed ? 'View All' : 'Load More'"
						@click="props.condensed ? goToNearbyDealersPage : loadMoreDealers"
						class="w-full rounded-md bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm"
					/>
				</div>
			</div>
		</div>
	</section>
</template>
