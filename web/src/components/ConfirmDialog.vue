<script setup lang="ts">
import DangerButton from './DangerButton.vue';
import Modal from './Modal.vue';
import PrimaryButton from './PrimaryButton.vue';
import SecondaryButton from './SecondaryButton.vue';

defineProps({
	show: {
		type: Boolean,
		default: false,
	},
	title: {
		type: String,
		default: 'Confirm Action',
	},
	message: {
		type: String,
		default: 'Are you sure you want to proceed?',
	},
	confirmText: {
		type: String,
		default: 'Confirm',
	},
	cancelText: {
		type: String,
		default: 'Cancel',
	},
	variant: {
		type: String as () => 'danger' | 'primary' | 'warning',
		default: 'primary',
	},
	loading: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const handleConfirm = () => {
	emit('confirm');
};

const handleCancel = () => {
	emit('cancel');
	emit('close');
};
</script>

<template>
	<Modal :show="show" max-width="md" @close="handleCancel">
		<div class="p-6">
			<h3 class="text-lg font-bold text-primary mb-2">{{ title }}</h3>
			<p class="text-text-muted">{{ message }}</p>

			<slot />

			<div class="flex justify-end gap-3 mt-6">
				<SecondaryButton :disabled="loading" @click="handleCancel">
					{{ cancelText }}
				</SecondaryButton>
				<DangerButton v-if="variant === 'danger'" :disabled="loading" @click="handleConfirm">
					{{ loading ? 'Please wait...' : confirmText }}
				</DangerButton>
				<PrimaryButton v-else :disabled="loading" @click="handleConfirm">
					{{ loading ? 'Please wait...' : confirmText }}
				</PrimaryButton>
			</div>
		</div>
	</Modal>
</template>
