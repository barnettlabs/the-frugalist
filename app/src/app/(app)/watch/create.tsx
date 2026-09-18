import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import { useAddWatchItem } from '@/api/watch';
import { TrackerForm } from '@/components/tracker/tracker-form';
import { useNotifications } from '@/lib/notifications/use-notifications';

export default function TrackerCreateScreen() {
	const { t } = useTranslation();
	const { mutate: createProduct, isPending } = useAddWatchItem();
	const { register: registerNotifications, isRegistered } = useNotifications();

	const handleSubmit = (data: { sku_upc: string; retailer_id: number; target_price: number }) => {
		createProduct(data, {
			onSuccess: () => {
				// Request notification permissions when user creates their first tracker
				if (!isRegistered) {
					registerNotifications();
				}
				showMessage({
					message: t('common.success'),
					description: t('watch_toast.tracking_started_description'),
					type: 'success',
				});
				router.back();
			},
			onError: error => {
				showMessage({
					message: t('common.error'),
					description: error.message || 'Failed to track product',
					type: 'danger',
				});
			},
		});
	};

	return (
		<BottomSheetModalProvider>
			<TrackerForm onSubmit={handleSubmit} isSubmitting={isPending} onCancel={() => router.back()} />
		</BottomSheetModalProvider>
	);
}
