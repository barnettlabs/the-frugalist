import apiClient from './client';

export interface DealGradeResponse {
	grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
	rating: 'excellent' | 'good' | 'fair' | 'poor' | 'bad' | 'needs_more_info';
	confidence: number;
	summary: string;
	red_flags: string[];
	tips: string[];
}

export interface AgentRunResult<T = any> {
	agent: { slug: string; version: number };
	response: T;
	cached: boolean;
}

export const aiApi = {
	async runAgent<T = any>(
		slug: string,
		context: { inputs: Record<string, unknown>; computed: Record<string, unknown> },
		options: { contextKey?: string; useCache?: boolean } = {}
	): Promise<AgentRunResult<T>> {
		const { data } = await apiClient.post<AgentRunResult<T>>(`/ai/agents/${slug}/run`, {
			context,
			context_key: options.contextKey,
			use_cache: options.useCache ?? true,
		});
		return data;
	},
};

export const calculatorsApi = {
	async finance(inputs: Record<string, unknown>, withSchedule = false): Promise<{ inputs: any; computed: any }> {
		const { data } = await apiClient.post('/calculators/finance/compute', { ...inputs, with_schedule: withSchedule });
		return data;
	},
	async lease(inputs: Record<string, unknown>, withSchedule = false): Promise<{ inputs: any; computed: any }> {
		const { data } = await apiClient.post('/calculators/lease/compute', { ...inputs, with_schedule: withSchedule });
		return data;
	},
};
