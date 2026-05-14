import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import type { FinanceFormData, VehicleFinanceSheet } from '@/lib/types/models';

import { client, queryClient } from '../common';
import type {
  DeleteFinanceSheetRequest,
  UpdateFinanceSheetRequest,
} from './types';

const invalidateFinanceQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['finance-sheets'] });
  queryClient.invalidateQueries({ queryKey: ['finance-sheet'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
};

export const useAddFinanceSheet = createMutation<
  VehicleFinanceSheet,
  FinanceFormData,
  AxiosError
>({
  mutationFn: async (data) => {
    const response = await client.post<VehicleFinanceSheet>(
      '/vehicle-finance-sheets',
      data
    );
    return response.data;
  },
  onSuccess: invalidateFinanceQueries,
});

export const useUpdateFinanceSheet = createMutation<
  VehicleFinanceSheet,
  UpdateFinanceSheetRequest,
  AxiosError
>({
  mutationFn: async ({ id, data }) => {
    const response = await client.put<VehicleFinanceSheet>(
      `/vehicle-finance-sheets/${id}`,
      data
    );
    return response.data;
  },
  onSuccess: invalidateFinanceQueries,
});

export const useDeleteFinanceSheet = createMutation<
  void,
  DeleteFinanceSheetRequest,
  AxiosError
>({
  mutationFn: async ({ id }) => {
    await client.delete(`/vehicle-finance-sheets/${id}`);
  },
  onSuccess: invalidateFinanceQueries,
});

// Hook to invalidate finance queries after mutations
export function useInvalidateFinanceQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['finance-sheet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  };
}
