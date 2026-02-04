import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  useDeleteWatchItem,
  useWatchItem,
  useRefreshWatchItem,
  useUpdateWatchItem,
} from '@/api/watch';
import { ProductDetail } from '@/components/tracker/product-detail';
import { Button, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

export default function TrackerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: trackerItem,
    isLoading,
    isError,
    refetch,
  } = useWatchItem({
    variables: { id: id! },
  });

  const { mutate: refreshProduct, isPending: isRefreshing } =
    useRefreshWatchItem();
  const { mutate: updateProduct, isPending: isUpdating } =
    useUpdateWatchItem();
  const { mutate: deleteProduct, isPending: isDeleting } =
    useDeleteWatchItem();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-charcoal-950">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (isError || !trackerItem) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 p-6 dark:bg-charcoal-950">
        <Text className="mb-4 text-center text-lg text-danger-600">
          Failed to load product
        </Text>
        <Button label="Try Again" onPress={() => refetch()} />
      </View>
    );
  }

  const product = trackerItem.tracked_product;

  const handleRefresh = () => {
    refreshProduct(
      { id: product.id },
      {
        onSuccess: () => {
          showMessage({
            message: 'Price Refreshed',
            description: 'Product price has been updated',
            type: 'success',
          });
          refetch();
        },
        onError: (error) => {
          showMessage({
            message: 'Error',
            description: error.message || 'Failed to refresh price',
            type: 'danger',
          });
        },
      }
    );
  };

  const handleTogglePause = () => {
    updateProduct(
      { id: product.id, data: { is_active: !product.is_active } },
      {
        onSuccess: () => {
          showMessage({
            message: product.is_active ? 'Tracking Paused' : 'Tracking Resumed',
            type: 'success',
          });
          refetch();
        },
        onError: (error) => {
          showMessage({
            message: 'Error',
            description: error.message || 'Failed to update tracking',
            type: 'danger',
          });
        },
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Stop Tracking',
      'Are you sure you want to stop tracking this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Tracking',
          style: 'destructive',
          onPress: () => {
            deleteProduct(
              { id: product.id },
              {
                onSuccess: () => {
                  showMessage({
                    message: 'Tracking Stopped',
                    description: 'Product removed from tracking',
                    type: 'success',
                  });
                  router.back();
                },
                onError: (error) => {
                  showMessage({
                    message: 'Error',
                    description: error.message || 'Failed to stop tracking',
                    type: 'danger',
                  });
                },
              }
            );
          },
        },
      ]
    );
  };

  return (
    <ProductDetail
      product={product}
      onRefresh={handleRefresh}
      onTogglePause={handleTogglePause}
      onDelete={handleDelete}
      isRefreshing={isRefreshing}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
    />
  );
}
