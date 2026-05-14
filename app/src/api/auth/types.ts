import type { User } from '@/lib/types/models';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: User;
}

export interface RegisterRequest {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	password_confirmation: string;
}

export interface RegisterResponse {
	token: string;
	user: User;
}

export interface ForgotPasswordRequest {
	email: string;
}

export interface ForgotPasswordResponse {
	message: string;
}

export interface ResetPasswordRequest {
	token: string;
	email: string;
	password: string;
	password_confirmation: string;
}

export interface ResetPasswordResponse {
	message: string;
}

export interface UpdateProfileRequest {
	first_name?: string;
	last_name?: string;
	email?: string;
	password?: string;
	password_confirmation?: string;
	current_password?: string;
}

export interface ProfileResponse {
	data: User;
}
