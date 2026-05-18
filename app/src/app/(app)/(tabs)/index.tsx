import { Env } from '@env';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/api/auth/use-profile';
import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { useFinanceSheets } from '@/api/finance/use-finance-sheets';
import { useLeaseSheets } from '@/api/lease/use-lease-sheets';
import { useWatch } from '@/api/watch';
import { FocusAwareStatusBar, MastheadBar, ScreenContainer, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
	Calculator as CalculatorIcon,
	Car as CarIcon,
	Chevron,
	Eye as EyeIcon,
	Plus as PlusIcon,
} from '@/components/ui/icons';
import { TabAwareScrollView } from '@/components/ui/scroll-aware';
import { getThemeColors } from '@/components/ui/theme';
import type { PriceTrackerItem, VehicleFinanceSheet, VehicleLeaseSheet } from '@/lib/types/models';

type RecentItem = {
	id: string;
	type: 'finance' | 'lease' | 'watch';
	title: string;
	subtitle: string;
	updatedAt: Date;
	route: string;
	imageUrl?: string;
};

export default function Dashboard() {
	const { data: stats, refetch: refetchStats, isRefetching, isError: statsError } = useDashboardStats();
	const { data: user } = useProfile();
	const { data: financeSheets } = useFinanceSheets();
	const { data: leaseSheets } = useLeaseSheets();
	const { data: watchData } = useWatch();
	const { colorScheme } = useColorScheme();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const isDark = colorScheme === 'dark';
	const theme = getThemeColors(isDark);

	const greeting = React.useMemo(() => {
		const hour = new Date().getHours();
		if (hour < 5) return 'Still up';
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	}, []);

	const todayLabel = React.useMemo(() => {
		return new Date().toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		});
	}, []);

	const firstName = user?.first_name || 'Welcome';

	const recentItems = React.useMemo(() => {
		const items: RecentItem[] = [];

		(financeSheets ?? []).forEach((sheet: VehicleFinanceSheet) => {
			items.push({
				id: `finance-${sheet.id}`,
				type: 'finance',
				title: sheet.sheet_name || 'Finance Estimate',
				subtitle: [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model].filter(Boolean).join(' ') || 'Vehicle',
				updatedAt: new Date(sheet.updated_at),
				route: `/compute/finance/${sheet.id}?from=home`,
			});
		});

		(leaseSheets ?? []).forEach((sheet: VehicleLeaseSheet) => {
			items.push({
				id: `lease-${sheet.id}`,
				type: 'lease',
				title: sheet.sheet_name || 'Lease Estimate',
				subtitle: [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model].filter(Boolean).join(' ') || 'Vehicle',
				updatedAt: new Date(sheet.updated_at),
				route: `/compute/lease/${sheet.id}?from=home`,
			});
		});

		(watchData?.tracked_products ?? []).forEach((product: PriceTrackerItem['tracked_product']) => {
			items.push({
				id: `watch-${product.id}`,
				type: 'watch',
				title: product.product_name || 'Tracked Product',
				subtitle: product.retailer?.name || 'Unknown Retailer',
				updatedAt: new Date(product.last_checked_at || product.tracking_start_date),
				route: `/watch/${product.id}?from=home`,
				imageUrl: product.product_image_url,
			});
		});

		items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
		return items.slice(0, 6);
	}, [financeSheets, leaseSheets, watchData]);

	const totalActivity = (stats?.watchCount ?? 0) + (stats?.financeCount ?? 0) + (stats?.leaseCount ?? 0);
	const isFresh = totalActivity === 0;

	return (
		<ScreenContainer>
			<FocusAwareStatusBar />

			<TabAwareScrollView
				style={{ flex: 1, paddingTop: insets.top + 12 }}
				refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchStats} tintColor={theme.accent} />}
			>
				{/* Editorial masthead */}
				<Animated.View entering={FadeInDown.duration(500).delay(50)}>
					<MastheadBar left={todayLabel.toUpperCase()} right={`v ${Env.VERSION}`} />
				</Animated.View>

				{/* Greeting */}
				<Animated.View entering={FadeInDown.duration(500).delay(150)} className="px-4 mt-8 mb-8">
					<View className="flex-row items-start justify-between gap-4">
						<View className="flex-1">
							<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
								{greeting}
							</Text>
							<Text
								className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
								style={{ fontSize: 40, lineHeight: 48, includeFontPadding: false } as any}
							>
								{firstName}
							</Text>
							<Text
								className="font-display italic tracking-tight text-accent dark:text-accent-light mt-1"
								style={{ fontSize: 26, lineHeight: 34, includeFontPadding: false } as any}
							>
								{isFresh ? 'Let’s start small.' : 'Here’s where you stand.'}
							</Text>
						</View>
						<Link href="/(app)/profile" asChild>
							<Pressable className="active:opacity-70">
								<View className="w-12 h-12 rounded-full items-center justify-center border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden">
									{user?.avatar_url ? (
										<Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
									) : (
										<Text
											className="font-display text-text-primary-light dark:text-text-primary-dark"
											style={{ fontSize: 18, lineHeight: 24, includeFontPadding: false } as any}
										>
											{firstName[0]?.toUpperCase() || 'U'}
										</Text>
									)}
								</View>
							</Pressable>
						</Link>
					</View>
				</Animated.View>

				{/* Big-numeral focus trio */}
				<Animated.View entering={FadeInDown.duration(500).delay(250)} className="px-4 mb-8">
					<View
						className="flex-row rounded-md overflow-hidden border border-border-light dark:border-border-dark"
						style={{ backgroundColor: theme.cardBorder }}
					>
						<FocusTile
							label="Watch"
							value={statsError ? '—' : (stats?.watchCount ?? 0)}
							onPress={() => router.push('/watch?from=home')}
							theme={theme}
						/>
						<View style={{ width: 1, backgroundColor: theme.cardBorder }} />
						<FocusTile
							label="Finance"
							value={statsError ? '—' : (stats?.financeCount ?? 0)}
							onPress={() => router.push('/compute/finance?from=home')}
							theme={theme}
						/>
						<View style={{ width: 1, backgroundColor: theme.cardBorder }} />
						<FocusTile
							label="Lease"
							value={statsError ? '—' : (stats?.leaseCount ?? 0)}
							onPress={() => router.push('/compute/lease?from=home')}
							theme={theme}
						/>
					</View>
				</Animated.View>

				{/* Quick actions */}
				<Animated.View entering={FadeInDown.duration(500).delay(350)} className="px-4 mb-8">
					<View className="flex-row items-center gap-3 mb-3">
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
							Begin something
						</Text>
						<View className="flex-1 h-px bg-border-light dark:bg-border-dark" />
					</View>
					<View className="gap-2.5">
						<ActionRow
							label="Track a price"
							hint="Add a product, set a target"
							icon={<PlusIcon color="#FCFAF5" width={16} height={16} />}
							onPress={() => router.push('/watch/create?from=home' as any)}
							theme={theme}
						/>
						<ActionRow
							label="Run financing"
							hint="APR, amortization, total cost"
							icon={<CalculatorIcon color="#FCFAF5" size={16} />}
							onPress={() => router.push('/compute/finance/create?from=home' as any)}
							theme={theme}
						/>
						<ActionRow
							label="Run a lease"
							hint="Money factor, residual, true cost"
							icon={<CarIcon color="#FCFAF5" size={16} />}
							onPress={() => router.push('/compute/lease/create?from=home' as any)}
							theme={theme}
						/>
					</View>
				</Animated.View>

				{/* Recent activity */}
				<Animated.View entering={FadeInDown.duration(500).delay(450)} className="px-4 mb-4">
					<View className="flex-row items-center gap-3 mb-3">
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
							Recently filed
						</Text>
						<View className="flex-1 h-px bg-border-light dark:bg-border-dark" />
						{recentItems.length > 0 ? (
							<Pressable onPress={() => router.push('/(app)/(tabs)/tools')}>
								<Text className="text-xs font-medium text-primary dark:text-text-primary-dark">View all</Text>
							</Pressable>
						) : null}
					</View>

					{recentItems.length === 0 ? (
						<EmptyLedger onPress={() => router.push('/(app)/(tabs)/tools')} theme={theme} />
					) : (
						<View>
							{recentItems.map((item, index) => (
								<Pressable
									key={item.id}
									className={`flex-row items-center gap-3 py-3.5 active:opacity-60 ${
										index < recentItems.length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''
									}`}
									onPress={() => router.push(item.route as any)}
								>
									<RecentThumb item={item} theme={theme} />
									<View className="flex-1">
										<Text
											className="font-display text-base tracking-tight text-text-primary-light dark:text-text-primary-dark"
											style={{ lineHeight: 20, includeFontPadding: false } as any}
											numberOfLines={1}
										>
											{item.title}
										</Text>
										<View className="flex-row items-center gap-2 mt-0.5">
											<Text className="text-[10px] font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
												{labelFor(item.type)}
											</Text>
											<Text className="text-[10px] text-text-muted-light dark:text-text-muted-dark">·</Text>
											<Text
												className="text-xs text-text-muted-light dark:text-text-muted-dark flex-1"
												numberOfLines={1}
											>
												{item.subtitle}
											</Text>
										</View>
									</View>
									<Text className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark">
										{formatRelativeTime(item.updatedAt)}
									</Text>
									<Chevron direction="right" color={theme.textMuted} size={14} />
								</Pressable>
							))}
						</View>
					)}
				</Animated.View>
			</TabAwareScrollView>
		</ScreenContainer>
	);
}

