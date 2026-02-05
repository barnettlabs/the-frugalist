import { Link, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { useFinanceSheets } from '@/api/finance/use-finance-sheets';
import { FinanceCard } from '@/components/finance/finance-card';
import { Button, FloatingAddButton, Pressable, ScreenContainer, ScrollView, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Book } from '@/components/ui/icons';

export default function FinanceListScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useFinanceSheets();

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.info.DEFAULT} />
        <Text className="mt-4 text-neutral-600 dark:text-neutral-400">Loading estimates...</Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="mb-4 text-center text-lg text-danger-600">Failed to load estimates</Text>
        <Button label="Try Again" onPress={() => refetch()} />
      </ScreenContainer>
    );
  }

  const sheets = data ?? [];

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Terms Link */}
        <Link href="/compute/finance/learn" asChild>
          <Pressable className="mb-4 flex-row items-center rounded-xl bg-info/10 px-4 py-3 dark:bg-info/20">
            <View className="mr-3">
              <Book color={colors.info.DEFAULT} size={18} />
            </View>
            <Text className="text-[15px] font-semibold text-info dark:text-info-light">Learn Financing Terms</Text>
          </Pressable>
        </Link>

        {sheets.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
              No Finance Estimates
            </Text>
            <Text className="mb-6 text-center text-neutral-500 dark:text-neutral-400">
              Create your first finance estimate to get started with vehicle financing calculations.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {sheets.map(sheet => (
              <FinanceCard key={sheet.id} sheet={sheet} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={() => router.push('/compute/finance/create')}
        color={colors.info.DEFAULT}
        accessibilityLabel="Create new finance estimate"
      />
    </ScreenContainer>
  );
}
