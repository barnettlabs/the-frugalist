<script setup>
import TextInput from '~/components/inputs/TextInput.vue'
import Button from '../buttons/Button.vue'
import Alerts from '../Alerts.vue'
import { formatPhoneNumber } from '~/utils/formatting'

const router = useRouter()
const client = useSupabaseClient()

const formValues = reactive({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	password: '',
	confirmPassword: '',
})
const formAlerts = ref([])
const isSuccess = ref(false)
const isLoading = ref(false)

const onSubmit = async () => {
	formAlerts.value = []
	isLoading.value = true
	const { firstName, lastName, email, phone, password, confirmPassword } =
		formValues

	if (password !== confirmPassword) {
		formAlerts.value.push({
			variant: 'error',
			message: "Passwords don't match!",
		})
		return
	}

	if (
		!firstName ||
		!lastName ||
		!email ||
		// !phone ||
		!password ||
		!confirmPassword
	) {
		formAlerts.value.push({
			variant: 'error',
			message: 'Please provide all information',
		})
		return
	}

	const { error, data } = await client.auth.signUp({
		email,
		password,
		options: {
			data: {
				firstName,
				lastName,
				email,
				// phone,
				avatarUrl:
					'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp',
			},
			emailRedirectTo: 'http://localhost:3000/login',
		},
	})

	if (error) {
		formAlerts.value.push({
			variant: 'error',
			message: error.message,
		})
	} else {
		// formAlerts.value.push({
		// 	variant: 'warning',
		// 	message: 'An account with that email already exists. Please login.',
		// })
	}

	isLoading.value = false
	isSuccess.value = true
}
</script>

<template>
	<div
		class="z-10 p-6 md:p-12 rounded-lg max-w-2xl h-auto text-center md:text-left"
	>
		<div v-if="isSuccess">
			<div class="text-3xl md:text-5xl text-white font-bold mb-6">
				Check your email!
			</div>
			<div class="text-gray-400 text-lg mb-8">
				We've sent you a verification email. Please check your inbox and click
				the link to verify your account.
			</div>
			<div class="text-gray-400 text-sm">
				Didn't receive the email? Check your spam folder or
				<button
					@click="isSuccess = false"
					class="text-blue-400 hover:text-blue-300 underline"
				>
					try again
				</button>
			</div>
		</div>
		<div v-else>
			<div class="mb-4">
				<div class="text-3xl md:text-5xl text-white font-bold">
					Let&apos;s get you moving!
				</div>
				<div class="text-gray-400 mt-5 text-lg">
					We&apos;ll start with the basics. You can add more details later.
				</div>
			</div>

			<form
				@submit.prevent="onSubmit"
				class="mt-12 flex flex-col gap-4"
			>
				<TextInput
					label="What's your first name?"
					v-model="formValues.firstName"
					class="text-white"
					container-class-name="bg-slate-800"
					label-class-name="text-gray-400"
				/>
				<TextInput
					label="And last name?"
					v-model="formValues.lastName"
					class="text-white"
					container-class-name="bg-slate-800"
					label-class-name="text-gray-400"
				/>

				<TextInput
					label="Favorite email address? (we promise not to spam you)"
					type="email"
					v-model="formValues.email"
					class="text-white"
					container-class-name="bg-slate-800"
					label-class-name="text-gray-400"
				/>

				<!-- <TextInput
					label="A good phone number to reach you at?"
					type="tel"
					v-model="formValues.phone"
					class="text-white"
					container-class-name="bg-slate-800"
					label-class-name="text-gray-400"
					@input="() => (formValues.phone = formatPhoneNumber(formValues.phone))"
				/> -->

				<TextInput
					label="A wicked safe password (we also encrypt your data for security)"
					type="password"
					v-model="formValues.password"
					class="text-white"
					container-class-name="bg-slate-800"
					label-class-name="text-gray-400"
				/>

				<TextInput
					label="Confirm that password and you're done!"
					type="password"
					v-model="formValues.confirmPassword"
					class="text-white"
					container-class-name="bg-slate-800"
					label-class-name="text-gray-400"
				/>

				<div class="text-gray-400 text-left">
					<span class="text-gray-400">Password Requirements:</span>
					<ul class="list-[circle] ml-4">
						<li class="mt-1.5">Is longer than 6 characters</li>
						<li class="mt-1.5">Contains at least one uppercase letter</li>
						<li class="mt-1.5">Contains at least one number</li>
						<li class="mt-1.5">
							Contains at least one non alphanumeric character
						</li>
					</ul>
				</div>

				<Alerts
					:alerts="formAlerts"
					class="mt-6"
				/>

				<div class="flex flex-col-reverse sm:flex-row mt-6 gap-4">
					<div class="flex-1 flex justify-center items-center">
						<NuxtLink
							href="/auth/login"
							class="text-gray-300"
						>
							Login instead?
						</NuxtLink>
					</div>

					<div class="flex-1">
						<Button
							type="submit"
							class="w-full h-full"
							:label="
								isLoading ? 'Creating account...' : 'Create your account!'
							"
							:loading="isLoading"
							size="lg"
						/>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
/*  */
</style>
