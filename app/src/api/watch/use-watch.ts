import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { PriceTracker } from '@/lib/types/models';

import { client } from '../common';

export const useWatch = createQuery<PriceTracker | null, void, AxiosError>({
	queryKey: ['watch'],
	fetcher: async (): Promise<PriceTracker | null> => {
		try {
			const response = await client.get<PriceTracker>('/watch');
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
