import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';

import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import {
  FocusAwareStatusBar,
  Pressable,
  ScreenContainer,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  Calculator as CalculatorIcon,
  Car as CarIcon,
  Tag as TagIcon,
} from '@/components/ui/icons';

export default function Dashboard() {
  const { data, isLoading, refetch, isRefetching } = useDashboardStats();

  return (
    <ScreenContainer>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className="text-4xl font-bold text-charcoal-900 dark:text-charcoal-50">
            Welcome Back
          </Text>
          <Text className="font-rubik text-charcoal-500 dark:text-charcoal-400">
            Manage your vehicle estimates and price tracking.
          </Text>
        </View>

        {/* Stats Cards - Clean modern style */}
        <View className="mb-6 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-charcoal-200/50 bg-white p-4 dark:border-charcoal-700/50 dark:bg-charcoal-900">
            <Text className="font-rubik text-xs font-medium uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
              Finance
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text className="font-rubik text-3xl font-bold text-primary-600 dark:text-primary-400">
                {data?.financeCount ?? 0}
              </Text>
            )}
          </View>
          <View className="flex-1 rounded-xl border border-charcoal-200/50 bg-white p-4 dark:border-charcoal-700/50 dark:bg-charcoal-900">
            <Text className="font-rubik text-xs font-medium uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
              Lease
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.secondary[500]} />
            ) : (
              <Text className="font-rubik text-3xl font-bold text-secondary-600 dark:text-secondary-400">
                {data?.leaseCount ?? 0}
              </Text>
            )}
          </View>
          <View className="flex-1 rounded-xl border border-charcoal-200/50 bg-white p-4 dark:border-charcoal-700/50 dark:bg-charcoal-900">
            <Text className="font-rubik text-xs font-medium uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
              Tracked
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accent.teal} />
            ) : (
              <Text className="font-rubik text-3xl font-bold text-accent-teal">
                {data?.trackerCount ?? 0}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Access */}
        <Text className="mb-3 font-rubik text-lg font-semibold text-charcoal-900 dark:text-charcoal-100">
          Quick Access
        </Text>
        <View className="mb-6 gap-3">
          <Link href="/(app)/finance/create" asChild>
            <Pressable className="flex-row items-center rounded-xl border border-charcoal-200/50 bg-white p-4 active:bg-charcoal-50 dark:border-charcoal-700/50 dark:bg-charcoal-900 dark:active:bg-charcoal-800">
              <View className="mr-4 rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
                <CalculatorIcon color={colors.primary[500]} />
              </View>
              <View className="flex-1">
                <Text className="font-rubik font-semibold text-charcoal-900 dark:text-charcoal-100">
                  New Finance Estimate
                </Text>
                <Text className="font-rubik text-sm text-charcoal-500 dark:text-charcoal-400">
                  Calculate vehicle financing payments
                </Text>
              </View>
            </Pressable>
          </Link>

          <Link href="/(app)/lease/create" asChild>
            <Pressable className="flex-row items-center rounded-xl border border-charcoal-200/50 bg-white p-4 active:bg-charcoal-50 dark:border-charcoal-700/50 dark:bg-charcoal-900 dark:active:bg-charcoal-800">
              <View className="mr-4 rounded-lg bg-secondary-100 p-3 dark:bg-secondary-900/30">
                <CarIcon color={colors.secondary[500]} />
              </View>
              <View className="flex-1">
                <Text className="font-rubik font-semibold text-charcoal-900 dark:text-charcoal-100">
                  New Lease Estimate
                </Text>
                <Text className="font-rubik text-sm text-charcoal-500 dark:text-charcoal-400">
                  Calculate vehicle lease payments
                </Text>
              </View>
            </Pressable>
          </Link>

          <Link href="/(app)/tracker/create" asChild>
            <Pressable className="flex-row items-center rounded-xl border border-charcoal-200/50 bg-white p-4 active:bg-charcoal-50 dark:border-charcoal-700/50 dark:bg-charcoal-900 dark:active:bg-charcoal-800">
              <View className="mr-4 rounded-lg bg-accent-teal/10 p-3 dark:bg-accent-teal/20">
                <TagIcon color={colors.accent.teal} />
              </View>
              <View className="flex-1">
                <Text className="font-rubik font-semibold text-charcoal-900 dark:text-charcoal-100">
                  Track a Product
                </Text>
                <Text className="font-rubik text-sm text-charcoal-500 dark:text-charcoal-400">
                  Monitor prices and get alerts
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>

        {/* Learning Center */}
        <Text className="mb-3 font-rubik text-lg font-semibold text-charcoal-900 dark:text-charcoal-100">
          Learning Center
        </Text>
        <View className="gap-3">
          <Link href="/(app)/learning/financing" asChild>
            <Pressable className="rounded-xl bg-primary-600 p-4 active:bg-primary-700">
              <Text className="font-rubik font-semibold text-white">
                Understanding Vehicle Financing
              </Text>
              <Text className="font-rubik text-sm text-primary-100">
                Learn key terms and tips for financing a vehicle
              </Text>
            </Pressable>
          </Link>

          <Link href="/(app)/learning/leasing" asChild>
            <Pressable className="rounded-xl bg-secondary-600 p-4 active:bg-secondary-700">
              <Text className="font-rubik font-semibold text-white">
                Understanding Vehicle Leasing
              </Text>
              <Text className="font-rubik text-sm text-secondary-100">
                Learn key terms and tips for leasing a vehicle
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
