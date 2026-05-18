import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '../common';

type DashboardStats = {
	financeCount: number;
	leaseCount: number;
	watchCount: number;
};

// API returns snake_case field names
type DashboardStatsApiResponse = {
	finance_sheets_count: number;
	lease_sheets_count: number;
	tracked_products_count: number;
};

export const useDashboardStats = createQuery<DashboardStats, void, AxiosError>({
	queryKey: ['dashboard', 'stats'],
	retry: 2,
	fetcher: async (): Promise<DashboardStats> => {
		const response = await client.get<DashboardStatsApiResponse>('/dashboard/stats');
		const data = response.data;

		return {
			financeCount: data.finance_sheets_count ?? 0,
			leaseCount: data.lease_sheets_count ?? 0,
			watchCount: data.tracked_products_count ?? 0,
		};
	},
});
