import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import type { getThemeColors } from '@/components/ui/theme';

import { FocusTile } from './focus-tile';

type DashboardStats = {
	watchCount: number;
	financeCount: number;
	leaseCount: number;
};

type DashboardFocusTrioProps = {
	stats?: DashboardStats;
	theme: ReturnType<typeof getThemeColors>;
};

export const DashboardFocusTrio = React.memo(function DashboardFocusTrio({ stats, theme }: DashboardFocusTrioProps) {
	const router = useRouter();
	return (
		<View
			className="flex-row rounded-md overflow-hidden border border-border-light dark:border-border-dark"
			style={{ backgroundColor: theme.cardBorder }}
		>
			<FocusTile
				label="Watch"
				value={stats?.watchCount ?? 0}
				onPress={() => router.push('/watch?from=home')}
				theme={theme}
			/>
			<View style={{ width: 1, backgroundColor: theme.cardBorder }} />
			<FocusTile
				label="Finance"
				value={stats?.financeCount ?? 0}
				onPress={() => router.push('/compute/finance?from=home')}
				theme={theme}
			/>
			<View style={{ width: 1, backgroundColor: theme.cardBorder }} />
			<FocusTile
				label="Lease"
				value={stats?.leaseCount ?? 0}
				onPress={() => router.push('/compute/lease?from=home')}
				theme={theme}
			/>
		</View>
	);
});
