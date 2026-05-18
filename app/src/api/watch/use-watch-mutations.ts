import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import type { PriceTrackerItem } from '@/lib/types/models';

import { client, queryClient } from '../common';
import type { CreateWatchRequest, DeleteWatchRequest, RefreshWatchRequest, UpdateWatchRequest } from './types';

const invalidateWatchQueries = () => {
	queryClient.invalidateQueries({ queryKey: ['watch'] });
	queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
};

export const useAddWatchItem = createMutation<PriceTrackerItem, CreateWatchRequest, AxiosError>({
	mutationFn: async data => {
		const response = await client.post<PriceTrackerItem>('/watch', data);
		return response.data;
	},
	onSuccess: invalidateWatchQueries,
});

export const useUpdateWatchItem = createMutation<PriceTrackerItem, UpdateWatchRequest, AxiosError>({
	mutationFn: async ({ id, data }) => {
		const response = await client.patch<PriceTrackerItem>(`/watch/${id}`, data);
		return response.data;
	},
	onSuccess: invalidateWatchQueries,
});

export const useDeleteWatchItem = createMutation<void, DeleteWatchRequest, AxiosError>({
	mutationFn: async ({ id }) => {
		await client.delete(`/watch/${id}`);
	},
	onSuccess: invalidateWatchQueries,
});

export const useRefreshWatchItem = createMutation<PriceTrackerItem, RefreshWatchRequest, AxiosError>({
	mutationFn: async ({ id }) => {
		const response = await client.post<PriceTrackerItem>(`/watch/${id}/refresh`);
		return response.data;
	},
	onSuccess: invalidateWatchQueries,
});
