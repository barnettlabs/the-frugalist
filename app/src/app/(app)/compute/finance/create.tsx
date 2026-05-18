import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

import { useAddFinanceSheet } from '@/api/finance/use-finance-mutations';
import { FinanceForm } from '@/components/finance/finance-form';
import type { FinanceFormData } from '@/lib/types/models';
import { VehicleType } from '@/lib/types/models';

const defaultFormData: FinanceFormData = {
	sheet_name: '',
	sales_consultant: '',
	dealership_name: '',
	vehicle_type: VehicleType.CAR,
	vehicle_year: '',
	vehicle_make: '',
	vehicle_model: '',
	vehicle_trim: '',
	msrp: 0,
	fees: 0,
	discounts: 0,
	rebates: 0,
	down_payment: 0,
	sales_tax_percent: 0,
	interest_rate: 0,
	finance_term: 60,
	start_date: new Date().toISOString().split('T')[0],
	contact_email: '',
	contact_phone: '',
	extra_payments_json: '[]',
	notes: '',
};

export default function FinanceCreateScreen() {
	const { t } = useTranslation();
	const { mutate: createSheet, isPending } = useAddFinanceSheet();

	const handleSubmit = (data: FinanceFormData) => {
		createSheet(data, {
			onSuccess: () => {
				showMessage({
					message: t('common.success'),
					description: t('estimate_toast.finance_created'),
					type: 'success',
				});
				router.back();
			},
			onError: error => {
				showMessage({
					message: t('common.error'),
					description: error.message || 'Failed to create estimate',
					type: 'danger',
				});
			},
		});
	};

	return (
		<BottomSheetModalProvider>
			<FinanceForm
				initialData={defaultFormData}
				onSubmit={handleSubmit}
				isSubmitting={isPending}
				submitLabel="Create Estimate"
				onCancel={() => router.back()}
				isModal
			/>
		</BottomSheetModalProvider>
	);
}
