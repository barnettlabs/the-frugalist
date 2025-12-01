import type { FinanceFormData } from '@/lib/types/models';

export type CreateFinanceSheetRequest = FinanceFormData;

export interface UpdateFinanceSheetRequest {
  id: number;
  data: Partial<FinanceFormData>;
}

export interface DeleteFinanceSheetRequest {
  id: number;
}
