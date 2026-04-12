import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';

import { useWatch } from '@/api/watch';
import { ProductCard } from '@/components/tracker/product-card';
import { Button, FloatingAddButton, Pressable, ScreenContainer, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import type { PriceTrackerFilter } from '@/lib/types/models';

const FILTERS: { key: PriceTrackerFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'target_reached', label: 'Target Reached' },
  { key: 'price_drops', label: 'Price Drops' },
];

export default function TrackerListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<PriceTrackerFilter>('all');
  const { data, isLoading, isError, refetch, isRefetching } = useWatch();

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text className="mt-4 text-neutral-600 dark:text-neutral-400">Loading products...</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="mb-4 text-center text-lg text-danger-600">Failed to load products</Text>
        <Button label="Try Again" onPress={() => refetch()} />
      </ScreenContainer>
    );
  }

  const allProducts = data?.tracked_products ?? [];

  // Filter products based on selected filter
  const filteredProducts = allProducts.filter((product) => {
    switch (filter) {
      case 'active':
        return product.is_active;
      case 'paused':
        return !product.is_active;
      case 'target_reached':
        return product.current_price <= product.target_price;
      case 'price_drops':
        return product.price_drop_percentage > 0;
      default:
        return true;
    }
  });

  return (
    <ScreenContainer>
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-12"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 6,
          gap: 8,
        }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 ${
              filter === f.key
                ? 'bg-accent'
                : 'border border-neutral-200 bg-neutral-50 dark:border-charcoal-600 dark:bg-charcoal-800'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === f.key ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {filteredProducts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
              {allProducts.length === 0 ? 'No Tracked Products' : 'No Products Match Filter'}
            </Text>
            <Text className="mb-6 text-center text-neutral-500 dark:text-neutral-400">
              {allProducts.length === 0
                ? 'Start tracking products to get notified when prices drop.'
                : 'Try selecting a different filter.'}
            </Text>
            {allProducts.length === 0 && (
              <Link href="/watch/create?from=watch" asChild>
                <Button label="Track a Product" />
              </Link>
            )}
          </View>
        ) : (
          <View className="gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={() => router.push('/watch/create?from=watch')}
        color={colors.accent.DEFAULT}
        accessibilityLabel="Track new product"
      />
    </ScreenContainer>
  );
}
