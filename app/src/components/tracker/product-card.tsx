import { Link } from 'expo-router';
import React from 'react';

import { Image, Pressable, Text, View } from '@/components/ui';
import { tw } from '@/components/ui/theme';
import { formatCurrencyWithSymbol, formatRelativeTime } from '@/lib/calculators';
import type { PriceTrackerItem } from '@/lib/types/models';

interface ProductCardProps {
  product: PriceTrackerItem['tracked_product'];
}

export function ProductCard({ product }: ProductCardProps) {
  const targetReached = product.current_price <= product.target_price;
  const progress =
    ((product.retail_price - product.current_price) / (product.retail_price - product.target_price)) * 100;

  return (
    <Link href={`/watch/${product.id}?from=watch`} asChild>
      {/* Clean card with subtle border */}
      <Pressable className={`p-4 active:bg-neutral-50 dark:active:bg-charcoal-800 ${tw.cardElevated}`}>
        <View className="flex-row">
          {/* Product Image */}
          {product.product_image_url ? (
            <Image
              source={{ uri: product.product_image_url }}
              className="mr-4 size-20 rounded-lg bg-charcoal-100 dark:bg-charcoal-800"
              contentFit="contain"
            />
          ) : (
            <View className="mr-4 size-20 items-center justify-center rounded-lg bg-charcoal-100 dark:bg-charcoal-800">
              <Text className="text-2xl">📦</Text>
            </View>
          )}

          {/* Product Info */}
          <View className="flex-1">
            <View className="mb-1 flex-row items-start justify-between">
              <Text className="flex-1 font-semibold text-charcoal-900 dark:text-white" numberOfLines={2}>
                {product.product_name}
              </Text>
              {/* Status Badge */}
              {targetReached ? (
                <View className="ml-2 rounded-md bg-secondary/10 px-2 py-0.5 dark:bg-secondary/20">
                  <Text className="text-xs font-semibold text-secondary dark:text-secondary-light">Target</Text>
                </View>
              ) : !product.is_active ? (
                <View className="ml-2 rounded-md bg-charcoal-200 px-2 py-0.5 dark:bg-charcoal-700">
                  <Text className="text-xs font-semibold text-charcoal-600 dark:text-charcoal-400">Paused</Text>
                </View>
              ) : product.price_drop_percentage > 0 ? (
                <View className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 dark:bg-primary/20">
                  <Text className="text-xs font-semibold text-primary dark:text-primary-light">
                    -{product.price_drop_percentage.toFixed(0)}%
                  </Text>
                </View>
              ) : null}
            </View>

            <Text className="text-sm text-charcoal-500 dark:text-charcoal-400">{product.retailer.name}</Text>

            {/* Prices */}
            <View className="mt-2 flex-row items-baseline gap-2">
              <Text className="text-lg font-bold text-primary dark:text-primary-light">
                {formatCurrencyWithSymbol(product.current_price)}
              </Text>
              {product.current_price < product.retail_price && (
                <Text className="text-sm text-charcoal-400 line-through dark:text-charcoal-500">
                  {formatCurrencyWithSymbol(product.retail_price)}
                </Text>
              )}
            </View>

            {/* Target */}
            <Text className="text-xs text-charcoal-500 dark:text-charcoal-400">
              Target: {formatCurrencyWithSymbol(product.target_price)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {!targetReached && (
          <View className="mt-3">
            <View className="h-1.5 rounded-full bg-charcoal-100 dark:bg-charcoal-700">
              <View
                className="h-1.5 rounded-full bg-primary"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </View>
            <Text className="mt-1 text-right text-xs text-charcoal-500 dark:text-charcoal-400">
              {Math.max(progress, 0).toFixed(0)}% to target
            </Text>
          </View>
        )}

        {/* Last Checked */}
        {product.last_checked_at && (
          <Text className="mt-2 text-xs text-charcoal-400 dark:text-charcoal-500">
            Last checked {formatRelativeTime(product.last_checked_at)}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}
