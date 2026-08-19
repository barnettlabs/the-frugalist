import type { User } from '@/lib/types/models';

export type LoginRequest = {
	email: string;
	password: string;
};

export type LoginResponse = {
	token: string;
	user: User;
};

export type RegisterRequest = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	password_confirmation: string;
};

export type RegisterResponse = {
	token: string;
	user: User;
};

export type ForgotPasswordRequest = {
	email: string;
};

export type ForgotPasswordResponse = {
	message: string;
};

export type ResetPasswordRequest = {
	token: string;
	email: string;
	password: string;
	password_confirmation: string;
};

export type ResetPasswordResponse = {
	message: string;
};

export type UpdateProfileRequest = {
	first_name?: string;
	last_name?: string;
	email?: string;
	password?: string;
	password_confirmation?: string;
	current_password?: string;
};

/**
 * Shape returned by GET and PUT /api/profile (ProfileController@show / @update).
 * Note: this is a flat projection of the user, not the full User model.
 */
export type ProfileResponse = {
	username: string | null;
	avatar_url: string | null;
	website: string | null;
	first_name: string | null;
	last_name: string | null;
	email: string;
};
