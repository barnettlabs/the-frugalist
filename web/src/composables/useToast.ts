import { useToastStore } from '@/stores/toast';

export const useToast = () => {
	const store = useToastStore();

	return {
		success: (message: string, duration?: number) => store.add(message, 'success', duration),
		error: (message: string, duration?: number) => store.add(message, 'error', duration),
		info: (message: string, duration?: number) => store.add(message, 'info', duration),
		dismiss: (id: string) => store.remove(id),
	};
};
