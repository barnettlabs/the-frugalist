<script setup>
const props = defineProps({
	sheet: Object,
	sheetType: String,
	index: Number,
	deleteRequest: Function,
	onDeleteError: Function,
	onDeleteSuccess: Function,
	extendedHref: {
		type: String,
		default: '',
	},
})

import { EnvelopeIcon, PhoneIcon } from '@heroicons/vue/24/solid'
import DeleteButton from '../buttons/DeleteButton.vue'
import { VEHICLE_TYPES } from '~/enums/db'

const router = useRouter()
const route = useRoute()
</script>

<template>
	<NuxtLink :href="`${route.path}${props.extendedHref}/${props.sheet.id}`">
		<div
			class="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow cursor-pointer transition-transform"
		>
			<div class="flex w-full items-center justify-between space-x-6 py-3 px-6">
				<div class="flex-1 truncate">
					<div class="flex items-center space-x-3">
						<p
							:title="props.sheet.sheetName"
							class="truncate text-sm font-medium text-gray-900"
						>
							{{ props.sheet.sheetName || `Sheet ${props.index + 1}` }}
						</p>
					</div>
					<p
						v-if="props.sheet.salesConsultant || props.sheet.dealershipName"
						:title="`${props.sheet.salesConsultant} @ ${props.sheet.dealershipName}`"
						class="mt-1 truncate text-sm text-gray-500"
					>
						{{
							!!props.sheet.salesConsultant
								? `${props.sheet.salesConsultant} `
								: ''
						}}
						{{
							!!props.sheet.dealershipName
								? `@ ${props.sheet.dealershipName}`
								: ''
						}}
					</p>
				</div>

				<div
					class="h-12 w-16 flex justify-center items-center rounded-md overflow-hidden bg-gray-100"
				>
					<img
						class="w-8/12 opacity-60"
						:src="
							props.sheet.vehicleType === VEHICLE_TYPES.TRUCK
								? '/icons/vehicles/truck.png'
								: props.sheet.vehicleType === VEHICLE_TYPES.SUV
								? '/icons/vehicles/jeep.png'
								: '/icons/vehicles/car.png'
						"
						alt="car preview"
					/>
				</div>
			</div>

			<div class="w-full px-6 table border-spacing-y-2">
				<div class="table-row truncate text-sm text-gray-500">
					<span class="table-cell text-dark">MSRP:</span>
					<span class="table-cell text-right">
						$
						<!-- {{ props.sheet.msrp?.toLocaleString('en-US') }} -->
						{{
							props.sheet.msrp?.toLocaleString('en', {
								useGrouping: true,
								minimumFractionDigits: 2,
							})
						}}
					</span>
				</div>

				<div class="table-row truncate text-sm text-gray-500">
					<span class="table-cell text-dark">Down Payment:</span>
					<span class="table-cell text-right">
						$
						{{
							props.sheet.downPayment?.toLocaleString('en', {
								useGrouping: true,
								minimumFractionDigits: 2,
							})
						}}
					</span>
				</div>

				<div class="table-row truncate text-sm text-gray-500">
					<span class="table-cell text-dark">Monthly Payment:</span>
					<span class="table-cell text-right">
						$
						{{
							props.sheet.monthlyPayment?.toLocaleString('en', {
								useGrouping: true,
								minimumFractionDigits: 2,
							})
						}}
					</span>
				</div>
			</div>

			<div>
				<div
					class="flex divide-x divide-gray-200 py-4"
					@click.stop
				>
					<div
						class="flex flex-1 justify-center"
						v-if="props.sheet.contactEmail"
					>
						<NuxtLink
							:href="`mailto:${props.sheet.contactEmail}`"
							class="flex items-center px-2"
						>
							<EnvelopeIcon
								class="h-5 w-5 text-gray-400 hover:text-blue-600"
								aria-hidden="true"
							/>
						</NuxtLink>
					</div>

					<div
						class="flex flex-1 justify-center"
						v-if="props.sheet.contactPhone"
					>
						<NuxtLink
							:href="`tel:${sheet.contactPhone}`"
							class="flex items-center px-2 h-full"
						>
							<PhoneIcon
								class="h-5 w-5 text-gray-400 hover:text-green-600"
								aria-hidden="true"
							/>
						</NuxtLink>
					</div>

					<div class="flex flex-1 justify-center">
						<DeleteButton
							:name="sheet.sheetName"
							:id="sheet.id"
							:deletePath="
								props.sheetType === 'FINANCE'
									? `/api/vehicleFinanceSheets/${sheet.id}`
									: props.sheetType === 'LEASE'
									? `/api/vehicleLeaseSheets/${sheet.id}`
									: ''
							"
							:on-success="onDeleteSuccess"
							:on-error="onDeleteError"
						/>
					</div>
				</div>
			</div>
		</div>
	</NuxtLink>
</template>
