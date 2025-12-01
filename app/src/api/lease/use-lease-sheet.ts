import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { VehicleLeaseSheet } from '@/lib/types/models';

import { client } from '../common';

type Variables = { id: string };

export const useLeaseSheet = createQuery<
  VehicleLeaseSheet,
  Variables,
  AxiosError
>({
  queryKey: ['lease-sheet'],
  fetcher: async (variables): Promise<VehicleLeaseSheet> => {
    const response = await client.get<VehicleLeaseSheet>(
      `/api/vehicle-lease-sheets/${variables.id}`
    );
    const data = response.data;
    if (!data) {
      throw new Error('Lease sheet not found');
    }
    return data;
  },
});
