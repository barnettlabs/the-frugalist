<script setup>
definePageMeta({
	middleware: 'auth',
})

import SheetLoading from '~/components/sheets/SheetLoading.vue'
import SheetEmpty from '~/components/sheets/SheetEmpty.vue'
import SheetSummary from '~/components/sheets/SheetSummary.vue'
import CreateSheetButton from '~/components/buttons/CreateSheetButton.vue'

const {
	data: vehicleLeaseSheets,
	pending,
	refresh,
} = useFetch('/api/vehicleLeaseSheets')

const route = useRoute()
</script>

<template>
	<main class="-mt-24 pb-8 flex-1">
		<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
			<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
				<!-- <nav
					class="flex flex-1 sm:mt-0 space-x-4 flex-col sm:flex-row items-center sm:justify-center lg:justify-end col-span-1 lg:col-span-2"
				>
					<CreateSheetButton />
				</nav> -->
			</div>

			<div
				class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8"
			>
				<div class="grid grid-cols-1 gap-2 lg:col-span-2">
					<section aria-labelledby="dream-garage-overview-title">
						<ul class="grid grid-cols-1 gap-8 sm:grid-cols-2">
							<SheetLoading v-if="pending" />

							<NuxtLink
								v-else-if="!vehicleLeaseSheets.length"
								:href="`${route.path}/create`"
							>
								<SheetEmpty />
							</NuxtLink>

							<div
								class="contents"
								v-else
							>
								<li
									v-for="(sheet, sheetIndex) in vehicleLeaseSheets"
									:key="sheet.id"
								>
									<SheetSummary
										:sheet="sheet"
										:index="sheetIndex"
										sheetType="LEASE"
										:on-delete-success="refresh"
									/>
								</li>

								<NuxtLink :href="`${route.path}/create`">
									<SheetEmpty />
								</NuxtLink>
							</div>
						</ul>
					</section>
				</div>

				<div class="grid grid-cols-1 gap-4">
					<Notifications />
				</div>
			</div>
		</div>
	</main>
</template>
