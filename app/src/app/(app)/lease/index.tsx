import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';

import { useLeaseSheets } from '@/api/lease/use-lease-sheets';
import { LeaseCard } from '@/components/lease/lease-card';
import { Button, ScreenContainer, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

export default function LeaseListScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useLeaseSheets();

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text className="mt-4 text-neutral-600 dark:text-neutral-400">
          Loading estimates...
        </Text>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="mb-4 text-center text-lg text-danger-600">
          Failed to load estimates
        </Text>
        <Button label="Try Again" onPress={() => refetch()} />
      </ScreenContainer>
    );
  }

  const sheets = data ?? [];

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {sheets.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
              No Lease Estimates
            </Text>
            <Text className="mb-6 text-center text-neutral-500 dark:text-neutral-400">
              Create your first lease estimate to get started with vehicle
              leasing calculations.
            </Text>
            <Link href="/(app)/lease/create" asChild>
              <Button label="Create Estimate" />
            </Link>
          </View>
        ) : (
          <View className="gap-4">
            {sheets.map((sheet) => (
              <LeaseCard key={sheet.id} sheet={sheet} />
            ))}
          </View>
        )}
      </ScrollView>

      {sheets.length > 0 && (
        <View className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <Link href="/(app)/lease/create" asChild>
            <Button label="Create New Estimate" />
          </Link>
        </View>
      )}
    </ScreenContainer>
  );
}
