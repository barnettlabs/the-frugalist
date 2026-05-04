import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { MastheadBar, ScreenContainer, SectionHeader, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  Book,
  Calculator as CalculatorIcon,
  Car as CarIcon,
  Chevron,
  Eye as EyeIcon,
} from '@/components/ui/icons';
import { TabAwareScrollView } from '@/components/ui/scroll-aware';
import { getThemeColors } from '@/components/ui/theme';

type Tool = {
  key: string;
  number: string;
  eyebrow: string;
  title: string;
  italic: string;
  description: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  countKey: 'watchCount' | 'financeCount' | 'leaseCount' | null;
  viewRoute: string;
  createLabel?: string;
  createRoute?: string;
};

const TOOLS: Tool[] = [
  {
    key: 'watch',
    number: '01',
    eyebrow: 'Watch',
    title: 'Track',
    italic: 'movement.',
    description: 'Drop-by-drop price history. Alerts only when motion makes the moment worth your attention.',
    icon: EyeIcon,
    countKey: 'watchCount',
    viewRoute: '/watch?from=tools',
    createLabel: 'Track new',
    createRoute: '/watch/create?from=tools',
  },
  {
    key: 'finance',
    number: '02',
    eyebrow: 'Compute · Finance',
    title: 'Run',
    italic: 'the loan.',
    description: 'Monthly payment, total interest, amortization. The full cost of every offer.',
    icon: CalculatorIcon,
    countKey: 'financeCount',
    viewRoute: '/compute/finance?from=tools',
    createLabel: 'New estimate',
    createRoute: '/compute/finance/create?from=tools',
  },
  {
    key: 'lease',
    number: '03',
    eyebrow: 'Compute · Lease',
    title: 'Read',
    italic: 'the lease.',
    description: 'Money factor, residual, true monthly cost. Read the lease before you sign it.',
    icon: CarIcon,
    countKey: 'leaseCount',
    viewRoute: '/compute/lease?from=tools',
    createLabel: 'New estimate',
    createRoute: '/compute/lease/create?from=tools',
  },
  {
    key: 'guides',
    number: '04',
    eyebrow: 'Field guides',
    title: 'Read',
    italic: 'the room.',
    description: 'Field notes on the tactics dealers use. Recognize the play before it lands.',
    icon: Book,
    countKey: null,
    viewRoute: '/learning',
  },
];

export default function ToolsScreen() {
  const { data: stats, refetch, isRefetching } = useDashboardStats();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  return (
    <ScreenContainer>
      <TabAwareScrollView
        style={{ flex: 1, paddingTop: insets.top + 12 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />
        }
      >
        <MastheadBar
          left="Tools"
          center="A field guide to what things should cost"
          right={`v 1.0.0`}
        />

        <SectionHeader
          eyebrow="Toolkit"
          title="The three tools."
          description="Built for the moment just before you click buy."
        />

        <View className="px-4 gap-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const count = tool.countKey ? stats?.[tool.countKey] ?? 0 : null;
            return (
              <Pressable
                key={tool.key}
                className="rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 active:opacity-80"
                onPress={() => router.push(tool.viewRoute as any)}
              >
                <View className="flex-row items-start justify-between mb-5">
                  <Text className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark">
                    {tool.number}
                  </Text>
                  <Icon color={theme.textMuted} size={20} />
                </View>

                <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
                  {tool.eyebrow}
                </Text>

                <Text
                  className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
                  style={{ fontSize: 32, lineHeight: 34 }}
                >
                  {tool.title}
                </Text>
                <Text
                  className="font-display italic tracking-tightest"
                  style={{ fontSize: 32, lineHeight: 34, color: theme.accentDark }}
                >
                  {tool.italic}
                </Text>

                <Text className="text-sm leading-5 text-text-muted-light dark:text-text-muted-dark mt-4">
                  {tool.description}
                </Text>

                {/* Footer */}
                <View className="flex-row items-center mt-5 pt-4 border-t border-border-light dark:border-border-dark">
                  {count !== null ? (
                    <View className="flex-row items-baseline">
                      <Text
                        className="font-mono text-text-primary-light dark:text-text-primary-dark"
                        style={{ fontSize: 22 }}
                      >
                        {count}
                      </Text>
                      <Text className="ml-2 text-xs text-text-muted-light dark:text-text-muted-dark">
                        on file
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-xs text-text-muted-light dark:text-text-muted-dark">
                      Open the guides
                    </Text>
                  )}
                  <View className="flex-1" />
                  {tool.createRoute ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        router.push(tool.createRoute as any);
                      }}
                      className="px-3 py-1.5 rounded-md bg-primary"
                    >
                      <Text className="text-xs font-medium" style={{ color: colors.surface.light }}>
                        {tool.createLabel}
                      </Text>
                    </Pressable>
                  ) : (
                    <Chevron direction="right" color={theme.textMuted} size={16} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </TabAwareScrollView>
    </ScreenContainer>
  );
}
