<script setup>
import TextInput from '~/components/inputs/TextInput.vue'
import Button from '../buttons/Button.vue'
import Alerts from '../Alerts.vue'

const router = useRouter()
const client = useSupabaseClient()

const formValues = reactive({
	email: '',
})
const formAlerts = ref([])

const onSubmit = async () => {
	formAlerts.value = []
	// const { error } = await client.auth.resetPasswordForEmail(formValues.email)

	// if (!error) return router.push('/')

	formAlerts.value.push({
		variant: 'error',
		message: 'An error occurred. Please try again later.',
		// message: error.message,
	})
}
</script>

<template>
	<div
		class="z-10 p-6 md:p-12 rounded-lg max-w-2xl h-auto text-center md:text-left"
	>
		<div>
			<div class="text-4xl md:text-5xl text-white font-bold">
				Forgot your password?
			</div>
			<div class="text-gray-400 mt-5">
				Don&apos;t worry, we&apos;ll send you an email with instructions to
				reset it.
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

			<Alerts
				:alerts="formAlerts"
				class="mt-6"
			/>

			<div class="flex flex-col-reverse sm:flex-row mt-6 gap-4">
				<div class="flex-1 flex justify-center items-center mt-4 sm:mt-0">
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
						:label="loading ? 'Sending email...' : 'Send Email'"
						:loading="loading"
						size="lg"
					/>
				</div>
			</div>
		</form>
	</div>
</template>

<style scoped>
/*  */
</style>
