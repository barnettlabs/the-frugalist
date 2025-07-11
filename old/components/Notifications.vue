<script setup>
import Button from './buttons/Button.vue'

const notifications = ref([])
const loading = ref(false)
</script>

<template>
	<section aria-labelledby="updates-title">
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="p-6">
				<!-- <CardTitle id='updates-title'>Notifications</CardTitle> -->

				<div
					v-if="notifications.length"
					class="mt-6 flow-root"
				>
					<ul class="-my-5 divide-y divide-gray-200">
						<li
							v-for="notification in notifications"
							:key="notification.id"
							class="py-5"
						>
							<div
								class="relative focus-within:ring-2 focus-within:ring-cyan-500"
							>
								<h3 class="text-sm flex flex-row justify-between">
									<span
										class="hover:underline focus:outline-none font-semibold text-gray-800"
									>
										<span
											class="absolute inset-0"
											aria-hidden="true"
										/>
										{{ notification.title }}
									</span>

									<div class="text-gray-400 text-right">
										<span class="hidden sm:inline-block">
											<!-- {format(
                                new Date(notification.modifiedOn),
                                'MMMM do, yyyy @ h:mm aaa'
                              )} -->
										</span>

										<div class="sm:hidden flex flex-col">
											<span>
												<!-- {format(
                                  new Date(notification.modifiedOn),
                                  'MM-dd-yy'
                                )} -->
											</span>
											<span>
												<!-- {format(
                                  new Date(notification.modifiedOn),
                                  '@ h:mm aaa'
                                )} -->
											</span>
										</div>
									</div>
								</h3>
								<p class="mt-1 text-sm text-gray-600 line-clamp-2">
									{{ notification.description }}
								</p>
							</div>
						</li>
					</ul>
				</div>

				<div v-else-if="loading"></div>

				<div
					v-else
					class="mt-6 text-sm text-gray-600 line-clamp-2 text-center"
				>
					<div class="text-3xl">👍</div>
					<div class="mt-2">
						There are no notifications for you at this time.
					</div>
				</div>

				<div class="mt-6">
					<Button
						disabled
						:label="condensed ? 'View All' : 'Load More'"
						@click="condensed ? goToNotificationsPage : loadMoreNotifications"
						class="w-full rounded-md bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm"
					/>
				</div>
			</div>
		</div>
	</section>
</template>
