import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { PriceTracker } from '@/lib/types/models';

import { client } from '../common';

export const usePriceTracker = createQuery<
  PriceTracker | null,
  void,
  AxiosError
>({
  queryKey: ['price-tracker'],
  fetcher: async (): Promise<PriceTracker | null> => {
    try {
      const response = await client.get<PriceTracker>('/api/price-tracker');
      return (
        response.data ?? {
          retailers: [],
          tracked_products: [],
        }
      );
    } catch {
      return null;
    }
  },
});
