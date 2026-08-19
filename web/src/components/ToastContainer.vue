<script setup lang="ts">
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';

import type { ToastType } from '@/stores/toast';
import { useToastStore } from '@/stores/toast';

const store = useToastStore();

const icons: Record<ToastType, any> = {
	success: CheckCircleIcon,
	error: XCircleIcon,
	info: InformationCircleIcon,
};

const styles: Record<ToastType, string> = {
	success: 'bg-surface border-success text-success',
	error: 'bg-surface border-danger text-danger',
	info: 'bg-surface border-accent text-accent',
};

const iconStyles: Record<ToastType, string> = {
	success: 'text-success',
	error: 'text-danger',
	info: 'text-accent',
};
</script>

<template>
	<div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
		<TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
			<div
				v-for="toast in store.toasts"
				:key="toast.id"
				:class="[
					'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg pointer-events-auto',
					styles[toast.type],
				]"
			>
				<component
					:is="icons[toast.type]"
					:class="['h-5 w-5 shrink-0 mt-0.5', iconStyles[toast.type]]"
					aria-hidden="true"
				/>
				<p class="flex-1 text-sm font-medium text-primary leading-snug">{{ toast.message }}</p>
				<button class="shrink-0 text-text-muted hover:text-primary transition-colors" @click="store.remove(toast.id)">
					<XMarkIcon class="h-4 w-4" />
				</button>
			</div>
		</TransitionGroup>
	</div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: all 0.2s ease;
}
.toast-enter-from {
	opacity: 0;
	transform: translateX(1.5rem);
}
.toast-leave-to {
	opacity: 0;
	transform: translateX(1.5rem);
}
.toast-move {
	transition: transform 0.2s ease;
}
</style>
