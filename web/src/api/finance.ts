import type { FinanceFormData, VehicleFinanceSheet } from '@/types/models';

import apiClient from './client';

export const financeApi = {
	async getAll(): Promise<VehicleFinanceSheet[]> {
		const { data } = await apiClient.get<VehicleFinanceSheet[]>('/vehicle-finance-sheets');
		return data;
	},

	async get(id: number | string): Promise<VehicleFinanceSheet> {
		const { data } = await apiClient.get<VehicleFinanceSheet>(`/vehicle-finance-sheets/${id}`);
		return data;
	},

	async create(formData: FinanceFormData): Promise<VehicleFinanceSheet> {
		const { data } = await apiClient.post<VehicleFinanceSheet>('/vehicle-finance-sheets', formData);
		return data;
	},

	async update(id: number | string, formData: Partial<FinanceFormData>): Promise<VehicleFinanceSheet> {
		const { data } = await apiClient.patch<VehicleFinanceSheet>(`/vehicle-finance-sheets/${id}`, formData);
		return data;
	},

	async delete(id: number | string): Promise<void> {
		await apiClient.delete(`/vehicle-finance-sheets/${id}`);
	},
};
