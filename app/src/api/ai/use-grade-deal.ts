import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type { GradeDealResult, GradeDealVariables } from './types';

export const useGradeDeal = createMutation<GradeDealResult, GradeDealVariables, AxiosError>({
	mutationFn: async ({ agentSlug, calculatorType, inputs }) => {
		const computePath = calculatorType === 'finance' ? '/calculators/finance/compute' : '/calculators/lease/compute';

		const compute = await client.post<{
			inputs: Record<string, unknown>;
			computed: Record<string, unknown>;
		}>(computePath, { ...inputs, with_schedule: false });

		const run = await client.post<GradeDealResult>(`/ai/agents/${agentSlug}/run`, {
			context: {
				inputs: compute.data.inputs,
				computed: compute.data.computed,
			},
			context_key: `calculator.${calculatorType}.deal-grade`,
		});

		return run.data;
	},
});
