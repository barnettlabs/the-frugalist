import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, RefreshControl, View } from 'react-native';

import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { ScreenContainer, SectionHeader, Text } from '@/components/ui';
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  const compute = TOOLS.filter(t => t.key !== 'guides');
  const guides = TOOLS.find(t => t.key === 'guides');

  return (
    <ScreenContainer>
      <TabAwareScrollView
        style={{ flex: 1 }}
        extraBottomPadding={48}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />
        }
      >
        <SectionHeader
          eyebrow="Toolkit"
          title="The three tools."
          description="Built for the moment just before you click buy."
        />

        <View className="px-4 gap-3">
          {compute.map((tool) => {
            const Icon = tool.icon;
            const count = tool.countKey ? stats?.[tool.countKey] ?? 0 : 0;
            return (
              <Pressable
                key={tool.key}
                className="rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 active:opacity-70"
                onPress={() => router.push(tool.viewRoute as any)}
              >
                <View className="flex-row items-start justify-between mb-5">
                  <Text className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark">
                    {tool.number}
                  </Text>
                  <Icon color={theme.textMuted} size={20} />
                </View>

                <View className="flex-row items-end justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
                      {tool.eyebrow}
                    </Text>
                    <Text
                      className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
                      style={{ fontSize: 32, lineHeight: 38, includeFontPadding: false } as any}
                    >
                      {tool.title}
                    </Text>
                    <Text
                      className="font-display italic tracking-tightest"
                      style={{ fontSize: 32, lineHeight: 38, includeFontPadding: false, color: theme.accentDark } as any}
                    >
                      {tool.italic}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-1">
                      On file
                    </Text>
                    <Text
                      className="font-mono tracking-tight text-text-primary-light dark:text-text-primary-dark"
                      style={{ fontSize: 40, lineHeight: 46, includeFontPadding: false } as any}
                    >
                      {count}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm leading-5 text-text-muted-light dark:text-text-muted-dark mt-4">
                  {tool.description}
                </Text>

                {/* Footer */}
                <View className="flex-row items-center mt-5 pt-4 border-t border-border-light dark:border-border-dark gap-3">
                  <Pressable
                    onPress={() => router.push(tool.viewRoute as any)}
                    className="flex-row items-center gap-1.5 active:opacity-60"
                  >
                    <Text className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                      Open
                    </Text>
                    <Chevron direction="right" color={theme.textMuted} size={12} />
                  </Pressable>
                  <View className="flex-1" />
                  {tool.createRoute ? (
                    <Pressable
                      onPress={() => router.push(tool.createRoute as any)}
                      className="px-4 py-2.5 rounded-md bg-primary active:opacity-80"
                    >
                      <Text className="text-sm font-medium" style={{ color: colors.surface.light }}>
                        {tool.createLabel}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Field guides — editorial pull-card */}
        {guides ? (
          <View className="px-4 mt-4">
            <Pressable
              onPress={() => router.push(guides.viewRoute as any)}
              className="rounded-md overflow-hidden border border-primary-dark active:opacity-80"
              style={{ backgroundColor: '#171B27' }}
            >
              <View className="px-5 py-3 border-b border-white/10 flex-row items-center justify-between">
                <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
                  {guides.number} · {guides.eyebrow}
                </Text>
                <Book color="rgba(255,255,255,0.6)" size={14} />
              </View>
              <View className="px-5 py-6">
                <Text
                  className="font-display tracking-tightest text-white"
                  style={{ fontSize: 30, lineHeight: 36, includeFontPadding: false } as any}
                >
                  {guides.title}
                </Text>
                <Text
                  className="font-display italic tracking-tightest"
                  style={{ fontSize: 30, lineHeight: 36, includeFontPadding: false, color: colors.signal.light } as any}
                >
                  {guides.italic}
                </Text>
                <Text className="text-sm text-white/70 mt-3 leading-5">
                  {guides.description}
                </Text>
                <View className="mt-5 flex-row items-center gap-2">
                  <Text className="text-xs font-medium text-white">Open the guides</Text>
                  <Chevron direction="right" color="white" size={12} />
                </View>
              </View>
            </Pressable>
          </View>
        ) : null}
      </TabAwareScrollView>
    </ScreenContainer>
  );
}
