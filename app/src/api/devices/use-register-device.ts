import { createMutation } from 'react-query-kit';

import { client, queryClient } from '../common';
import type { RegisterDeviceRequest, UserDevice } from './types';

type Response = UserDevice;
type Variables = RegisterDeviceRequest;

export const useRegisterDevice = createMutation<Response, Variables>({
  mutationFn: async (variables) => {
    const response = await client.post('/devices', variables);
    return response.data;
  },
  onSuccess: () => {
    // Invalidate devices list to refetch
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  },
});
