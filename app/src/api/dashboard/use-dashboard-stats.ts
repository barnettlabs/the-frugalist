import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '../common';

type DashboardStats = {
  financeCount: number;
  leaseCount: number;
  trackerCount: number;
};

// API returns snake_case field names
type DashboardStatsApiResponse = {
  finance_sheets_count: number;
  lease_sheets_count: number;
  tracked_products_count: number;
};

const defaultStats: DashboardStats = {
  financeCount: 0,
  leaseCount: 0,
  trackerCount: 0,
};

export const useDashboardStats = createQuery<DashboardStats, void, AxiosError>({
  queryKey: ['dashboard-stats'],
  fetcher: async (): Promise<DashboardStats> => {
    // Try to get stats from a dedicated endpoint, or calculate from individual endpoints
    try {
      const response =
        await client.get<DashboardStatsApiResponse>('/api/dashboard/stats');
      const data = response.data;

      return {
        financeCount: data?.finance_sheets_count ?? 0,
        leaseCount: data?.lease_sheets_count ?? 0,
        trackerCount: data?.tracked_products_count ?? 0,
      };
    } catch {
      // Fallback: fetch counts from individual endpoints
      try {
        const [financeRes, leaseRes, trackerRes] = await Promise.all([
          client.get('/api/vehicle-finance-sheets').catch(() => ({ data: [] })),
          client.get('/api/vehicle-lease-sheets').catch(() => ({ data: [] })),
          client
            .get('/api/price-tracker')
            .catch(() => ({ data: { tracked_products: [] } })),
        ]);

        // Finance and Lease endpoints return arrays directly
        // Tracker endpoint returns { tracked_products: [...], retailers: [...] }
        return {
          financeCount: Array.isArray(financeRes.data)
            ? financeRes.data.length
            : 0,
          leaseCount: Array.isArray(leaseRes.data) ? leaseRes.data.length : 0,
          trackerCount: Array.isArray(trackerRes.data?.tracked_products)
            ? trackerRes.data.tracked_products.length
            : 0,
        };
      } catch {
        // If everything fails, return default stats
        return defaultStats;
      }
    }
  },
});
