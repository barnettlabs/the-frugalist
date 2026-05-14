import { createMutation } from 'react-query-kit';

import { client, queryClient } from '../common';

type Response = void;
type Variables = { id: number };

export const useDeleteDevice = createMutation<Response, Variables>({
	mutationFn: async ({ id }) => {
		await client.delete(`/devices/${id}`);
	},
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['devices'] });
	},
});
