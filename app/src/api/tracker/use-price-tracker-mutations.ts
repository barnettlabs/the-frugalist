import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import type { PriceTrackerItem } from '@/lib/types/models';

import { client } from '../common';
import type {
  CreatePriceTrackerRequest,
  DeletePriceTrackerRequest,
  RefreshPriceTrackerRequest,
  UpdatePriceTrackerRequest,
} from './types';

export const useAddPriceTrackerItem = createMutation<
  PriceTrackerItem,
  CreatePriceTrackerRequest,
  AxiosError
>({
  mutationFn: async (data) => {
    const response = await client.post<PriceTrackerItem>(
      '/api/price-tracker',
      data
    );
    return response.data;
  },
});

export const useUpdatePriceTrackerItem = createMutation<
  PriceTrackerItem,
  UpdatePriceTrackerRequest,
  AxiosError
>({
  mutationFn: async ({ id, data }) => {
    const response = await client.patch<PriceTrackerItem>(
      `/api/price-tracker/${id}`,
      data
    );
    return response.data;
  },
});

export const useDeletePriceTrackerItem = createMutation<
  void,
  DeletePriceTrackerRequest,
  AxiosError
>({
  mutationFn: async ({ id }) => {
    await client.delete(`/api/price-tracker/${id}`);
  },
});

export const useRefreshPriceTrackerItem = createMutation<
  PriceTrackerItem,
  RefreshPriceTrackerRequest,
  AxiosError
>({
  mutationFn: async ({ id }) => {
    const response = await client.post<PriceTrackerItem>(
      `/api/price-tracker/${id}/refresh`
    );
    return response.data;
  },
});

// Hook to invalidate price tracker queries after mutations
export function useInvalidatePriceTrackerQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['price-tracker'] });
      queryClient.invalidateQueries({ queryKey: ['price-tracker-item'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: ['price-tracker'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  };
}
