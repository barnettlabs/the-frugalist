import type { User } from '@/types';

import apiClient, { getCsrfToken } from './client';

export interface LoginCredentials {
	email: string;
	password: string;
	remember?: boolean;
}

export interface RegisterData {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	password_confirmation: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface ForgotPasswordData {
	email: string;
}

export interface ResetPasswordData {
	token: string;
	email: string;
	password: string;
	password_confirmation: string;
}

export const authApi = {
	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		await getCsrfToken();
		const { data } = await apiClient.post<AuthResponse>('/login', credentials);
		return data;
	},

	async register(userData: RegisterData): Promise<AuthResponse> {
		await getCsrfToken();
		const { data } = await apiClient.post<AuthResponse>('/register', userData);
		return data;
	},

	async logout(): Promise<void> {
		await apiClient.post('/logout');
	},

	async getUser(): Promise<User> {
		const { data } = await apiClient.get<User>('/user');
		return data;
	},

	async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
		await getCsrfToken();
		const response = await apiClient.post<{ message: string }>('/forgot-password', data);
		return response.data;
	},

	async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
		await getCsrfToken();
		const response = await apiClient.post<{ message: string }>('/reset-password', data);
		return response.data;
	},

	async resendEmailVerification(): Promise<{ message: string }> {
		const response = await apiClient.post<{ message: string }>('/email/verification-notification');
		return response.data;
	},
};
