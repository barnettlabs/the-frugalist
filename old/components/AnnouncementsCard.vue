<script setup>
import Button from './buttons/Button.vue'

const props = defineProps({
	condensed: Boolean,
})

const { data, pending, error } = useFetch('/api/announcements')

const announcements = computed(() => data.value)
</script>

<template>
	<section aria-labelledby="announcements-title">
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="p-6">
				<CardTitle id="announcements-title">Announcements</CardTitle>

				<div class="mt-6 flow-root">
					<ul class="-my-5 divide-y divide-gray-200">
						<li
							v-for="announcement in announcements"
							:key="announcement.id"
							class="py-5"
						>
							<div
								class="relative focus-within:ring-2 focus-within:ring-cyan-500"
							>
								<h3 class="text-sm flex flex-row justify-between">
									<NuxtLink
										:href="announcement.href"
										class="hover:underline focus:outline-none font-semibold text-gray-800"
									>
										<!-- Extend touch target to entire panel -->
										<span
											class="absolute inset-0"
											aria-hidden="true"
										/>
										{{ announcement.title }}
									</NuxtLink>

									<div class="text-gray-400 text-right">
										<span class="hidden sm:inline-block">
											<!-- {format( new Date(announcement.modifiedOn), 'MMMM do, yyyy
											@ h:mm aaa' )} -->
										</span>

										<div class="sm:hidden flex flex-col">
											<span>
												<!-- {format( new Date(announcement.modifiedOn), 'MM-dd-yy'
												)} -->
											</span>
											<span>
												<!-- {format( new Date(announcement.modifiedOn), '@ h:mm aaa'
												)} -->
											</span>
										</div>
									</div>
								</h3>

								<p class="mt-1 text-sm text-gray-600 line-clamp-2">
									{{ announcement.message }}
								</p>
							</div>
						</li>
					</ul>
				</div>
				<div class="mt-6">
					<Button
						:disabled="!props.condensed"
						:label="props.condensed ? 'View All' : 'Load More'"
						@click="
							props.condensed ? goToAnnouncementsPage : loadMoreAnnouncements
						"
						class="w-full rounded-md bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm"
					/>
				</div>
			</div>
		</div>
	</section>
</template>