// --- Sub-components ---

function FocusTile({
	label,
	value,
	onPress,
	theme,
}: {
	label: string;
	value: number | string;
	onPress: () => void;
	theme: ReturnType<typeof getThemeColors>;
}) {
	return (
		<Pressable
			className="flex-1 active:opacity-65"
			style={{ backgroundColor: theme.cardBg, paddingVertical: 18, paddingHorizontal: 16 }}
			onPress={onPress}
			android_ripple={{ color: theme.cardBorder }}
		>
			<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
				{label}
			</Text>
			<Text
				className="font-mono tracking-tight text-text-primary-light dark:text-text-primary-dark"
				style={{ fontSize: 36, lineHeight: 42, includeFontPadding: false } as any}
			>
				{value}
			</Text>
		</Pressable>
	);
}

function RecentThumb({ item, theme }: { item: RecentItem; theme: ReturnType<typeof getThemeColors> }) {
	if (item.type === 'watch' && item.imageUrl) {
		return (
			<View className="size-12 rounded-md overflow-hidden border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
				<Image source={{ uri: item.imageUrl }} style={styles.thumbImage} contentFit="cover" />
			</View>
		);
	}
	const Icon = item.type === 'finance' ? CalculatorIcon : item.type === 'lease' ? CarIcon : EyeIcon;
	return (
		<View className="size-12 items-center justify-center rounded-md border border-border-light dark:border-border-dark bg-tan-light dark:bg-charcoal-800">
			<Icon color={theme.textMuted} size={18} />
		</View>
	);
}

