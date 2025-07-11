<script setup>
definePageMeta({
	middleware: 'auth',
})

// imports
import FinanceSheetForm from '~/components/forms/FinanceSheetForm.vue'
import SwitchInput from '~/components/inputs/SwitchInput.vue'
import SheetLoading from '~/components/sheets/SheetLoading.vue'
import { FINANCE_FORM_FIELDS } from '~/enums/forms'
import { runFinancingCalculations } from '~/utils/calculators/financeCalculator'
import { AMORTIZATION_MODES } from '~/enums/finance'
import FinanceCalculationDetails from '~/components/calculations/finance/FinanceCalculationDetails.vue'
import { VEHICLE_TYPES } from '~/enums/db'
import FinanceAmortizationTable from '~/components/calculations/finance/FinanceAmortizationTable.vue'
import FinanceAmortizationTimeline from '~/components/calculations/finance/FinanceAmortizationTimeline.vue'
import FinanceAmortizationPieChart from '~/components/calculations/finance/FinanceAmortizationPieChart.vue'

// variables
const route = useRoute()
const router = useRouter()

const sheetId = computed(() => route.params.id)
const isNew = computed(() => sheetId.value === 'create')

const showAdvancedCalculations = ref(false)
const calculations = ref(null)
const selectedAmortizationMode = ref(AMORTIZATION_MODES.PIE)

const {
	data: sheet,
	pending,
	refresh,
} = useFetch(`/api/vehicleFinanceSheets/${sheetId.value}`)

const editedSheet = ref(null)

watchEffect(() => {
	if (sheet.value?.id) {
		resetValues()
	} else if (isNew.value) {
		editedSheet.value = {
			[FINANCE_FORM_FIELDS.START_DATE]: new Date(),
			[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS]: [],
			[FINANCE_FORM_FIELDS.VEHICLE_TYPE]: VEHICLE_TYPES.CAR,
		}
	}
})

// functions
function runCalculation() {
	const values = { ...editedSheet.value }

	try {
		calculations.value = runFinancingCalculations(values)
	} catch (error) {
		console.log('calculation error', error)
	}
}

function resetValues() {
	let extraPayments = []

	try {
		extraPayments = sheet.value?.[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_JSON]
			? JSON.parse(sheet.value[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_JSON])
			: []
	} catch (error) {}

	editedSheet.value = {
		...sheet.value,
		[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS]: extraPayments,
	}
}

function onSaveSuccess(updatedSheet) {
	if (isNew) {
		// redirect to newly created sheet page (replace ID in route params)
		router.replace(`/estimates/financing/${updatedSheet.id}`)
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
				<h1 class="sr-only">Finance Sheet</h1>

				<!-- Main 3 column grid -->
				<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-8">
					<!-- Left column -->
					<div class="grid grid-cols-1 gap-4">
						<div class="flex flex-col items-stretch sm:flex-row">
							<h2 class="sr-only">Finance Sheet Form</h2>

							<FinanceSheetForm
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

									<FinanceCalculationDetails
										v-else
										:sheet="calculations"
										:showAdvanced="showAdvancedCalculations"
									/>
								</div>
							</div>
						</section>

						<section aria-labelledby="amoritzation-title">
							<div class="overflow-hidden rounded-lg bg-white shadow">
								<div class="p-6">
									<h2
										class="text-base font-medium text-gray-900"
										id="amoritzation-title"
									>
										Amortization
									</h2>

									<div class="flex flex-row mt-4">
										<button
											v-for="mode in Object.values(AMORTIZATION_MODES).map(
												(mode) => ({ title: mode, id: mode })
											)"
											type="button"
											key="{mode}"
											class="text-sm font-medium rounded-md bg-black flex-1 px-2 sm:px-5 py-2 mx-2 first:ml-0 last:mr-0"
											:class="[
												mode.id === selectedAmortizationMode
													? 'text-white bg-opacity-80 pointer-events-none'
													: 'text-gray-600 bg-opacity-0 hover:bg-opacity-10',
											]"
											@click="selectedAmortizationMode = mode.id"
										>
											{{ mode.title }}
										</button>
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

									<div
										v-else-if="!calculations?.baseAmortization"
										class="flex justify-center items-center pt-10 pb-4"
									>
										<span class="text-gray-500 text-center">
											Data will appear here after you have filled out any
											required fields in the form
										</span>
									</div>

									<div
										v-else
										class="mt-8 overflow-x-scroll"
									>
										<FinanceAmortizationTable
											v-if="
												selectedAmortizationMode === AMORTIZATION_MODES.TABLE
											"
											:sheet="calculations"
										/>
										<FinanceAmortizationTimeline
											v-if="
												selectedAmortizationMode === AMORTIZATION_MODES.TIMELINE
											"
											:sheet="calculations"
										/>

										<FinanceAmortizationPieChart
											v-if="selectedAmortizationMode === AMORTIZATION_MODES.PIE"
											:sheet="calculations"
										/>
									</div>
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
