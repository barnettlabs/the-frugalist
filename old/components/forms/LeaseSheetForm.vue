<script setup lang="ts">
import type { ModelRef } from 'vue'
import Button from '../buttons/Button.vue'
import DateInput from '../inputs/DateInput.vue'
import TextInput from '../inputs/TextInput.vue'
import VehicleTypeInput from '../inputs/VehicleTypeInput.vue'
import { CheckIcon } from '@heroicons/vue/24/solid'
import { LEASE_FORM_FIELDS } from '~/enums/forms'

const props = defineProps({
	loading: Boolean,
	runCalculation: Function,
	onSaveSuccess: Function,
	onSaveError: Function,
	resetValues: Function,
	isNew: Boolean,
})

const formValues: ModelRef<{
	[key: string]: string | number | Date
}> = defineModel({
	default: {},
})

const saving = ref<boolean>(false)
const formAlerts = ref<any[]>([])

const onSubmit = async () => {
	formAlerts.value = []

	try {
		saving.value = true
		const response = await fetch(
			props.isNew
				? `/api/vehicleLeaseSheets`
				: `/api/vehicleLeaseSheets/${formValues.value.id}`,
			{
				method: props.isNew ? 'POST' : 'PUT',
				body: JSON.stringify(formValues.value),
			}
		)

		if (response.ok) {
			formAlerts.value.push({
				variant: 'success',
				message: 'Sheet saved successfully!',
			})
			const updatedSheet = await response.json()

			props.onSaveSuccess?.(updatedSheet)

			setTimeout(() => {
				formAlerts.value = []
			}, 2000)
		} else {
			props.onSaveError?.()
			formAlerts.value.push({
				variant: 'error',
				message: 'There was an error saving the sheet. Please try again.',
			})
		}
	} catch (err) {
		formAlerts.value.push({
			variant: 'error',
			message: 'There was an error saving the sheet. Please try again.',
		})
	} finally {
		saving.value = false
	}
}

// effects
watchEffect(() => {
	props.runCalculation?.(formValues)
})
</script>

<template>
	<div
		class="flex-1 bg-white shadow rounded-lg p-6 overflow-hidden"
		:class="[
			{
				'brightness-75 pointer-events-none': saving,
			},
		]"
	>
		<div
			:class="{
				'opacity-50': saving,
			}"
		>
			<h3 class="text-lg font-medium leading-6 text-gray-900">
				Lease Sheet Form
			</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">
				Let&apos;s get the details and make sure you&apos;re paying the right
				amount!
			</p>

			<form
				class="flex flex-col space-y-4 mt-4"
				@submit.prevent="onSubmit"
			>
				<VehicleTypeInput
					v-model="formValues[LEASE_FORM_FIELDS.VEHICLE_TYPE]"
				/>

				<TextInput
					label="Sheet Name"
					v-model="formValues[LEASE_FORM_FIELDS.SHEET_NAME]"
					:placeholder="`e.g. ${new Date().getFullYear()} Ram 1500 Big Horn`"
				/>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Dealership"
						v-model="formValues[LEASE_FORM_FIELDS.DEALERSHIP_NAME]"
						placeholder="CDJR of ..."
					/>
					<TextInput
						label="Sales Consultant"
						v-model="formValues[LEASE_FORM_FIELDS.SALES_CONSULTANT]"
						placeholder="John Doe"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Contact Email"
						v-model="formValues[LEASE_FORM_FIELDS.CONTACT_EMAIL]"
						type="email"
					/>
					<TextInput
						label="Contact Phone"
						v-model="formValues[LEASE_FORM_FIELDS.CONTACT_PHONE]"
						type="tel"
						parser="phone"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="MSRP *"
						decorator="currency"
						v-model="formValues[LEASE_FORM_FIELDS.MSRP]"
						parser="decimal"
					/>

					<TextInput
						label="Trade In"
						decorator="currency"
						parser="decimal"
						v-model="formValues[LEASE_FORM_FIELDS.TRADE_IN]"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Dealer Contribution"
						decorator="currency"
						v-model="formValues[LEASE_FORM_FIELDS.DEALER_CONTRIBUTION]"
						parser="decimal"
					/>

					<TextInput
						label="Lease Cash"
						decorator="currency"
						v-model="formValues[LEASE_FORM_FIELDS.LEASE_CASH]"
						parser="decimal"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Acquisition Fee"
						decorator="currency"
						v-model="formValues[LEASE_FORM_FIELDS.ACQUISITION_FEE]"
						parser="decimal"
					/>

					<TextInput
						label="Doc Fee"
						decorator="currency"
						v-model="formValues[LEASE_FORM_FIELDS.DOC_FEE]"
						parser="decimal"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Misc. Fees"
						decorator="currency"
						v-model="formValues[LEASE_FORM_FIELDS.MISC_FEES]"
						placeholder="0"
						parser="decimal"
					/>

					<TextInput
						label="Down Payment"
						decorator="currency"
						v-model="formValues[LEASE_FORM_FIELDS.DOWN_PAYMENT]"
						placeholder="0"
						parser="decimal"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Months *"
						type="number"
						v-model="formValues[LEASE_FORM_FIELDS.LEASE_TERM]"
						parser="int"
					/>

					<TextInput
						label="Sales Tax *"
						decorator="percent"
						v-model="formValues[LEASE_FORM_FIELDS.SALES_TAX_PERCENT]"
						placeholder=""
						parser="decimal"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Money Factor *"
						v-model="formValues[LEASE_FORM_FIELDS.MONEY_FACTOR]"
						parser="decimal"
					/>

					<TextInput
						label="Residual *"
						decorator="percent"
						v-model="formValues[LEASE_FORM_FIELDS.RESIDUAL_PERCENT]"
						parser="decimal"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<DateInput
						label="Start Date"
						v-model="formValues[LEASE_FORM_FIELDS.START_DATE]"
					/>
				</div>

				<hr />

				<Alerts
					:alerts="formAlerts"
					class="mt-6"
				/>

				<div class="flex flex-row space-x-4">
					<Button
						label="Reset"
						class="flex-1 py-4 bg-danger text-white"
						@click="props.resetValues"
					/>

					<Button
						type="submit"
						:loading="saving"
						class="flex-1 py-4"
					>
						<template #label>
							<span>Save Sheet</span>
						</template>
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>
