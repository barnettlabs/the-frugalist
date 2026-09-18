<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

import BaseButton from '@/components/BaseButton.vue';
import Checkbox from '@/components/Checkbox.vue';
import FormInput from '@/components/FormInput.vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToastStore();

// The API redirects here after a successful email verification.
onMounted(() => {
	if (route.query.verified === '1') {
		toast.add('Your email address has been verified. You can sign in now.', 'success');
	}
});

const loginSchema = toTypedSchema(
	z.object({
		email: z.string().min(1, 'The email field is required.').email('Please enter a valid email address.'),
		password: z.string().min(1, 'The password field is required.'),
	})
);

const { defineField, handleSubmit, errors, setErrors } = useForm({
	validationSchema: loginSchema,
	initialValues: {
		email: '',
		password: '',
	},
});

const [email] = defineField('email');
const [password] = defineField('password');
const remember = ref(false);

const processing = ref(false);

const submit = handleSubmit(async values => {
	authStore.clearErrors();
	processing.value = true;

	const success = await authStore.login({
		email: values.email,
		password: values.password,
		remember: remember.value,
	});

	processing.value = false;

	if (success) {
		const redirect = route.query.redirect as string;
		router.push(redirect || '/dashboard');
	} else {
		// Map server errors to form fields
		if (authStore.errors) {
			const serverErrors: Record<string, string> = {};
			for (const [key, messages] of Object.entries(authStore.errors)) {
				if (messages?.[0]) {
					serverErrors[key] = messages[0];
				}
			}
			setErrors(serverErrors);
		}
	}
});
</script>

<template>
	<div class="space-y-6">
		<div class="text-center mb-6">
			<h2 class="text-2xl font-medium text-primary">Sign in</h2>
		</div>

		<form class="space-y-6" @submit="submit">
			<FormInput
				v-model="email"
				name="email"
				type="email"
				label="Email"
				:error="errors.email"
				autofocus
				autocomplete="username"
			/>

			<FormInput
				v-model="password"
				name="password"
				type="password"
				label="Password"
				:error="errors.password"
				autocomplete="current-password"
			/>

			<div class="flex items-center">
				<Checkbox v-model:checked="remember" name="remember" />
				<span class="ms-2 text-sm text-text-muted">Remember me</span>
			</div>

			<div class="flex items-center justify-end">
				<RouterLink
					to="/forgot-password"
					class="rounded-md text-sm text-text-muted underline hover:text-primary focus:outline-hidden focus:ring-2 focus:ring-accent focus:ring-offset-2"
				>
					Forgot your password?
				</RouterLink>

				<BaseButton type="submit" variant="primary" class="ms-4" :disabled="processing">
					{{ processing ? 'Logging in...' : 'Log in' }}
				</BaseButton>
			</div>

			<div class="mt-6 pt-8 text-center border-t border-border">
				<p class="text-sm text-text-muted">
					Don't have an account?
					<RouterLink to="/register" class="text-accent hover:text-accent-dark font-medium transition-colors underline">
						Create an account
					</RouterLink>
				</p>
			</div>
		</form>
	</div>
</template>
