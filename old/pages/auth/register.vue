<script setup>
import AuthPageWrapper from '~/components/wrappers/AuthPageWrapper.vue'
import RegisterForm from '~/components/forms/RegisterForm.vue'

definePageMeta({
	layout: 'auth',
})

// redirect to dashboard if user is logged in
watchEffect(async () => {
	const user = useSupabaseUser()

	if (user.value) {
		await router.push('/')
	}
})
</script>

<template>
	<AuthPageWrapper>
		<RegisterForm />
	</AuthPageWrapper>
</template>

<style scoped>
form {
	display: flex;
	flex-direction: column;
	padding: 4px;
}
</style>
