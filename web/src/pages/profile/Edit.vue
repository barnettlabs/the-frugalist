<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';

import { profileApi } from '@/api/profile';
import DangerButton from '@/components/DangerButton.vue';
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import PageHeader from '@/components/PageHeader.vue';
import PrimaryButton from '@/components/PrimaryButton.vue';
import TextInput from '@/components/TextInput.vue';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Profile form schema
const profileSchema = toTypedSchema(
	z.object({
		first_name: z.string().min(1, 'The first name field is required.'),
		last_name: z.string().min(1, 'The last name field is required.'),
		email: z.string().min(1, 'The email field is required.').email('Please enter a valid email address.'),
	})
);

const {
	defineField: defineProfileField,
	handleSubmit: handleProfileSubmit,
	errors: profileErrors,
	setErrors: setProfileErrors,
	resetForm: resetProfileForm,
} = useForm({
	validationSchema: profileSchema,
	initialValues: {
		first_name: '',
		last_name: '',
		email: '',
	},
});

const [firstName] = defineProfileField('first_name');
const [lastName] = defineProfileField('last_name');
const [email] = defineProfileField('email');

const profileLoading = ref(false);
const profileSuccess = ref(false);

// Password form schema
const passwordSchema = toTypedSchema(
	z
		.object({
			current_password: z.string().min(1, 'The current password field is required.'),
			password: z
				.string()
				.min(1, 'The password field is required.')
				.min(8, 'The password must be at least 8 characters.'),
			password_confirmation: z.string().min(1, 'Please confirm your password.'),
		})
		.refine(data => data.password === data.password_confirmation, {
			message: 'The passwords do not match.',
			path: ['password_confirmation'],
		})
);

const {
	defineField: definePasswordField,
	handleSubmit: handlePasswordSubmit,
	errors: passwordErrors,
	setErrors: setPasswordErrors,
	resetForm: resetPasswordForm,
} = useForm({
	validationSchema: passwordSchema,
	initialValues: {
		current_password: '',
		password: '',
		password_confirmation: '',
	},
});

const [currentPassword] = definePasswordField('current_password');
const [newPassword] = definePasswordField('password');
const [passwordConfirmation] = definePasswordField('password_confirmation');

const passwordLoading = ref(false);
const passwordSuccess = ref(false);

// Delete account schema
const deleteSchema = toTypedSchema(
	z.object({
		password: z.string().min(1, 'Please enter your password to confirm.'),
	})
);

const {
	defineField: defineDeleteField,
	handleSubmit: handleDeleteSubmit,
	errors: deleteErrors,
	setErrors: setDeleteErrors,
	resetForm: resetDeleteForm,
} = useForm({
	validationSchema: deleteSchema,
	initialValues: {
		password: '',
	},
});

const [deletePassword] = defineDeleteField('password');

const deleteLoading = ref(false);
const showDeleteConfirm = ref(false);

const loadProfile = async () => {
	try {
		const data = await profileApi.getProfile();
		resetProfileForm({
			values: {
				first_name: data.first_name || '',
				last_name: data.last_name || '',
				email: data.email || '',
			},
		});
	} catch {
		toast.error('Failed to load profile. Please try again.');
	}
};

const updateProfile = handleProfileSubmit(async values => {
	profileLoading.value = true;
	profileSuccess.value = false;

	try {
		await profileApi.updateProfile(values);
		profileSuccess.value = true;
		await authStore.refreshUser();
	} catch (error: any) {
		if (error.response?.data?.errors) {
			const serverErrors: Record<string, string> = {};
			for (const [key, messages] of Object.entries(error.response.data.errors)) {
				if ((messages as string[])?.[0]) {
					serverErrors[key] = (messages as string[])[0];
				}
			}
			setProfileErrors(serverErrors);
		} else {
			toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
		}
	} finally {
		profileLoading.value = false;
	}
});

const updatePassword = handlePasswordSubmit(async values => {
	passwordLoading.value = true;
	passwordSuccess.value = false;

	try {
		await profileApi.updatePassword(values);
		passwordSuccess.value = true;
		resetPasswordForm();
	} catch (error: any) {
		if (error.response?.data?.errors) {
			const serverErrors: Record<string, string> = {};
			for (const [key, messages] of Object.entries(error.response.data.errors)) {
				if ((messages as string[])?.[0]) {
					serverErrors[key] = (messages as string[])[0];
				}
			}
			setPasswordErrors(serverErrors);
		} else {
			toast.error(error.response?.data?.message || 'Failed to update password. Please try again.');
		}
	} finally {
		passwordLoading.value = false;
	}
});

const deleteAccount = handleDeleteSubmit(async values => {
	deleteLoading.value = true;

	try {
		await profileApi.deleteAccount(values.password);
		await authStore.logout();
		router.push('/');
	} catch (error: any) {
		if (error.response?.data?.errors) {
			const serverErrors: Record<string, string> = {};
			for (const [key, messages] of Object.entries(error.response.data.errors)) {
				if ((messages as string[])?.[0]) {
					serverErrors[key] = (messages as string[])[0];
				}
			}
			setDeleteErrors(serverErrors);
		} else {
			toast.error(error.response?.data?.message || 'Failed to delete account. Please try again.');
		}
	} finally {
		deleteLoading.value = false;
	}
});

