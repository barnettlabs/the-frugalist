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

type Tool = {
	key: string;
	number: string;
	eyebrow: string;
	title: string;
	italic: string;
	description: string;
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
	const { data: stats, refetch, isRefetching } = useDashboardStats();
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
				<View className="px-4 pt-3 pb-4 gap-3">
					{compute.map(tool => {
						const count = tool.countKey ? (stats?.[tool.countKey] ?? 0) : 0;
						return (
							<Pressable
								key={tool.key}
								className="rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 active:opacity-70"
								onPress={() => router.push(tool.viewRoute as any)}
							>
								<View className="flex-row items-center justify-between mb-4">
									<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
										{tool.eyebrow}
									</Text>
									<Text className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark">
										{tool.number}
									</Text>
								</View>

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

								<Text className="text-sm leading-5 text-text-muted-light dark:text-text-muted-dark mt-4">
									{tool.description}
								</Text>

								{/* Footer */}
								<View className="flex-row items-center mt-5 pt-4 border-t border-border-light dark:border-border-dark gap-3">
									<View className="flex-row items-baseline gap-2">
										<Text
											className="font-mono text-text-primary-light dark:text-text-primary-dark"
											style={{ fontSize: 22, lineHeight: 26, includeFontPadding: false } as any}
										>
											{count}
										</Text>
										<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
											On file
										</Text>
									</View>
									<View className="flex-1" />
									<Pressable
										onPress={() => router.push(tool.viewRoute as any)}
										className="flex-row items-center gap-1 active:opacity-60 px-2 py-2"
										hitSlop={6}
									>
										<Text className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
											View
										</Text>
										<Chevron direction="right" color={theme.textMuted} size={12} />
									</Pressable>
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
					<View className="px-4 pb-4">
						<Pressable
							onPress={() => router.push(guides.viewRoute as any)}
							className="rounded-md overflow-hidden border border-primary-dark active:opacity-80"
							style={{ backgroundColor: '#171B27' }}
						>
							<View className="px-5 py-3 border-b border-white/10">
								<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
									{guides.number} · {guides.eyebrow}
								</Text>
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
								<Text className="text-sm text-white/70 mt-3 leading-5">{guides.description}</Text>
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