function ActionRow({
	label,
	hint,
	icon,
	onPress,
	theme,
}: {
	label: string;
	hint: string;
	icon: React.ReactNode;
	onPress: () => void;
	theme: ReturnType<typeof getThemeColors>;
}) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center gap-3 px-4 py-3.5 rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark active:opacity-60"
		>
			<View className="w-10 h-10 items-center justify-center rounded-md bg-primary dark:bg-text-primary-dark">
				{icon}
			</View>
			<View className="flex-1">
				<Text className="text-[15px] font-medium text-text-primary-light dark:text-text-primary-dark">{label}</Text>
				<Text className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">{hint}</Text>
			</View>
			<Chevron direction="right" color={theme.textMuted} size={14} />
		</Pressable>
	);
}

function EmptyLedger({ onPress, theme }: { onPress: () => void; theme: ReturnType<typeof getThemeColors> }) {
	return (
		<View
			className="rounded-md p-6 overflow-hidden border"
			style={{
				backgroundColor: colors.primary.DEFAULT,
				borderColor: colors.primary.dark,
			}}
		>
			<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-3">Your first entry</Text>
			<Text className="font-display tracking-tightest text-white" style={{ fontSize: 28, lineHeight: 30 }}>
				Pick something you’ve been
			</Text>
			<Text
				className="font-display italic tracking-tightest mt-1"
				style={{ fontSize: 28, lineHeight: 30, color: colors.signal.light }}
			>
				eyeing.
			</Text>
			<Text className="text-sm text-white/70 mt-3 mb-5">
				Track your first product. Set a target. Wait for the market to come to you.
			</Text>
			<Pressable onPress={onPress} className="self-start rounded-md px-5 py-3 bg-surface-light">
				<Text className="text-sm font-medium text-primary">Track first product</Text>
			</Pressable>
		</View>
	);
}

// --- Helpers ---

function formatRelativeTime(date: Date) {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return 'now';
	if (minutes < 60) return `${minutes}m`;
	if (hours < 24) return `${hours}h`;
	if (days < 7) return `${days}d`;
	return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function labelFor(type: RecentItem['type']) {
	switch (type) {
		case 'finance':
			return 'FIN';
		case 'lease':
			return 'LEASE';
		case 'watch':
			return 'WATCH';
	}
}

const styles = StyleSheet.create({
	avatarImage: {
		width: '100%',
		height: '100%',
	},
	thumbImage: {
		width: '100%',
		height: '100%',
	},
});
