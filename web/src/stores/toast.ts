import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
	id: string;
	message: string;
	type: ToastType;
	duration: number;
};

export const useToastStore = defineStore('toast', () => {
	const toasts = ref<Toast[]>([]);

	const add = (message: string, type: ToastType = 'info', duration = 4000) => {
		const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		toasts.value.push({ id, message, type, duration });

		if (duration > 0) {
			setTimeout(() => remove(id), duration);
		}
	};

	const remove = (id: string) => {
		const index = toasts.value.findIndex(t => t.id === id);
		if (index !== -1) toasts.value.splice(index, 1);
	};

	return { toasts, add, remove };
});
