<script setup lang="ts">
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/vue/24/outline'
import Button from './Button.vue'

const props = defineProps({
	name: {
		type: String,
		required: false,
	},
	deletePath: {
		type: String,
		required: true,
	},
	onSuccess: { type: Function, required: false },
	onError: { type: Function, required: false },
})

const showConfirmation = ref<boolean>(false)
const error = ref<string | null>(null)
const deleting = ref<boolean>(false)

const confirmDelete = async () => {
	try {
		deleting.value = true
		error.value = null
		const res = await $fetch(props.deletePath, {
			method: 'DELETE',
		})

		showConfirmation.value = false
		props.onSuccess?.()
	} catch (err) {
		error.value =
			'An error occurred while trying to delete the sheet. Please try again.'

		props.onError?.()
	} finally {
		deleting.value = false
	}
}
</script>

<template>
	<div>
		<button
			type="button"
			@click.prevent="showConfirmation = true"
			class="text-gray-400 hover:text-red-600 px-2 h-full"
		>
			<TrashIcon class="w-6 h-6" />
		</button>
	</div>

	<Modal
		:show="showConfirmation"
		@close="showConfirmation = false"
	>
		<template #header>
			<div class="flex flex-col items-center space-y-4">
				<div
					class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
				>
					<ExclamationTriangleIcon
						class="h-6 w-6 text-red-600"
						aria-hidden="true"
					/>
				</div>

				<div>Delete Confirmation</div>
			</div>
		</template>

		<template #body>
			<p class="text-sm text-gray-500 text-center">
				Are you sure you want to delete {{ name ? `"${name}"` : 'this sheet' }}?
				This action cannot be undone.
			</p>
		</template>

		<template #footer>
			<Alerts :alerts="error ? [{ variant: 'error', message: error }] : []" />

			<div class="mt-4 flex justify-between space-x-4">
				<Button
					type="button"
					@click="showConfirmation = false"
					label="Cancel"
					variant="neutral"
					outline
					:disabled="deleting"
				/>
				<Button
					type="button"
					@click="confirmDelete"
					label="Confirm"
					variant="danger"
					:loading="deleting"
				/>
			</div>
		</template>
	</Modal>
</template>
