import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { PriceTrackerItem } from '@/lib/types/models';

import { client } from '../common';

type Variables = { id: string };

export const useWatchItem = createQuery<PriceTrackerItem, Variables, AxiosError>({
	queryKey: ['watch', 'item'],
	fetcher: async (variables): Promise<PriceTrackerItem> => {
		const response = await client.get<PriceTrackerItem>(`/watch/${variables.id}`);
		const data = response.data;
		if (!data) {
			throw new Error('Watch item not found');
		}
		return data;
	},
});
