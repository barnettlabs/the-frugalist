import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { VehicleLeaseSheet } from '@/lib/types/models';

import { client } from '../common';

export const useLeaseSheets = createQuery<
  VehicleLeaseSheet[],
  void,
  AxiosError
>({
  queryKey: ['lease-sheets'],
  fetcher: async (): Promise<VehicleLeaseSheet[]> => {
    try {
      const response = await client.get<VehicleLeaseSheet[]>(
        '/api/vehicle-lease-sheets'
      );
      return response.data ?? [];
    } catch {
      return [];
    }
  },
});
