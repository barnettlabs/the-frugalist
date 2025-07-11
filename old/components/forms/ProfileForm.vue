<script setup>
import TextInput from '~/components/inputs/TextInput.vue'
import Button from '../buttons/Button.vue'
import Alerts from '../Alerts.vue'

const user = useSupabaseUser()
const client = useSupabaseClient()

const editing = ref(false)
const loading = ref(false)
const saving = ref(false)

const formValues = reactive({
	firstName: user.value.user_metadata.firstName,
	lastName: user.value.user_metadata.lastName,
	email: user.value.email,
	phone: user.value.phone,
})

const formAlerts = ref([])

const onSubmit = async () => {
	formAlerts.value = []

	// client.from('profiles').upsert({
	// 	id: user.value.id,
	// 	first_name: formValues.firstName,
	// 	surname: formValues.surname,
	// 	email: formValues.email,
	// 	phone: formValues.phone,
	// })

	const { data, error } = await client.auth.updateUser({
		data: {
			firstName: formValues.firstName,
			lastName: formValues.lastName,
		},
		email: formValues.email,
		phone: formValues.phone,
	})

	if (error) {
		formAlerts.value.push({
			variant: 'error',
			message: error.message || 'Error',
		})
	} else {
		formAlerts.value.push({
			variant: 'success',
			message: 'Profile updated successfully!',
		})

		setTimeout(() => {
			formAlerts.value = []
		}, 2000)
	}
}
</script>

<template>
	<form @submit.prevent="onSubmit">
		<div class="mt-8 flex flex-col space-y-4">
			<TextInput
				label="First Name"
				v-model="formValues.firstName"
				:disabled="!editing"
			/>
			<TextInput
				label="Last Name"
				v-model="formValues.lastName"
				:disabled="!editing"
			/>

			<TextInput
				label="Email"
				type="email"
				v-model="formValues.email"
				:disabled="!editing"
			/>

			<!-- <TextInput
				label="Phone"
				type="tel"
				v-model="formValues.phone"
				:disabled="!editing"
				parser="phone"
			/> -->

			<Alerts
				:alerts="formAlerts"
				class="mt-6"
			/>

			<div
				class="flex flex-row space-x-2 mt-4"
				:class="[editing ? 'justify-end' : 'justify-start']"
			>
				<Button
					v-if="editing"
					:disabled="loading || saving"
					class="ms-2 text-dark bg-gray-200"
					@click="editing = false"
					label="Cancel"
				/>

				<Button
					v-if="editing"
					type="submit"
					:disabled="loading || saving"
					class="ms-2"
					:label="saving ? 'Saving...' : 'Save Changes'"
				/>

				<Button
					v-if="!editing"
					@click="editing = true"
					label="Edit"
				/>
			</div>
		</div>
	</form>
</template>

<style scoped>
/*  */
</style>
