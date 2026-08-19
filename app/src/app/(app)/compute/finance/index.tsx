import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { useFinanceSheets } from '@/api/finance/use-finance-sheets';
import { FinanceCard } from '@/components/finance/finance-card';
import {
	Button,
	colors,
	FloatingAddButton,
	Pressable,
	ScreenContainer,
	ScrollView,
	TabPageHeader,
	Text,
} from '@/components/ui';
import { Book, Plus as PlusIcon } from '@/components/ui/icons';
import { getThemeColors } from '@/components/ui/theme';
import { safeFromParam } from '@/lib/types/navigation';

const BACK_LABELS: Record<string, string> = { home: 'Home', tools: 'Toolkit' };

export default function FinanceListScreen() {
	const router = useRouter();
	const { from: fromRaw } = useLocalSearchParams<{ from?: string }>();
	const from = safeFromParam(fromRaw);
	const backLabel = BACK_LABELS[from ?? ''] ?? 'Back';
	const { data, isLoading, isError, refetch, isRefetching } = useFinanceSheets();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const theme = getThemeColors(isDark);

	if (isLoading) {
		return (
			<ScreenContainer className="items-center justify-center">
				<ActivityIndicator size="large" color={theme.accent} />
				<Text className="mt-4 text-text-muted-light dark:text-text-muted-dark">Loading estimates…</Text>
			</ScreenContainer>
		);
	}

	if (isError) {
		return (
			<ScreenContainer className="items-center justify-center p-6">
				<Text className="mb-4 text-center font-display text-2xl text-text-primary-light dark:text-text-primary-dark">
					Couldn’t load estimates
				</Text>
				<Button label="Try again" onPress={() => refetch()} />
			</ScreenContainer>
		);
	}

	const sheets = data ?? [];

	return (
		<ScreenContainer>
			<TabPageHeader title="Finance" showBack backLabel={backLabel} />
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 120 }}
				refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />}
			>
				{/* Editorial header */}
				<View className="px-4 pb-5 pt-6">
					<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Compute · Financing
					</Text>
					<Text
						className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
						style={{ fontSize: 32, lineHeight: 34 }}
					>
						Run the loan,
					</Text>
					<Text
						className="font-display italic tracking-tightest text-accent dark:text-accent-light"
						style={{ fontSize: 32, lineHeight: 34 }}
					>
						line by line.
					</Text>
					<View className="mt-5 h-px bg-border-light dark:bg-border-dark" />
				</View>

				<View className="gap-3 px-4">
					{/* Quick links */}
					<View className="flex-row gap-2">
						<Link href="/compute/finance/learn?from=finance" asChild>
							<Pressable className="flex-1 flex-row items-center rounded-md border border-border-light bg-surface-light px-3 py-2.5 active:opacity-80 dark:border-border-dark dark:bg-surface-dark">
								<Book color={theme.textMuted} size={14} />
								<Text className="ml-2 text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
									Read the financing guide
								</Text>
							</Pressable>
						</Link>
						{sheets.length >= 2 ? (
							<Link href="/compute/finance/compare?from=finance" asChild>
								<Pressable className="flex-row items-center rounded-md bg-signal px-3 py-2.5 active:opacity-80">
									<Text className="text-xs font-semibold uppercase tracking-wider text-white">
										Compare ({sheets.length})
									</Text>
								</Pressable>
							</Link>
						) : null}
					</View>

					{sheets.length === 0 ? (
						<View className="mt-3 overflow-hidden rounded-md border border-primary-dark bg-primary p-6">
							<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-white/60">
								No estimates yet
							</Text>
							<Text className="font-display tracking-tightest text-white" style={{ fontSize: 26, lineHeight: 28 }}>
								Open a sheet.
							</Text>
							<Text
								className="mt-1 font-display italic tracking-tightest text-signal-light"
								style={{ fontSize: 26, lineHeight: 28 }}
							>
								Run any offer through it.
							</Text>
							<Text className="mb-5 mt-4 text-sm text-white/70">
								Enter MSRP, term, rate, and fees. We’ll do the math the dealer hopes you won’t.
							</Text>
							<Pressable
								onPress={() => router.push('/compute/finance/create?from=finance')}
								className="flex-row items-center gap-2 self-start rounded-md bg-surface-light px-5 py-3"
							>
								<PlusIcon color={colors.primary.DEFAULT} width={14} height={14} />
								<Text className="text-sm font-medium text-primary">Create first estimate</Text>
							</Pressable>
						</View>
					) : (
						<View className="gap-3">
							{sheets.map(sheet => (
								<FinanceCard key={sheet.id} sheet={sheet} />
							))}
						</View>
					)}
				</View>
			</ScrollView>

			<FloatingAddButton
				onPress={() => router.push('/compute/finance/create?from=finance')}
				color={theme.primary}
				accessibilityLabel="Create new finance estimate"
			/>
		</ScreenContainer>
	);
}
