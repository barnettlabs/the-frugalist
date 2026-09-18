import apiClient from './client';

export interface ProfileUpdateData {
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
}

export interface PasswordUpdateData {
	current_password: string;
	password: string;
	password_confirmation: string;
}

/**
 * Shape returned by GET and PUT /api/profile (ProfileController@show / @update).
 * A flat projection of the user, not a nested { user, profile } envelope.
 */
export interface ProfileResponse {
	username: string | null;
	avatar_url: string | null;
	website: string | null;
	first_name: string | null;
	last_name: string | null;
	email: string;
}

export const profileApi = {
	async getProfile(): Promise<ProfileResponse> {
		const { data } = await apiClient.get<ProfileResponse>('/profile');
		return data;
	},

	async updateProfile(profileData: ProfileUpdateData): Promise<ProfileResponse> {
		const { data } = await apiClient.put<ProfileResponse>('/profile', profileData);
		return data;
	},

	async updatePassword(passwordData: PasswordUpdateData): Promise<{ message: string }> {
		const { data } = await apiClient.put<{ message: string }>('/password', passwordData);
		return data;
	},

	async deleteAccount(password: string): Promise<void> {
		await apiClient.delete('/profile', { data: { password } });
	},
};
