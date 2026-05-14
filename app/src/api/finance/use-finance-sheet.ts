import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import type { VehicleFinanceSheet } from '@/lib/types/models';

import { client } from '../common';

type Variables = { id: string };

export const useFinanceSheet = createQuery<VehicleFinanceSheet, Variables, AxiosError>({
	queryKey: ['finance-sheet'],
	fetcher: async (variables): Promise<VehicleFinanceSheet> => {
		const response = await client.get<VehicleFinanceSheet>(`/vehicle-finance-sheets/${variables.id}`);
		const data = response.data;
		if (!data) {
			throw new Error('Finance sheet not found');
		}
		return data;
	},
});
