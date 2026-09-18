import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';

import { useWatch } from '@/api/watch';
import { ProductCard } from '@/components/tracker/product-card';
import {
	Button,
	colors,
	FloatingAddButton,
	Pressable,
	ScreenContainer,
	ScrollView,
	TabPageHeader,
	Text,
	View,
} from '@/components/ui';
import { Plus as PlusIcon } from '@/components/ui/icons';
import { getThemeColors } from '@/components/ui/theme';
import type { PriceTrackerFilter } from '@/lib/types/models';
import { safeFromParam } from '@/lib/types/navigation';

const FILTERS: { key: PriceTrackerFilter; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'active', label: 'Active' },
	{ key: 'paused', label: 'Paused' },
	{ key: 'target_reached', label: 'At target' },
	{ key: 'price_drops', label: 'Drops' },
];

const BACK_LABELS: Record<string, string> = { home: 'Home', tools: 'Toolkit' };

export default function TrackerListScreen() {
	const router = useRouter();
	const { from: fromRaw } = useLocalSearchParams<{ from?: string }>();
	const from = safeFromParam(fromRaw);
	const backLabel = BACK_LABELS[from ?? ''] ?? 'Back';
	const [filter, setFilter] = useState<PriceTrackerFilter>('all');
	const { data, isLoading, isError, refetch, isRefetching } = useWatch();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const theme = getThemeColors(isDark);

	if (isLoading) {
		return (
			<ScreenContainer className="items-center justify-center">
				<ActivityIndicator size="large" color={theme.accent} />
				<Text className="mt-4 text-text-muted-light dark:text-text-muted-dark">Loading products…</Text>
			</ScreenContainer>
		);
	}

	if (isError) {
		return (
			<ScreenContainer className="items-center justify-center p-6">
				<Text className="mb-4 text-center font-display text-2xl text-text-primary-light dark:text-text-primary-dark">
					Couldn’t load products
				</Text>
				<Button label="Try again" onPress={() => refetch()} />
			</ScreenContainer>
		);
	}

	const allProducts = data?.tracked_products ?? [];

	const filteredProducts = allProducts.filter(product => {
		switch (filter) {
			case 'active':
				return product.is_active;
			case 'paused':
				return !product.is_active;
			case 'target_reached':
				return product.current_price <= product.target_price;
			case 'price_drops':
				return product.price_drop_percentage > 0;
			default:
				return true;
		}
	});

	return (
		<ScreenContainer>
			<TabPageHeader title="Watch" showBack backLabel={backLabel} />
			{/* Editorial header */}
			<View className="px-4 pb-4 pt-6">
				<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
					Watch · Price ledger
				</Text>
				<Text
					className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
					style={{ fontSize: 32, lineHeight: 34 }}
				>
					Track movement
				</Text>
				<Text
					className="font-display italic tracking-tightest text-accent dark:text-accent-light"
					style={{ fontSize: 32, lineHeight: 34 }}
				>
					before you buy.
				</Text>
				<View className="mt-5 h-px bg-border-light dark:bg-border-dark" />
			</View>

			{/* Filter chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="max-h-12"
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingVertical: 6,
					gap: 6,
				}}
			>
				{FILTERS.map(f => (
					<Pressable
						key={f.key}
						onPress={() => setFilter(f.key)}
						className={`rounded-md px-3.5 py-1.5 ${
							filter === f.key
								? 'bg-primary'
								: 'border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark'
						}`}
					>
						<Text
							className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
								filter === f.key ? 'text-surface-light' : 'text-text-muted-light dark:text-text-muted-dark'
							}`}
						>
							{f.label}
						</Text>
					</Pressable>
				))}
			</ScrollView>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
				refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />}
			>
				{filteredProducts.length === 0 ? (
					<View className="mt-6 rounded-md border border-primary-dark bg-primary p-8">
						<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-white/60">
							{allProducts.length === 0 ? 'Watchlist empty' : 'No matches'}
						</Text>
						<Text className="font-display tracking-tightest text-white" style={{ fontSize: 26, lineHeight: 28 }}>
							Pick a product.
						</Text>
						<Text
							className="mt-1 font-display italic tracking-tightest text-signal-light"
							style={{ fontSize: 26, lineHeight: 28 }}
						>
							Watch it breathe.
						</Text>
						<Text className="mb-5 mt-4 text-sm text-white/70">
							{allProducts.length === 0
								? 'Drop in a SKU or product link. We’ll log every price change and ping you when motion matters.'
								: 'Try selecting a different filter.'}
						</Text>
						{allProducts.length === 0 ? (
							<Link href="/watch/create?from=watch" asChild>
								<Pressable className="flex-row items-center gap-2 self-start rounded-md bg-surface-light px-5 py-3">
									<PlusIcon color={colors.primary.DEFAULT} width={14} height={14} />
									<Text className="text-sm font-medium text-primary">Track first product</Text>
								</Pressable>
							</Link>
						) : null}
					</View>
				) : (
					<View className="gap-3">
						{filteredProducts.map(product => (
							<ProductCard key={product.id} product={product} />
						))}
					</View>
				)}
			</ScrollView>

			<FloatingAddButton
				onPress={() => router.push('/watch/create?from=watch')}
				color={theme.primary}
				accessibilityLabel="Track new product"
			/>
		</ScreenContainer>
	);
}
