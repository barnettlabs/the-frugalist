import { router } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAddLeaseSheet } from '@/api/lease/use-lease-mutations';
import { LeaseForm } from '@/components/lease/lease-form';
import type { LeaseFormData } from '@/lib/types/models';
import { VehicleType } from '@/lib/types/models';

const defaultFormData: LeaseFormData = {
  sheet_name: '',
  sales_consultant: '',
  dealership_name: '',
  vehicle_type: VehicleType.CAR,
  vehicle_year: '',
  vehicle_make: '',
  vehicle_model: '',
  vehicle_trim: '',
  msrp: 0,
  dealer_contribution: 0,
  trade_in: 0,
  doc_fee: 0,
  acquisition_fee: 0,
  misc_fees: 0,
  lease_cash: 0,
  down_payment: 0,
  sales_tax_percent: 0,
  money_factor: 0,
  residual_percent: 50,
  lease_term: 36,
  start_date: new Date().toISOString().split('T')[0],
  contact_email: '',
  contact_phone: '',
  notes: '',
};

export default function LeaseCreateScreen() {
  const { mutate: createSheet, isPending } = useAddLeaseSheet();

  const handleSubmit = (data: LeaseFormData) => {
    createSheet(data, {
      onSuccess: () => {
        showMessage({
          message: 'Success',
          description: 'Lease estimate created successfully',
          type: 'success',
        });
        router.back();
      },
      onError: (error) => {
        showMessage({
          message: 'Error',
          description: error.message || 'Failed to create estimate',
          type: 'danger',
        });
      },
    });
  };

  return (
    <LeaseForm
      initialData={defaultFormData}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel="Create Estimate"
    />
  );
}
