import type { MortgageFormData, MortgageSheet } from '@/types/models';

import apiClient from './client';

export const mortgageApi = {
	async getAll(): Promise<MortgageSheet[]> {
		const { data } = await apiClient.get<MortgageSheet[]>('/mortgage-sheets');
		return data;
	},

	async get(id: number | string): Promise<MortgageSheet> {
		const { data } = await apiClient.get<MortgageSheet>(`/mortgage-sheets/${id}`);
		return data;
	},

	async create(formData: MortgageFormData): Promise<MortgageSheet> {
		const { data } = await apiClient.post<MortgageSheet>('/mortgage-sheets', formData);
		return data;
	},

	async update(id: number | string, formData: Partial<MortgageFormData>): Promise<MortgageSheet> {
		const { data } = await apiClient.patch<MortgageSheet>(`/mortgage-sheets/${id}`, formData);
		return data;
	},

	async delete(id: number | string): Promise<void> {
		await apiClient.delete(`/mortgage-sheets/${id}`);
	},

	async compute(payload: Partial<MortgageFormData> & { with_schedule?: boolean }) {
		const { data } = await apiClient.post('/calculators/mortgage/compute', payload);
		return data as { inputs: any; computed: any };
	},
};
