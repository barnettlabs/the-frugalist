import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Image, ScrollView, Text, View } from '@/components/ui';
import {
  formatCurrencyWithSymbol,
  formatDate,
  formatRelativeTime,
} from '@/lib/calculators';
import type { PriceTrackerItem } from '@/lib/types/models';

interface ProductDetailProps {
  product: PriceTrackerItem['tracked_product'];
  onRefresh: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
  isRefreshing: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function ProductDetail({
  product,
  onRefresh,
  onTogglePause,
  onDelete,
  isRefreshing,
  isUpdating,
  isDeleting,
}: ProductDetailProps) {
  const insets = useSafeAreaInsets();
  const targetReached = product.current_price <= product.target_price;

  // Account for floating tab bar (64px height + 16px margin + safe area)
  const bottomPadding = Math.max(insets.bottom, 16) + 80;

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <ProductHeader product={product} targetReached={targetReached} />
        <PriceInfoCard product={product} />
        {!targetReached && <ProgressCard product={product} />}
        <TrackingInfoCard product={product} />
        {product.price_history && product.price_history.length > 0 && (
          <PriceHistoryCard priceHistory={product.price_history} />
        )}
        {product.last_scraper_error && (
          <ErrorCard error={product.last_scraper_error} />
        )}
        <View className="h-20" />
      </ScrollView>
      <ActionBar
        product={product}
        onRefresh={onRefresh}
        onTogglePause={onTogglePause}
        onDelete={onDelete}
        isRefreshing={isRefreshing}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        bottomPadding={bottomPadding}
      />
    </View>
  );
}

function ProductHeader({
  product,
  targetReached,
}: {
  product: PriceTrackerItem['tracked_product'];
  targetReached: boolean;
}) {
  return (
    <View className="mb-4 items-center rounded-xl bg-white p-4 dark:bg-neutral-800">
      {product.product_image_url ? (
        <Image
          source={{ uri: product.product_image_url }}
          className="mb-4 size-40 rounded-lg bg-neutral-100"
          contentFit="contain"
        />
      ) : (
        <View className="mb-4 size-40 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
          <Text className="text-6xl">📦</Text>
        </View>
      )}
      <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-white">
        {product.product_name}
      </Text>
      {product.product_variant && (
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          {product.product_variant}
        </Text>
      )}
      <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {product.retailer.name} • {product.sku_upc}
      </Text>
      <StatusBadge targetReached={targetReached} isActive={product.is_active} />
    </View>
  );
}

function StatusBadge({
  targetReached,
  isActive,
}: {
  targetReached: boolean;
  isActive: boolean;
}) {
  if (targetReached) {
    return (
      <View className="mt-3 rounded-full bg-green-100 px-4 py-2 dark:bg-green-900">
        <Text className="font-semibold text-green-700 dark:text-green-300">
          🎉 Target Price Reached!
        </Text>
      </View>
    );
  }
  if (!isActive) {
    return (
      <View className="mt-3 rounded-full bg-neutral-200 px-4 py-2 dark:bg-neutral-600">
        <Text className="font-medium text-neutral-600 dark:text-neutral-300">
          Tracking Paused
        </Text>
      </View>
    );
  }
  return (
    <View className="mt-3 rounded-full bg-blue-100 px-4 py-2 dark:bg-blue-900">
      <Text className="font-medium text-blue-700 dark:text-blue-300">
        Actively Tracking
      </Text>
    </View>
  );
}

function PriceInfoCard({
  product,
}: {
  product: PriceTrackerItem['tracked_product'];
}) {
  const savings = product.retail_price - product.current_price;
  const savingsPercent = (savings / product.retail_price) * 100;

  return (
    <View className="mb-4 rounded-xl bg-white p-4 dark:bg-neutral-800">
      <View className="flex-row justify-between">
        <View className="flex-1 items-center">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Current
          </Text>
          <Text className="text-2xl font-bold text-primary-600">
            {formatCurrencyWithSymbol(product.current_price)}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Target
          </Text>
          <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
            {formatCurrencyWithSymbol(product.target_price)}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Retail
          </Text>
          <Text className="text-2xl font-bold text-neutral-400 line-through">
            {formatCurrencyWithSymbol(product.retail_price)}
          </Text>
        </View>
      </View>
      {savings > 0 && (
        <View className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <Text className="text-center text-green-700 dark:text-green-400">
            You{"'"}re saving {formatCurrencyWithSymbol(savings)} (
            {savingsPercent.toFixed(0)}% off)
          </Text>
        </View>
      )}
    </View>
  );
}

