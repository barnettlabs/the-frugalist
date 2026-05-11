import type { VehicleFinanceSheet, VehicleLeaseSheet } from '@/types/models';

import apiClient from './client';

export interface DashboardStats {
	finance_sheets_count: number;
	lease_sheets_count: number;
	tracked_products_count: number;
	recent_finance_sheets: VehicleFinanceSheet[];
	recent_lease_sheets: VehicleLeaseSheet[];
	recent_tracked_products: any[];
}

export const dashboardApi = {
	async getStats(): Promise<DashboardStats> {
		const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
		return data;
	},
};