const closeDeleteModal = () => {
	showDeleteConfirm.value = false;
	resetDeleteForm();
};

onMounted(() => {
	loadProfile();
});
</script>

<template>
	<main class="py-12 flex-1">
		<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
			<PageHeader
				title="Profile Settings"
				description="Manage your account settings and preferences"
				back-link="/dashboard"
				back-label="Dashboard"
			/>

			<div class="space-y-6">
				<!-- Profile Information -->
				<div class="bg-surface/80 backdrop-blur-xs rounded-lg border border-border p-6">
					<h2 class="text-lg font-medium text-primary mb-4">Profile Information</h2>
					<p class="text-sm text-text-muted mb-6">Update your account's profile information and email address.</p>

					<div v-if="profileSuccess" class="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm">
						Profile updated successfully.
					</div>

					<form class="space-y-4" @submit="updateProfile">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<InputLabel for="first_name" value="First Name" />
								<TextInput id="first_name" v-model="firstName" type="text" class="mt-1 block w-full" />
								<InputError :message="profileErrors.first_name" class="mt-2" />
							</div>

							<div>
								<InputLabel for="last_name" value="Last Name" />
								<TextInput id="last_name" v-model="lastName" type="text" class="mt-1 block w-full" />
								<InputError :message="profileErrors.last_name" class="mt-2" />
							</div>
						</div>

						<div>
							<InputLabel for="email" value="Email" />
							<TextInput id="email" v-model="email" type="email" class="mt-1 block w-full" />
							<InputError :message="profileErrors.email" class="mt-2" />
						</div>

						<div class="flex justify-end">
							<PrimaryButton type="submit" :disabled="profileLoading">
								{{ profileLoading ? 'Saving...' : 'Save' }}
							</PrimaryButton>
						</div>
					</form>
				</div>

				<!-- Update Password -->
				<div class="bg-surface/80 backdrop-blur-xs rounded-lg border border-border p-6">
					<h2 class="text-lg font-medium text-primary mb-4">Update Password</h2>
					<p class="text-sm text-text-muted mb-6">Use a strong password to keep your account secure.</p>

					<div v-if="passwordSuccess" class="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm">
						Password updated successfully.
					</div>

					<form class="space-y-4" @submit="updatePassword">
						<div>
							<InputLabel for="current_password" value="Current Password" />
							<TextInput id="current_password" v-model="currentPassword" type="password" class="mt-1 block w-full" />
							<InputError :message="passwordErrors.current_password" class="mt-2" />
						</div>

						<div>
							<InputLabel for="password" value="New Password" />
							<TextInput id="password" v-model="newPassword" type="password" class="mt-1 block w-full" />
							<InputError :message="passwordErrors.password" class="mt-2" />
						</div>

						<div>
							<InputLabel for="password_confirmation" value="Confirm Password" />
							<TextInput
								id="password_confirmation"
								v-model="passwordConfirmation"
								type="password"
								class="mt-1 block w-full"
							/>
							<InputError :message="passwordErrors.password_confirmation" class="mt-2" />
						</div>

						<div class="flex justify-end">
							<PrimaryButton type="submit" :disabled="passwordLoading">
								{{ passwordLoading ? 'Updating...' : 'Update Password' }}
							</PrimaryButton>
						</div>
					</form>
				</div>

				<!-- Delete Account -->
				<div class="bg-surface/80 backdrop-blur-xs rounded-lg border border-danger/20 p-6">
					<h2 class="text-lg font-medium text-danger mb-4">Delete Account</h2>
					<p class="text-sm text-text-muted mb-6">
						Once your account is deleted, all of its resources and data will be permanently deleted.
					</p>

					<DangerButton @click="showDeleteConfirm = true"> Delete Account </DangerButton>

					<!-- Delete Confirmation Modal -->
					<Teleport to="body">
						<div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
							<div class="bg-surface rounded-lg p-6 max-w-md w-full mx-4 border border-border">
								<h3 class="text-lg font-medium text-primary mb-4">Are you sure?</h3>
								<p class="text-sm text-text-muted mb-4">
									This action cannot be undone. Please enter your password to confirm.
								</p>

								<form @submit="deleteAccount">
									<div class="mb-4">
										<InputLabel for="delete_password" value="Password" />
										<TextInput
											id="delete_password"
											v-model="deletePassword"
											type="password"
											class="mt-1 block w-full"
										/>
										<InputError :message="deleteErrors.password" class="mt-2" />
									</div>

									<div class="flex justify-end gap-3">
										<button
											type="button"
											class="px-4 py-2 text-sm font-medium text-text-muted bg-background hover:bg-border rounded-lg"
											@click="closeDeleteModal"
										>
											Cancel
										</button>
										<DangerButton :disabled="deleteLoading">
											{{ deleteLoading ? 'Deleting...' : 'Delete Account' }}
										</DangerButton>
									</div>
								</form>
							</div>
						</div>
					</Teleport>
				</div>
			</div>
		</div>
	</main>
</template>
