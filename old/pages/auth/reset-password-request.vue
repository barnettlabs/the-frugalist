<script setup>
import AuthPageWrapper from '~/components/wrappers/AuthPageWrapper.vue'
import ResetPasswordRequestForm from '~/components/forms/ResetPasswordRequestForm.vue'

const router = useRouter()
const user = useSupabaseUser()

// redirect to dashboard if user is logged in
watchEffect(async () => {
	if (user.value) {
		await router.push('/')
	}
})
</script>

<template>
	<AuthPageWrapper>
		<ResetPasswordRequestForm />
	</AuthPageWrapper>
</template>

<style scoped>
form {
	display: flex;
	flex-direction: column;
	padding: 4px;
}
</style>
