import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import type { User } from '@/lib/types/models';

import { client } from '../common';
import type { ProfileResponse, UpdateProfileRequest } from './types';

export const useProfile = createQuery<User, void, AxiosError>({
	queryKey: ['profile'],
	fetcher: async () => {
		const response = await client.get<User>('/user');
		return response.data;
	},
});

export const useUpdateProfile = createMutation<User, UpdateProfileRequest, AxiosError>({
	mutationFn: async data => {
		const response = await client.put<ProfileResponse>('/user/profile', data);
		return response.data;
	},
});

export const useDeleteAccount = createMutation<void, void, AxiosError>({
	mutationFn: async () => {
		await client.delete('/user');
	},
});
