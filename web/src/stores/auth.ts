import axios from 'axios';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { LoginCredentials, RegisterData } from '@/api/auth';
import { authApi } from '@/api/auth';
import { useToastStore } from '@/stores/toast';
import type { User } from '@/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuthStore = defineStore('auth', () => {
	// State
	const user = ref<User | null>(null);
	const token = ref<string | null>(null);
	const initialized = ref(false);
	const loading = ref(false);
	const errors = ref<Record<string, string[]>>({});

	// Getters
	const isAuthenticated = computed(() => !!token.value && !!user.value);
	const isAdmin = computed(() => !!user.value?.is_admin);
	const fullName = computed(() => {
		if (!user.value) return '';
		const firstName = (user.value as any).first_name || '';
		const lastName = (user.value as any).last_name || '';
		return `${firstName} ${lastName}`.trim();
	});

	// Actions
	const initialize = async () => {
		if (initialized.value) return;

		// Try to restore from localStorage
		const storedToken = localStorage.getItem(TOKEN_KEY);
		const storedUser = localStorage.getItem(USER_KEY);

		if (storedToken && storedUser) {
			token.value = storedToken;
			try {
				user.value = JSON.parse(storedUser);
				// Verify token is still valid by fetching user
				const freshUser = await authApi.getUser();
				user.value = freshUser;
				localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
			} catch {
				clearAuth();
				useToastStore().add('Your session has expired. Please sign in again.', 'info');
			}
		}

		initialized.value = true;
	};

	const login = async (credentials: LoginCredentials) => {
		loading.value = true;
		errors.value = {};

		try {
			const response = await authApi.login(credentials);
			setAuth(response.user, response.token);
			return true;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.data?.errors) {
					errors.value = error.response.data.errors;
				} else if (error.response?.data?.message) {
					errors.value = { email: [error.response.data.message] };
				} else {
					errors.value = { email: ['A network error occurred. Please try again.'] };
				}
			} else {
				errors.value = { email: ['An unexpected error occurred. Please try again.'] };
			}
			return false;
		} finally {
			loading.value = false;
		}
	};

	const register = async (data: RegisterData) => {
		loading.value = true;
		errors.value = {};

		try {
			const response = await authApi.register(data);
			setAuth(response.user, response.token);
			return true;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.data?.errors) {
					errors.value = error.response.data.errors;
				} else if (error.response?.data?.message) {
					errors.value = { email: [error.response.data.message] };
				} else {
					errors.value = { email: ['A network error occurred. Please try again.'] };
				}
			} else {
				errors.value = { email: ['An unexpected error occurred. Please try again.'] };
			}
			return false;
		} finally {
			loading.value = false;
		}
	};

	const logout = async () => {
		try {
			if (token.value) {
				await authApi.logout();
			}
		} catch {
			// Ignore errors during logout
		} finally {
			clearAuth();
		}
	};

	const refreshUser = async () => {
		if (!token.value) return;

		try {
			const freshUser = await authApi.getUser();
			user.value = freshUser;
			localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
		} catch {
			clearAuth();
			useToastStore().add('Your session has expired. Please sign in again.', 'info');
		}
	};

	const setAuth = (newUser: User, newToken: string) => {
		user.value = newUser;
		token.value = newToken;
		localStorage.setItem(TOKEN_KEY, newToken);
		localStorage.setItem(USER_KEY, JSON.stringify(newUser));
	};

	const clearAuth = () => {
		user.value = null;
		token.value = null;
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
	};

	const clearErrors = () => {
		errors.value = {};
	};

	return {
		// State
		user,
		token,
		initialized,
		loading,
		errors,

		// Getters
		isAuthenticated,
		isAdmin,
		fullName,

		// Actions
		initialize,
		login,
		register,
		logout,
		refreshUser,
		setAuth,
		clearAuth,
		clearErrors,
	};
});
