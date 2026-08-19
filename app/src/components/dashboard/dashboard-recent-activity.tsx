import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { Chevron } from '@/components/ui/icons';
import type { getThemeColors } from '@/components/ui/theme';
import type { AppHref } from '@/lib/navigation';
import type { PriceTrackerItem, VehicleFinanceSheet, VehicleLeaseSheet } from '@/lib/types/models';

import { EmptyLedger } from './empty-ledger';
import type { RecentItem } from './recent-thumb';
import { RecentThumb } from './recent-thumb';

type WatchData = { tracked_products?: PriceTrackerItem['tracked_product'][] };

type DashboardRecentActivityProps = {
	financeSheets?: VehicleFinanceSheet[];
	leaseSheets?: VehicleLeaseSheet[];
	watchData?: WatchData;
	theme: ReturnType<typeof getThemeColors>;
};

function formatRelativeTime(date: Date) {
	const diff = Date.now() - date.getTime();
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
	if (type === 'finance') return 'FIN';
	if (type === 'lease') return 'LEASE';
	return 'WATCH';
}

export const DashboardRecentActivity = React.memo(function DashboardRecentActivity({
	financeSheets,
	leaseSheets,
	watchData,
	theme,
}: DashboardRecentActivityProps) {
	const router = useRouter();

	const recentItems = React.useMemo(() => {
		const items: RecentItem[] = [];
		(financeSheets ?? []).forEach((sheet: VehicleFinanceSheet) => {
			items.push({
				id: `finance-${sheet.id}`,
				type: 'finance',
				title: sheet.sheet_name || 'Finance Estimate',
				subtitle: [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model].filter(Boolean).join(' ') || 'Vehicle',
				updatedAt: new Date(sheet.updated_at),
				route: `/compute/finance/${sheet.id}?from=home` as AppHref,
			});
		});
		(leaseSheets ?? []).forEach((sheet: VehicleLeaseSheet) => {
			items.push({
				id: `lease-${sheet.id}`,
				type: 'lease',
				title: sheet.sheet_name || 'Lease Estimate',
				subtitle: [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model].filter(Boolean).join(' ') || 'Vehicle',
				updatedAt: new Date(sheet.updated_at),
				route: `/compute/lease/${sheet.id}?from=home` as AppHref,
			});
		});
		(watchData?.tracked_products ?? []).forEach((product: PriceTrackerItem['tracked_product']) => {
			items.push({
				id: `watch-${product.id}`,
				type: 'watch',
				title: product.product_name || 'Tracked Product',
				subtitle: product.retailer?.name || 'Unknown Retailer',
				updatedAt: new Date(product.last_checked_at || product.tracking_start_date),
				route: `/watch/${product.id}?from=home` as AppHref,
				imageUrl: product.product_image_url,
			});
		});
		items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
		return items.slice(0, 6);
	}, [financeSheets, leaseSheets, watchData]);

	return (
		<>
			<View className="mb-3 flex-row items-center gap-3">
				<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
					Recently filed
				</Text>
				<View className="h-px flex-1 bg-border-light dark:bg-border-dark" />
				{recentItems.length > 0 ? (
					<Pressable onPress={() => router.push('/(app)/(tabs)/tools')}>
						<Text className="text-xs font-medium text-primary dark:text-text-primary-dark">View all</Text>
					</Pressable>
				) : null}
			</View>

			{recentItems.length === 0 ? (
				<EmptyLedger onPress={() => router.push('/(app)/(tabs)/tools')} />
			) : (
				<View>
					{recentItems.map((item, index) => (
						<Pressable
							key={item.id}
							className={`flex-row items-center gap-3 py-3.5 active:opacity-60 ${
								index < recentItems.length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''
							}`}
							onPress={() => router.push(item.route)}
						>
							<RecentThumb item={item} theme={theme} />
							<View className="flex-1">
								<Text
									className="font-display text-base tracking-tight text-text-primary-light dark:text-text-primary-dark"
									style={{ lineHeight: 20, includeFontPadding: false }}
									numberOfLines={1}
								>
									{item.title}
								</Text>
								<View className="mt-0.5 flex-row items-center gap-2">
									<Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
										{labelFor(item.type)}
									</Text>
									<Text className="text-[10px] text-text-muted-light dark:text-text-muted-dark">·</Text>
									<Text className="flex-1 text-xs text-text-muted-light dark:text-text-muted-dark" numberOfLines={1}>
										{item.subtitle}
									</Text>
								</View>
							</View>
							<Text className="font-mono text-[10px] text-text-muted-light dark:text-text-muted-dark">
								{formatRelativeTime(item.updatedAt)}
							</Text>
							<Chevron direction="right" color={theme.textMuted} size={14} />
						</Pressable>
					))}
				</View>
			)}
		</>
	);
});
