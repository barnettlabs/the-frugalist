import type { LeaseFormData } from '@/lib/types/models';

export type CreateLeaseSheetRequest = LeaseFormData;

export interface UpdateLeaseSheetRequest {
  id: number;
  data: Partial<LeaseFormData>;
}

export interface DeleteLeaseSheetRequest {
  id: number;
}
