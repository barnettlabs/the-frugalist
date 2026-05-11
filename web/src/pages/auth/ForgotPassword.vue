<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { z } from 'zod';

import { authApi } from '@/api/auth';
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import PrimaryButton from '@/components/PrimaryButton.vue';
import TextInput from '@/components/TextInput.vue';

const forgotPasswordSchema = toTypedSchema(
	z.object({
		email: z.string().min(1, 'The email field is required.').email('Please enter a valid email address.'),
	})
);

const { defineField, handleSubmit, errors, setErrors } = useForm({
	validationSchema: forgotPasswordSchema,
	initialValues: {
		email: '',
	},
});

const [email] = defineField('email');

const processing = ref(false);
const status = ref('');

const submit = handleSubmit(async values => {
	processing.value = true;
	status.value = '';

	try {
		const response = await authApi.forgotPassword({ email: values.email });
		status.value = response.message;
	} catch (error: any) {
		if (error.response?.data?.errors) {
			const serverErrors: Record<string, string> = {};
			for (const [key, messages] of Object.entries(error.response.data.errors)) {
				if ((messages as string[])?.[0]) {
					serverErrors[key] = (messages as string[])[0];
				}
			}
			setErrors(serverErrors);
		} else if (error.response?.data?.message) {
			setErrors({ email: error.response.data.message });
		}
	} finally {
		processing.value = false;
	}
});
</script>

<template>
	<div>
		<div class="mb-4 text-sm text-gray-600">
			Forgot your password? No problem. Just let us know your email address and we will email you a password reset link
			that will allow you to choose a new one.
		</div>

		<div v-if="status" class="mb-4 text-sm font-medium text-green-600">
			{{ status }}
		</div>

		<form @submit="submit">
			<div>
				<InputLabel for="email" value="Email" />

				<TextInput
					id="email"
					v-model="email"
					type="email"
					class="mt-1 block w-full"
					autofocus
					autocomplete="username"
				/>

				<InputError class="mt-2" :message="errors.email" />
			</div>

			<div class="mt-4 flex items-center justify-end">
				<PrimaryButton :class="{ 'opacity-25': processing }" :disabled="processing">
					Email Password Reset Link
				</PrimaryButton>
			</div>
		</form>
	</div>
</template>
