import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAddWatchItem } from '@/api/watch';
import { TrackerForm } from '@/components/tracker/tracker-form';

export default function TrackerCreateScreen() {
  const { mutate: createProduct, isPending } = useAddWatchItem();

  const handleSubmit = (data: {
    sku_upc: string;
    retailer_id: number;
    target_price: number;
  }) => {
    createProduct(data, {
      onSuccess: () => {
        showMessage({
          message: 'Success',
          description: 'Product is now being tracked',
          type: 'success',
        });
        router.back();
      },
      onError: (error) => {
        showMessage({
          message: 'Error',
          description: error.message || 'Failed to track product',
          type: 'danger',
        });
      },
    });
  };

  return (
    <BottomSheetModalProvider>
      <TrackerForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => router.back()}
      />
    </BottomSheetModalProvider>
  );
}
