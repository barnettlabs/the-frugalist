import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { VehicleFinanceSheet } from '@/lib/types/models';

import { client } from '../common';

export const useFinanceSheets = createQuery<
  VehicleFinanceSheet[],
  void,
  AxiosError
>({
  queryKey: ['finance-sheets'],
  fetcher: async (): Promise<VehicleFinanceSheet[]> => {
    try {
      const response = await client.get<VehicleFinanceSheet[]>(
        '/vehicle-finance-sheets'
      );

      return response.data ?? [];
    } catch {
      return [];
    }
  },
});
