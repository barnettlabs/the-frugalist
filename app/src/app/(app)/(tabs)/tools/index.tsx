import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { ScreenContainer, ScrollView, ToolCard } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Book, Calculator as CalculatorIcon, Car as CarIcon, Eye as EyeIcon } from '@/components/ui/icons';

const TOOLS = [
  {
    key: 'watch',
    title: 'Watch',
    subtitle: 'Track product prices',
    icon: (color: string) => <EyeIcon color={color} size={20} />,
    accentColor: colors.accent.DEFAULT,
    countKey: 'watchCount' as const,
    viewRoute: '/watch',
    createRoute: '/watch/create',
  },
  {
    key: 'finance',
    title: 'Finance',
    subtitle: 'Calculate loan payments',
    icon: (color: string) => <CalculatorIcon color={color} size={20} />,
    accentColor: colors.info.DEFAULT,
    countKey: 'financeCount' as const,
    viewRoute: '/compute/finance',
    createRoute: '/compute/finance/create',
  },
  {
    key: 'lease',
    title: 'Lease',
    subtitle: 'Calculate lease payments',
    icon: (color: string) => <CarIcon color={color} size={20} />,
    accentColor: colors.success.DEFAULT,
    countKey: 'leaseCount' as const,
    viewRoute: '/compute/lease',
    createRoute: '/compute/lease/create',
  },
  {
    key: 'guides',
    title: 'Guides',
    subtitle: 'Learn the terminology',
    icon: (color: string) => <Book color={color} size={20} />,
    accentColor: colors.neutral[500],
    countKey: null,
    viewRoute: '/learning',
    createRoute: null,
  },
];

export default function ToolsScreen() {
  const { data: stats, isLoading, refetch, isRefetching } = useDashboardStats();
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent.DEFAULT} />
        }
      >
        {/* Tool Grid */}
        <View style={styles.toolGrid}>
          {TOOLS.map((tool, index) => (
            <ToolCard
              key={tool.key}
              title={tool.title}
              icon={tool.icon(tool.accentColor)}
              accentColor={tool.accentColor}
              count={tool.countKey ? (stats?.[tool.countKey] ?? 0) : undefined}
              isLoading={tool.countKey ? isLoading : false}
              size="default"
              delay={100 + index * 75}
              onPress={() => router.push(tool.viewRoute as any)}
              onCreateNew={tool.createRoute ? () => router.push(tool.createRoute as any) : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
