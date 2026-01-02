import { createQuery } from 'react-query-kit';

import { client } from '../common';
import type { UserDevice } from './types';

type Response = UserDevice[];

export const useDevices = createQuery<Response, void>({
  queryKey: ['devices'],
  fetcher: async () => {
    const response = await client.get('/devices');
    return response.data;
  },
});
