import type { LeaseFormData, VehicleLeaseSheet } from '@/types/models';

import apiClient from './client';

export const leaseApi = {
	async getAll(): Promise<VehicleLeaseSheet[]> {
		const { data } = await apiClient.get<VehicleLeaseSheet[]>('/vehicle-lease-sheets');
		return data;
	},

	async get(id: number | string): Promise<VehicleLeaseSheet> {
		const { data } = await apiClient.get<VehicleLeaseSheet>(`/vehicle-lease-sheets/${id}`);
		return data;
	},

	async create(formData: LeaseFormData): Promise<VehicleLeaseSheet> {
		const { data } = await apiClient.post<VehicleLeaseSheet>('/vehicle-lease-sheets', formData);
		return data;
	},

	async update(id: number | string, formData: Partial<LeaseFormData>): Promise<VehicleLeaseSheet> {
		const { data } = await apiClient.patch<VehicleLeaseSheet>(`/vehicle-lease-sheets/${id}`, formData);
		return data;
	},

	async delete(id: number | string): Promise<void> {
		await apiClient.delete(`/vehicle-lease-sheets/${id}`);
	},
};
