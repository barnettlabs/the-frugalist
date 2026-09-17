import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/auth';

// API base URL from environment variable, defaults to /api for same-domain setup
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
	},
	// Better Auth sets a session cookie for the browser flow, so credentials are
	// still sent. The XSRF options that used to sit here were Sanctum-specific:
	// Laravel issued a CSRF token from /sanctum/csrf-cookie and expected it
	// echoed back. Better Auth does not use that scheme - it relies on SameSite
	// cookies plus a trusted-origin check, which rejects an untrusted Origin with
	// 403 before a handler runs.
	withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const authStore = useAuthStore();
		if (authStore.token) {
			config.headers.Authorization = `Bearer ${authStore.token}`;
		}
		return config;
	},
	error => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	response => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			const authStore = useAuthStore();
			authStore.clearAuth();
			import('@/router').then(({ default: router }) => {
				router.push({ name: 'login' });
			});
		}
		return Promise.reject(error);
	}
);

export default apiClient;
