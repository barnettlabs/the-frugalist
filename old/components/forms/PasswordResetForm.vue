<script setup>
import TextInput from '~/components/inputs/TextInput.vue'
import Button from '../buttons/Button.vue'
import Alerts from '../Alerts.vue'

const props = defineProps({
	title: {
		type: String,
		default: 'Reset Your Password',
	},
	fullScreen: {
		type: Boolean,
		default: false,
	},
})

const router = useRouter()
const user = useSupabaseUser()

const loading = ref(false)
const saving = ref(false)

const formValues = reactive({
	password: '',
	confirmPassword: '',
})
const formAlerts = ref([])

const onSubmit = async () => {
	formAlerts.value = []
	// const { error } = await client.auth.signInWithPassword(formValues)
	// if (!error) return router.push('/')

	// formAlerts.value.push({
	// 	variant: 'error',
	// 	message:
	// 		'The email or password you have entered is incorrect. Please try again.',
	// })
}
</script>

<template>
	<div
		class="z-10 rounded-lg max-w-2xl h-auto text-center md:text-left"
		:class="fullScreen ? 'p-6 md:p-12' : ''"
	>
		<form @submit.prevent="onSubmit">
			<div class="mb-4">
				<div
					class="text-xl font-semibold text-gray-900"
					:class="themeTextClassNames"
				>
					{{ props.title }}
				</div>
				<div
					class="mt-5"
					:class="themeNoteTextClassNames"
				>
					In order to protect your account, make sure your password:
				</div>

				<div :class="themeNoteTextClassNames">
					<ul class="list-[circle] list-inside text-center md:text-left">
						<li class="mt-1.5">Is longer than 6 characters</li>
						<li class="mt-1.5">Contains at least one uppercase letter</li>
						<li class="mt-1.5">Contains at least one number</li>
						<li class="mt-1.5">
							Contains at least one non alphanumeric character
						</li>
					</ul>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<TextInput
					label="New Password"
					type="password"
					v-model="formValues.password"
				/>
				<TextInput
					label="Confirm Password"
					type="password"
					v-model="formValues.confirmPassword"
				/>
			</div>

			<Alerts
				:alerts="formAlerts"
				class="mt-6"
			/>

			<div
				class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-6 mt-8"
			>
				<Button
					v-if="props.fullScreen"
					label="Go to login"
					class="bg-gray-500 flex-1 mt-4 sm:mt-0"
					:size="fullScreen ? 'lg' : 'md'"
					@click="router.replace('/auth/login')"
				/>

				<Button
					:class="fullScreen && 'flex-1'"
					:size="fullScreen ? 'lg' : 'md'"
					type="submit"
					:disabled="loading || saving"
					:label="saving ? 'Updating Password...' : 'Update Password'"
				/>
			</div>
		</form>
	</div>
</template>

<style scoped>
/*  */
</style>
