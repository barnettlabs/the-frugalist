<script setup>
definePageMeta({
	middleware: 'auth',
})

// imports
import LeaseCalculationDetails from '~/components/calculations/lease/LeaseCalculationDetails.vue'
import LeaseSheetForm from '~/components/forms/LeaseSheetForm.vue'
import SwitchInput from '~/components/inputs/SwitchInput.vue'
import SheetLoading from '~/components/sheets/SheetLoading.vue'
import { VEHICLE_TYPES } from '~/enums/db'
import { LEASE_FORM_FIELDS } from '~/enums/forms'
import { runLeasingCalculations } from '~/utils/calculators/leaseCalculator'

// variables
const route = useRoute()
const router = useRouter()

const sheetId = computed(() => route.params.id)
const isNew = computed(() => sheetId.value === 'create')

const showAdvancedCalculations = ref(false)
const calculations = ref(null)

const {
	data: sheet,
	pending,
	refresh,
} = useFetch(`/api/vehicleLeaseSheets/${sheetId.value}`)

const editedSheet = ref(null)

watchEffect(() => {
	if (sheet.value?.id) {
		resetValues()
	} else if (isNew.value) {
		editedSheet.value = {
			[LEASE_FORM_FIELDS.START_DATE]: new Date(),
			[LEASE_FORM_FIELDS.VEHICLE_TYPE]: VEHICLE_TYPES.CAR,
		}
	}
})

// functions
function runCalculation() {
	const values = { ...editedSheet.value }

	try {
		calculations.value = runLeasingCalculations(values)
	} catch (error) {
		console.log('calculation error', error)
	}
}

function resetValues() {
	editedSheet.value = { ...sheet.value }
}

function onSaveSuccess(updatedSheet) {
	if (isNew) {
		// redirect to newly created sheet page (replace ID in route params)
		router.replace(`/estimates/leasing/${updatedSheet.id}`)
	} else {
		// update local variable with response from API
		editedSheet.value = updatedSheet
	}
}
</script>

<template>
	<div>
		<main class="-mt-24 pb-8 flex-1">
			<div
				v-if="editedSheet"
				class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"
			>
				<h1 class="sr-only">Lease Sheet</h1>

				<!-- Main 3 column grid -->
				<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-8">
					<!-- Left column -->
					<div class="grid grid-cols-1 gap-4">
						<div class="flex flex-col items-stretch sm:flex-row">
							<h2 class="sr-only">Lease Sheet Form</h2>

							<LeaseSheetForm
								v-if="editedSheet"
								v-model="editedSheet"
								:loading="pending"
								:is-new="isNew"
								:runCalculation="runCalculation"
								:on-save-success="onSaveSuccess"
								:reset-values="resetValues"
							/>
						</div>
					</div>

					<!-- Right column -->
					<div class="grid grid-cols-1 gap-4">
						<section aria-labelledby="calculations-title">
							<div class="overflow-hidden rounded-lg bg-white shadow">
								<div class="p-6">
									<div
										class="flex justify-between items-center"
										id="calculations-title"
									>
										<span class="text-base font-medium text-gray-900">
											Calculations
										</span>

										<SwitchInput
											v-model="showAdvancedCalculations"
											label="Advanced View"
										/>
									</div>

									<div
										v-if="pending"
										class="flex justify-center items-center pt-10 pb-4"
									>
										<Spinner
											:width="50"
											:height="50"
										/>
									</div>

									<!-- <div
										v-else-if="!calculations || !calculations.leasePayment"
										class="flex justify-center items-center pt-5 pb-4"
									>
										<span class="text-gray-500 text-center">
											Calculations will appear here after you have filled out
											any required fields in the form
										</span>
									</div> -->

									<LeaseCalculationDetails
										v-else
										:sheet="calculations"
										:showAdvanced="showAdvancedCalculations"
									/>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>

			<div
				v-else-if="pending"
				class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"
			>
				<SheetLoading />
			</div>

			<div
				v-else
				class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"
			>
				<div
					class="min-h-[100px] sm:min-h-[225px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-200 flex flex-col items-center justify-center"
				>
					<p class="text-sm font-medium text-gray-400 mt-4">
						404 - Sheet not found
					</p>
				</div>
			</div>
		</main>
	</div>
</template>
