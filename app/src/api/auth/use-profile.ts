import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import type { User } from '@/lib/types/models';

import { client, queryClient } from '../common';
import type { ProfileResponse, UpdateProfileRequest } from './types';

export const useProfile = createQuery<User, void, AxiosError>({
	queryKey: ['auth', 'profile'],
	fetcher: async () => {
		const response = await client.get<User>('/user');
		return response.data;
	},
});

export const useUpdateProfile = createMutation<ProfileResponse, UpdateProfileRequest, AxiosError>({
	mutationFn: async data => {
		const response = await client.put<ProfileResponse>('/profile', data);
		return response.data;
	},
	onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] }),
});

export const useDeleteAccount = createMutation<void, void, AxiosError>({
	mutationFn: async () => {
		await client.delete('/user');
	},
});
