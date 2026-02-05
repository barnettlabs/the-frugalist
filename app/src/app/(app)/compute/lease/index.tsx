import { Link, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { useLeaseSheets } from '@/api/lease/use-lease-sheets';
import { LeaseCard } from '@/components/lease/lease-card';
import { Button, FloatingAddButton, Pressable, ScreenContainer, ScrollView, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Book } from '@/components/ui/icons';

export default function LeaseListScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useLeaseSheets();

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.success.DEFAULT} />
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
        <Link href="/compute/lease/learn?from=lease" asChild>
          <Pressable className="mb-4 flex-row items-center rounded-xl bg-success/10 px-4 py-3 dark:bg-success/20">
            <View className="mr-3">
              <Book color={colors.success.DEFAULT} size={18} />
            </View>
            <Text className="text-[15px] font-semibold text-success dark:text-success-light">Learn Leasing Terms</Text>
          </Pressable>
        </Link>

        {sheets.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">No Lease Estimates</Text>
            <Text className="mb-6 text-center text-neutral-500 dark:text-neutral-400">
              Create your first lease estimate to get started with vehicle leasing calculations.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {sheets.map(sheet => (
              <LeaseCard key={sheet.id} sheet={sheet} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={() => router.push('/compute/lease/create?from=lease')}
        color={colors.success.DEFAULT}
        accessibilityLabel="Create new lease estimate"
      />
    </ScreenContainer>
  );
}
