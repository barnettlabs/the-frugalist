import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import type { LeaseFormData, VehicleLeaseSheet } from '@/lib/types/models';

import { client, queryClient } from '../common';
import type { DeleteLeaseSheetRequest, UpdateLeaseSheetRequest } from './types';

const invalidateLeaseQueries = () => {
	queryClient.invalidateQueries({ queryKey: ['lease'] });
	queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
};

export const useAddLeaseSheet = createMutation<VehicleLeaseSheet, LeaseFormData, AxiosError>({
	mutationFn: async data => {
		const response = await client.post<VehicleLeaseSheet>('/vehicle-lease-sheets', data);
		return response.data;
	},
	onSuccess: invalidateLeaseQueries,
});

export const useUpdateLeaseSheet = createMutation<VehicleLeaseSheet, UpdateLeaseSheetRequest, AxiosError>({
	mutationFn: async ({ id, data }) => {
		const response = await client.put<VehicleLeaseSheet>(`/vehicle-lease-sheets/${id}`, data);
		return response.data;
	},
	onSuccess: invalidateLeaseQueries,
});

export const useDeleteLeaseSheet = createMutation<void, DeleteLeaseSheetRequest, AxiosError>({
	mutationFn: async ({ id }) => {
		await client.delete(`/vehicle-lease-sheets/${id}`);
	},
	onSuccess: invalidateLeaseQueries,
});