function ProgressCard({
  product,
}: {
  product: PriceTrackerItem['tracked_product'];
}) {
  const progress = Math.min(
    Math.max(
      ((product.retail_price - product.current_price) /
        (product.retail_price - product.target_price)) *
        100,
      0
    ),
    100
  );
  return (
    <View className="mb-4 rounded-xl bg-white p-4 dark:bg-neutral-800">
      <Text className="mb-2 font-semibold text-neutral-900 dark:text-white">
        Progress to Target
      </Text>
      <View className="h-4 rounded-full bg-neutral-200 dark:bg-neutral-700">
        <View
          className="h-4 rounded-full bg-primary-500"
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        {formatCurrencyWithSymbol(product.current_price - product.target_price)}{' '}
        to go
      </Text>
    </View>
  );
}

function TrackingInfoCard({
  product,
}: {
  product: PriceTrackerItem['tracked_product'];
}) {
  return (
    <View className="mb-4 rounded-xl bg-white p-4 dark:bg-neutral-800">
      <Text className="mb-3 font-semibold text-neutral-900 dark:text-white">
        Tracking Info
      </Text>
      <View className="gap-2">
        <InfoRow
          label="Started Tracking"
          value={formatDate(product.tracking_start_date)}
        />
        {product.last_checked_at && (
          <InfoRow
            label="Last Checked"
            value={formatRelativeTime(product.last_checked_at)}
          />
        )}
        {product.price_drop_percentage > 0 && (
          <InfoRow
            label="Price Drop"
            value={`${product.price_drop_percentage.toFixed(1)}%`}
            highlight
          />
        )}
      </View>
    </View>
  );
}

function PriceHistoryCard({
  priceHistory,
}: {
  priceHistory: { checked_at: string; price: number }[];
}) {
  return (
    <View className="mb-4 rounded-xl bg-white p-4 dark:bg-neutral-800">
      <Text className="mb-3 font-semibold text-neutral-900 dark:text-white">
        Price History
      </Text>
      <View className="gap-2">
        {priceHistory.slice(0, 10).map((entry, index) => (
          <View key={index} className="flex-row justify-between">
            <Text className="text-neutral-500 dark:text-neutral-400">
              {formatDate(entry.checked_at)}
            </Text>
            <Text className="font-medium text-neutral-900 dark:text-white">
              {formatCurrencyWithSymbol(entry.price)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <View className="mb-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
      <Text className="font-medium text-red-700 dark:text-red-400">
        Last Error
      </Text>
      <Text className="mt-1 text-sm text-red-600 dark:text-red-300">
        {error}
      </Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-neutral-500 dark:text-neutral-400">{label}</Text>
      <Text
        className={`font-medium ${highlight ? 'text-green-600' : 'text-neutral-900 dark:text-white'}`}
      >
        {value}
      </Text>
    </View>
  );
}

type ActionBarProps = {
  product: PriceTrackerItem['tracked_product'];
  onRefresh: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
  isRefreshing: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  bottomPadding: number;
};

function ActionBar({
  product,
  onRefresh,
  onTogglePause,
  onDelete,
  isRefreshing,
  isUpdating,
  isDeleting,
  bottomPadding,
}: ActionBarProps) {
  return (
    <View
      className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
      style={{ paddingBottom: bottomPadding }}
    >
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label={isRefreshing ? 'Refreshing...' : 'Refresh Price'}
            variant="outline"
            onPress={onRefresh}
            disabled={isRefreshing}
          />
        </View>
        <View className="flex-1">
          <Button
            label={
              isUpdating
                ? 'Updating...'
                : product.is_active
                  ? 'Pause'
                  : 'Resume'
            }
            variant="secondary"
            onPress={onTogglePause}
            disabled={isUpdating}
          />
        </View>
      </View>
      <View className="mt-3">
        <Button
          label={isDeleting ? 'Removing...' : 'Stop Tracking'}
          variant="destructive"
          onPress={onDelete}
          disabled={isDeleting}
        />
      </View>
    </View>
  );
}
