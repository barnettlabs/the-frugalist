import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { PriceTrackerItem } from '@/lib/types/models';

import { client } from '../common';

type Variables = { id: string };

export const usePriceTrackerItem = createQuery<
  PriceTrackerItem,
  Variables,
  AxiosError
>({
  queryKey: ['price-tracker-item'],
  fetcher: async (variables): Promise<PriceTrackerItem> => {
    const response = await client.get<PriceTrackerItem>(
      `/api/price-tracker/${variables.id}`
    );
    const data = response.data;
    if (!data) {
      throw new Error('Price tracker item not found');
    }
    return data;
  },
});
