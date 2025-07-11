<script setup>
import AuthPageWrapper from '~/components/wrappers/AuthPageWrapper.vue'
import LoginForm from '~/components/forms/LoginForm.vue'

definePageMeta({
	layout: 'auth',
})

const client = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()
const route = useRoute()

// redirect to dashboard if user is logged in
watchEffect(async () => {
	// if (user.value) {
	// 	await router.push('/')
	// }
})
onMounted(async () => {
	if (route.query.ref === 'logout' && user.value) {
		const { error } = await client.auth.signOut()

		if (error) {
			alert('Something went wrong!')
			return
		}
	}
})
</script>

<template>
	<AuthPageWrapper>
		<LoginForm />
	</AuthPageWrapper>
</template>

<style scoped>
form {
	display: flex;
	flex-direction: column;
	padding: 4px;
}
</style>
