<script setup>
import PasswordResetForm from '~/components/forms/PasswordResetForm.vue'
import ProfileForm from '~/components/forms/ProfileForm.vue'

definePageMeta({
	middleware: 'auth',
})

const user = useSupabaseUser()

const profileStore = storeToRefs(useProfileStore())
const { profile } = storeToRefs(profileStore)

const fullName = computed(() =>
	`${user.value.user_metadata?.firstName ?? ''} ${
		user.value.user_metadata?.lastName ?? ''
	}`.trim()
)
const memberSince = computed(() => {
	const date = new Date(user.value.created_at)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
})
</script>

<template>
	<main class="-mt-24 pb-8 flex-1">
		<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
			<h1 class="sr-only">Profile</h1>

			<!-- Main 3 column grid -->
			<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-8">
				<!-- Left column -->
				<div class="grid grid-cols-1 gap-4">
					<!-- Welcome panel -->
					<section aria-labelledby="profile-overview-title">
						<div class="overflow-hidden rounded-lg bg-white shadow">
							<h2
								class="sr-only"
								id="profile-overview-title"
							>
								Profile Overview
							</h2>

							<div class="p-8">
								<div class="sm:flex sm:items-start sm:justify-between">
									<div class="sm:flex sm:space-x-5">
										<div class="flex-shrink-0">
											<img
												class="mx-auto h-16 w-16 rounded-full"
												:src="profile?.avatarUrl"
												alt=""
											/>
										</div>
										<div class="mt-4 text-center sm:mt-0 sm:text-left">
											<p class="text-xl font-bold text-gray-900 sm:text-2xl">
												{{ fullName }}
											</p>
										</div>
									</div>
									<div
										class="mt-4 sm:mt-0 flex flex-col justify-center text-center sm:text-right"
									>
										<p class="text-sm text-gray-400">member since:</p>
										<p class="text-sm text-gray-400">{{ memberSince }}</p>
									</div>
								</div>

								<div class="mt-4">
									<ProfileForm
										:user="user"
										title="Profile"
									/>
								</div>
							</div>
						</div>
					</section>
				</div>

				<!-- Right column: password reset -->
				<div class="grid grid-cols-1 gap-4 relative">
					<section>
						<div class="overflow-hidden rounded-lg bg-white shadow">
							<div class="p-8">
								<PasswordResetForm
									title="Reset Your Password"
									:user="user"
								/>
								<div
									class="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex justify-center items-center"
								>
									<span class="text-white text-2xl font-bold"
										>Feature Coming Soon</span
									>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	</main>
</template>
