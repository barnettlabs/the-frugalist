import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { Calculator as CalculatorIcon, Car as CarIcon, Plus as PlusIcon } from '@/components/ui/icons';
import type { getThemeColors } from '@/components/ui/theme';

import { ActionRow } from './action-row';

type DashboardQuickActionsProps = {
	theme: ReturnType<typeof getThemeColors>;
};

export const DashboardQuickActions = React.memo(function DashboardQuickActions({ theme }: DashboardQuickActionsProps) {
	const router = useRouter();
	return (
		<>
			<View className="mb-3 flex-row items-center gap-3">
				<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
					Begin something
				</Text>
				<View className="h-px flex-1 bg-border-light dark:bg-border-dark" />
			</View>
			<View className="gap-2.5">
				<ActionRow
					label="Track a price"
					hint="Add a product, set a target"
					icon={<PlusIcon color="#FCFAF5" width={16} height={16} />}
					onPress={() => router.push('/watch/create?from=home')}
					theme={theme}
				/>
				<ActionRow
					label="Run financing"
					hint="APR, amortization, total cost"
					icon={<CalculatorIcon color="#FCFAF5" size={16} />}
					onPress={() => router.push('/compute/finance/create?from=home')}
					theme={theme}
				/>
				<ActionRow
					label="Run a lease"
					hint="Money factor, residual, true cost"
					icon={<CarIcon color="#FCFAF5" size={16} />}
					onPress={() => router.push('/compute/lease/create?from=home')}
					theme={theme}
				/>
			</View>
		</>
	);
});
