import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, RefreshControl, View } from 'react-native';

import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { ScreenContainer, TabPageHeader, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Chevron } from '@/components/ui/icons';
import { TabAwareScrollView } from '@/components/ui/scroll-aware';
import { getThemeColors } from '@/components/ui/theme';
import type { AppHref } from '@/lib/navigation';

type Tool = {
	key: string;
	number: string;
	eyebrow: string;
	title: string;
	italic: string;
	description: string;
	countKey: 'watchCount' | 'financeCount' | 'leaseCount' | null;
	viewRoute: AppHref;
	createLabel?: string;
	createRoute?: AppHref;
};

const TOOLS: Tool[] = [
	{
		key: 'watch',
		number: '01',
		eyebrow: 'Watch',
		title: 'Track',
		italic: 'movement.',
		description: 'Drop-by-drop price history. Alerts only when motion makes the moment worth your attention.',
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
		countKey: null,
		viewRoute: '/learning',
	},
];

export default function ToolsScreen() {
	const { data: stats, refetch, isRefetching, isError: statsError } = useDashboardStats();
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const theme = getThemeColors(isDark);

	const compute = TOOLS.filter(t => t.key !== 'guides');
	const guides = TOOLS.find(t => t.key === 'guides');

	return (
		<ScreenContainer>
			<TabPageHeader title="Toolkit" />
			<TabAwareScrollView
				style={{ flex: 1 }}
				refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />}
			>
				<View className="gap-3 px-4 pb-4 pt-3">
					{compute.map(tool => {
						const count = statsError ? '—' : tool.countKey ? (stats?.[tool.countKey] ?? 0) : 0;
						return (
							<Pressable
								key={tool.key}
								className="rounded-md border border-border-light bg-surface-light p-5 active:opacity-70 dark:border-border-dark dark:bg-surface-dark"
								onPress={() => router.push(tool.viewRoute)}
							>
								<View className="mb-4 flex-row items-center justify-between">
									<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
										{tool.eyebrow}
									</Text>
									<Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
										{tool.number}
									</Text>
								</View>

								<Text
									className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
									style={{ fontSize: 32, lineHeight: 38, includeFontPadding: false }}
								>
									{tool.title}
								</Text>
								<Text
									className="font-display italic tracking-tightest"
									style={{ fontSize: 32, lineHeight: 38, includeFontPadding: false, color: theme.accentDark }}
								>
									{tool.italic}
								</Text>

								<Text className="mt-4 text-sm leading-5 text-text-muted-light dark:text-text-muted-dark">
									{tool.description}
								</Text>

								{/* Footer */}
								<View className="mt-5 flex-row items-center gap-3 border-t border-border-light pt-4 dark:border-border-dark">
									<View className="flex-row items-baseline gap-2">
										<Text
											className="font-mono text-text-primary-light dark:text-text-primary-dark"
											style={{ fontSize: 22, lineHeight: 26, includeFontPadding: false }}
										>
											{count}
										</Text>
										<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
											On file
										</Text>
									</View>
									<View className="flex-1" />
									<Pressable
										onPress={() => router.push(tool.viewRoute)}
										className="flex-row items-center gap-1 p-2 active:opacity-60"
										hitSlop={6}
									>
										<Text className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
											View
										</Text>
										<Chevron direction="right" color={theme.textMuted} size={12} />
									</Pressable>
									{tool.createRoute ? (
										<Pressable
											onPress={() => router.push(tool.createRoute!)}
											className="rounded-md bg-primary px-4 py-2.5 active:opacity-80"
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
					<View className="px-4 pb-4">
						<Pressable
							onPress={() => router.push(guides.viewRoute)}
							className="overflow-hidden rounded-md border border-primary-dark active:opacity-80"
							style={{ backgroundColor: '#171B27' }}
						>
							<View className="border-b border-white/10 px-5 py-3">
								<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-white/60">
									{guides.number} · {guides.eyebrow}
								</Text>
							</View>
							<View className="px-5 py-6">
								<Text
									className="font-display tracking-tightest text-white"
									style={{ fontSize: 30, lineHeight: 36, includeFontPadding: false }}
								>
									{guides.title}
								</Text>
								<Text
									className="font-display italic tracking-tightest"
									style={{ fontSize: 30, lineHeight: 36, includeFontPadding: false, color: colors.signal.light }}
								>
									{guides.italic}
								</Text>
								<Text className="mt-3 text-sm leading-5 text-white/70">{guides.description}</Text>
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
