import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFinanceSheets } from '@/api/finance/use-finance-sheets';
import { useLeaseSheets } from '@/api/lease/use-lease-sheets';
import { FinanceCard } from '@/components/finance/finance-card';
import { LeaseCard } from '@/components/lease/lease-card';
import { Button, FloatingAddButton, Pressable, ScrollView, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Book } from '@/components/ui/icons';
import { SegmentTabs } from '@/components/ui/segment-tabs';

const TABS = [
  { key: 'finance', label: 'Finance' },
  { key: 'lease', label: 'Lease' },
];

export default function ComputeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = useCallback((key: string) => {
    const index = TABS.findIndex(t => t.key === key);
    if (index !== -1) {
      pagerRef.current?.setPage(index);
      setActiveTab(index);
    }
  }, []);

  const handlePageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    setActiveTab(e.nativeEvent.position);
  }, []);

  const activeKey = TABS[activeTab]?.key ?? 'finance';
  const fabColor = activeKey === 'finance' ? colors.accent.DEFAULT : colors.secondary.DEFAULT;
  const createRoute = activeKey === 'finance' ? '/(app)/compute/finance/create' : '/(app)/compute/lease/create';

  return (
    <View
      className="flex-1 bg-neutral-50 dark:bg-charcoal-950"
      style={{ paddingTop: Platform.OS === 'ios' ? insets.top : 0 }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: isDark ? colors.header.dark.background : colors.header.light.background,
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: 'Rubik-SemiBold',
              color: isDark ? colors.header.dark.text : colors.header.light.text,
              textAlign: 'center',
            }}
          >
            Estimates
          </Text>
        </View>
        <SegmentTabs tabs={TABS} activeTab={activeKey} onTabChange={handleTabChange} />
      </View>

      {/* PagerView */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View key="finance" style={{ flex: 1 }}>
          <FinanceList />
        </View>
        <View key="lease" style={{ flex: 1 }}>
          <LeaseList />
        </View>
      </PagerView>

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={() => router.push(createRoute as any)}
        color={fabColor}
        accessibilityLabel={`Create new ${activeKey} estimate`}
      />
    </View>
  );
}

function FinanceList() {
  const { data, isLoading, isError, refetch, isRefetching } = useFinanceSheets();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        <Text className="mt-4 text-neutral-600 dark:text-neutral-400">Loading estimates...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-center text-lg text-danger-600">Failed to load estimates</Text>
        <Button label="Try Again" onPress={() => refetch()} />
      </View>
    );
  }

  const sheets = data ?? [];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Terms Link */}
      <Link href="/(app)/compute/finance/learn" asChild>
        <Pressable className="mb-4 flex-row items-center rounded-xl bg-accent/10 px-4 py-3 dark:bg-accent/20">
          <View className="mr-3">
            <Book color={colors.accent.DEFAULT} size={18} />
          </View>
          <Text className="text-[15px] font-semibold text-accent dark:text-accent-light">
            Learn Financing Terms
          </Text>
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
  );
}

function LeaseList() {
  const { data, isLoading, isError, refetch, isRefetching } = useLeaseSheets();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.secondary.DEFAULT} />
        <Text className="mt-4 text-neutral-600 dark:text-neutral-400">Loading estimates...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-center text-lg text-danger-600">Failed to load estimates</Text>
        <Button label="Try Again" onPress={() => refetch()} />
      </View>
    );
  }

  const sheets = data ?? [];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Terms Link */}
      <Link href="/(app)/compute/lease/learn" asChild>
        <Pressable className="mb-4 flex-row items-center rounded-xl bg-secondary/10 px-4 py-3 dark:bg-secondary/20">
          <View className="mr-3">
            <Book color={colors.secondary.DEFAULT} size={18} />
          </View>
          <Text className="text-[15px] font-semibold text-secondary dark:text-secondary-light">
            Learn Leasing Terms
          </Text>
        </Pressable>
      </Link>

      {sheets.length === 0 ? (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
            No Lease Estimates
          </Text>
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
  );
}
