import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import type { LeaseFormData, VehicleLeaseSheet } from '@/lib/types/models';

import { client } from '../common';
import type { DeleteLeaseSheetRequest, UpdateLeaseSheetRequest } from './types';

export const useAddLeaseSheet = createMutation<
  VehicleLeaseSheet,
  LeaseFormData,
  AxiosError
>({
  mutationFn: async (data) => {
    const response = await client.post<VehicleLeaseSheet>(
      '/api/vehicle-lease-sheets',
      data
    );
    return response.data;
  },
});

export const useUpdateLeaseSheet = createMutation<
  VehicleLeaseSheet,
  UpdateLeaseSheetRequest,
  AxiosError
>({
  mutationFn: async ({ id, data }) => {
    const response = await client.put<VehicleLeaseSheet>(
      `/api/vehicle-lease-sheets/${id}`,
      data
    );
    return response.data;
  },
});

export const useDeleteLeaseSheet = createMutation<
  void,
  DeleteLeaseSheetRequest,
  AxiosError
>({
  mutationFn: async ({ id }) => {
    await client.delete(`/api/vehicle-lease-sheets/${id}`);
  },
});

// Hook to invalidate lease queries after mutations
export function useInvalidateLeaseQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['lease-sheet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  };
}
