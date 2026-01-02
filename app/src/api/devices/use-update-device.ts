import { createMutation } from 'react-query-kit';

import { client, queryClient } from '../common';
import type { UpdateDeviceRequest, UserDevice } from './types';

type Response = UserDevice;
type Variables = { id: number } & UpdateDeviceRequest;

export const useUpdateDevice = createMutation<Response, Variables>({
  mutationFn: async ({ id, ...data }) => {
    const response = await client.patch(`/devices/${id}`, data);
    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  },
});
