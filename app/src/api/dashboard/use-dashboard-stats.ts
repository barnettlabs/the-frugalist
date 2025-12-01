import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '../common';

interface DashboardStats {
  financeCount: number;
  leaseCount: number;
  trackerCount: number;
}

interface DashboardStatsResponse {
  data: DashboardStats;
}

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
      const response = await client.get<DashboardStatsResponse>(
        '/api/dashboard/stats'
      );
      return response.data?.data ?? defaultStats;
    } catch {
      // Fallback: fetch counts from individual endpoints
      try {
        const [financeRes, leaseRes, trackerRes] = await Promise.all([
          client
            .get('/api/vehicle-finance-sheets')
            .catch(() => ({ data: { data: [] } })),
          client
            .get('/api/vehicle-lease-sheets')
            .catch(() => ({ data: { data: [] } })),
          client
            .get('/api/price-tracker')
            .catch(() => ({ data: { data: [] } })),
        ]);

        return {
          financeCount: Array.isArray(financeRes.data?.data)
            ? financeRes.data.data.length
            : 0,
          leaseCount: Array.isArray(leaseRes.data?.data)
            ? leaseRes.data.data.length
            : 0,
          trackerCount: Array.isArray(trackerRes.data?.data)
            ? trackerRes.data.data.length
            : 0,
        };
      } catch {
        // If everything fails, return default stats
        return defaultStats;
      }
    }
  },
});
