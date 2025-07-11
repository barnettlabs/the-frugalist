<script setup lang="ts">
import type { ModelRef } from 'vue'
import Button from '../buttons/Button.vue'
import DateInput from '../inputs/DateInput.vue'
import TextInput from '../inputs/TextInput.vue'
import { FINANCE_FORM_FIELDS } from '~/enums/forms'
import {
	ArrowTrendingDownIcon,
	CheckIcon,
	TrashIcon,
} from '@heroicons/vue/24/solid'
import VehicleTypeInput from '../inputs/VehicleTypeInput.vue'

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

	const finalFormValues = {
		...formValues.value,
		[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_JSON]: JSON.stringify(
			formValues.value[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS]
		),
	}

	// return

	delete finalFormValues[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS]

	try {
		saving.value = true
		const response = await fetch(
			props.isNew
				? `/api/vehicleFinanceSheets`
				: `/api/vehicleFinanceSheets/${finalFormValues.id}`,
			{
				method: props.isNew ? 'POST' : 'PUT',
				body: JSON.stringify(finalFormValues),
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

const addExtraPayment = () => {
	formValues.value[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS].push({
		[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_FIELDS.PAYMENT_AMOUNT]: 0,
		[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_FIELDS.START_MONTH]: 0,
		[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_FIELDS.END_MONTH]: 0,
	})
}

const removeExtraPayment = (index: number) => {
	const extraPayments =
		formValues.value[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS as never] || []
	extraPayments.splice(index, 1)

	formValues.value[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS as never] = extraPayments

	props.runCalculation?.(formValues)
}

// effects
watchEffect(() => {
	props.runCalculation?.(formValues)
})
</script>

<template>
	<div
		class="flex-1 bg-white shadow rounded-lg p-6"
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
				Finance Sheet Form
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
					v-model="formValues[FINANCE_FORM_FIELDS.VEHICLE_TYPE]"
				/>

				<TextInput
					label="Sheet Name"
					v-model="formValues[FINANCE_FORM_FIELDS.SHEET_NAME]"
					:placeholder="`e.g. ${new Date().getFullYear()} Ram 1500 Big Horn`"
				/>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Dealership"
						v-model="formValues[FINANCE_FORM_FIELDS.DEALERSHIP_NAME]"
						placeholder="CDJR of ..."
					/>
					<TextInput
						label="Sales Consultant"
						v-model="formValues[FINANCE_FORM_FIELDS.SALES_CONSULTANT]"
						placeholder="John Doe"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Contact Email"
						v-model="formValues[FINANCE_FORM_FIELDS.CONTACT_EMAIL]"
						type="email"
					/>
					<TextInput
						label="Contact Phone"
						v-model="formValues[FINANCE_FORM_FIELDS.CONTACT_PHONE]"
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
						v-model="formValues[FINANCE_FORM_FIELDS.MSRP]"
						placeholder="0"
						parser="decimal"
					/>

					<TextInput
						label="Fees"
						decorator="currency"
						parser="decimal"
						v-model="formValues[FINANCE_FORM_FIELDS.FEES]"
						placeholder="0"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Discounts"
						decorator="currency"
						v-model="formValues[FINANCE_FORM_FIELDS.DISCOUNTS]"
						placeholder="0"
						parser="decimal"
					/>

					<TextInput
						label="Rebates"
						decorator="currency"
						v-model="formValues[FINANCE_FORM_FIELDS.REBATES]"
						placeholder="0"
						parser="decimal"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Down Payment"
						decorator="currency"
						v-model="formValues[FINANCE_FORM_FIELDS.DOWN_PAYMENT]"
						placeholder="0"
						parser="decimal"
					/>

					<TextInput
						label="Months *"
						type="number"
						v-model="formValues[FINANCE_FORM_FIELDS.FINANCE_TERM]"
						parser="int"
						debug
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<TextInput
						label="Sales Tax *"
						decorator="percent"
						v-model="formValues[FINANCE_FORM_FIELDS.SALES_TAX_PERCENT]"
						placeholder=""
						parser="decimal"
					/>

					<TextInput
						label="Interest Rate *"
						decorator="percent"
						v-model="formValues[FINANCE_FORM_FIELDS.INTEREST_RATE]"
						placeholder=""
						parser="decimal"
					/>
				</div>

				<div
					class="flex flex-col items-stretch space-y-8 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					<DateInput
						label="Start Date"
						v-model="formValues[FINANCE_FORM_FIELDS.START_DATE]"
					/>
				</div>

				<hr />

				<div>
					<h3 class="text-lg font-medium leading-6 text-gray-900">
						Extra Payments
					</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">
						Put a little extra towards your loan each month to save on interest.
						Add an extra payment and then visit the amortization section to see
						how much you can save.
					</p>

					<div v-if="formValues[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS]?.length">
						<div
							v-for="(_, extraPaymentIndex) in formValues[
								FINANCE_FORM_FIELDS.EXTRA_PAYMENTS
							]"
							key="{field.id}"
							class="flex flex-row items-center mt-4"
						>
							<TextInput
								label="Payment"
								decorator="currency"
								v-model="
									formValues[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS][
										extraPaymentIndex
									][FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_FIELDS.PAYMENT_AMOUNT]
								"
								placeholder=""
								parser="decimal"
								@change="runCalculation?.(formValues)"
							/>

							<div class="w-2" />

							<TextInput
								label="Start Month"
								v-model="
									formValues[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS][
										extraPaymentIndex
									][FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_FIELDS.START_MONTH]
								"
								placeholder=""
								type="number"
								@change="runCalculation?.(formValues)"
							/>

							<div class="w-2" />

							<TextInput
								label="End Month"
								v-model="
									formValues[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS][
										extraPaymentIndex
									][FINANCE_FORM_FIELDS.EXTRA_PAYMENTS_FIELDS.END_MONTH]
								"
								placeholder=""
								type="number"
								@change="runCalculation?.(formValues)"
							/>

							<TrashIcon
								class="w-10 p-2 rounded-full bg-black bg-opacity-0 hover:bg-opacity-10 ml-2 text-danger cursor-pointer"
								@click="removeExtraPayment(extraPaymentIndex)"
							/>
						</div>
					</div>

					<div
						v-else
						class="w-full flex flex-row justify-center text-gray-400 mt-8 select-none"
					>
						<span class="-scale-x-100 mr-4">
							<ArrowTrendingDownIcon class="w-5 -ml-2.5 animate-bounce" />
						</span>
						<span>Give it a try!</span>
					</div>
				</div>

				<Alerts
					:alerts="formAlerts"
					class="mt-6"
				/>

				<div class="flex flex-row space-x-4">
					<Button
						label="Add Payment"
						variant="neutral"
						class="flex-1 py-4"
						@click="addExtraPayment"
					/>

					<Button
						label="Reset"
						variant="danger"
						class="flex-1 py-4"
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
