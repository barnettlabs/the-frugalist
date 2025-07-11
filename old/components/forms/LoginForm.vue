<script setup>
import TextInput from '~/components/inputs/TextInput.vue'
import Button from '../buttons/Button.vue'
import Alerts from '../Alerts.vue'

const router = useRouter()
const client = useSupabaseClient()

const loading = ref(false)
const formValues = reactive({
	email: '',
	password: '',
})
const formAlerts = ref([])

const onSubmit = async () => {
	formAlerts.value = []
	const { error } = await client.auth.signInWithPassword(formValues)
	if (!error) return router.push('/')

	formAlerts.value.push({
		variant: 'error',
		message:
			'The email or password you have entered is incorrect. Please try again.',
	})
}
</script>

<template>
	<div
		class="z-10 p-6 md:p-12 rounded-lg max-w-2xl h-auto text-center md:text-left"
	>
		<div class="mb-4">
			<div class="text-gray-400 uppercase font-bold">Start for free</div>
			<div class="text-4xl md:text-5xl text-white mt-5 font-bold">
				Sign in & find your<span style="white-space: nowrap">
					ride
					<span class="inline-block bg-primary h-2.5 w-2.5 rounded-full" />
				</span>
			</div>
		</div>

		<form
			@submit.prevent="onSubmit"
			class="mt-12 flex flex-col gap-4"
		>
			<TextInput
				label="Email"
				type="email"
				v-model="formValues.email"
				class="text-white"
				container-class-name="bg-slate-800"
				label-class-name="text-gray-400"
			/>

			<TextInput
				label="Password"
				type="password"
				v-model="formValues.password"
				class="text-white"
				container-class-name="bg-slate-800"
				label-class-name="text-gray-400"
			/>

			<Alerts
				:alerts="formAlerts"
				class="mt-6"
			/>

			<div class="flex flex-col-reverse sm:flex-row mt-6 gap-4">
				<div class="flex-1">
					<NuxtLink href="/auth/register">
						<Button
							type="button"
							label="Ready to Sign Up?"
							class="mt-4 sm:mt-0 w-full h-full"
							variant="neutral"
							size="lg"
						/>
					</NuxtLink>
				</div>

				<div class="flex-1">
					<Button
						type="submit"
						class="w-full h-full"
						:label="loading ? 'Signing In...' : 'Continue'"
						:loading="loading"
						size="lg"
					/>
				</div>
			</div>

			<div class="mt-8 text-center sm:text-left">
				<nuxt-link
					href="/auth/reset-password-request"
					class="text-gray-300 flex-1 inline-flex"
				>
					Forgot Password?
				</nuxt-link>
			</div>
		</form>
	</div>
</template>

<style scoped>
/*  */
</style>
