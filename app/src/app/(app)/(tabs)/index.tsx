import { Env } from '@env';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/api/auth/use-profile';
import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { useFinanceSheets } from '@/api/finance/use-finance-sheets';
import { useLeaseSheets } from '@/api/lease/use-lease-sheets';
import { useWatch } from '@/api/watch';
import { DashboardFocusTrio } from '@/components/dashboard/dashboard-focus-trio';
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions';
import { DashboardRecentActivity } from '@/components/dashboard/dashboard-recent-activity';
import { FocusAwareStatusBar, MastheadBar, ScreenContainer } from '@/components/ui';
import { TabAwareScrollView } from '@/components/ui/scroll-aware';
import { getThemeColors } from '@/components/ui/theme';
import { useDashboardAnimations } from '@/lib/hooks/use-dashboard-animations';

const TODAY_LABEL = new Date()
	.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
	.toUpperCase();

export default function Dashboard() {
	const { data: stats, refetch: refetchStats, isRefetching } = useDashboardStats();
	const { data: user } = useProfile();
	const { data: financeSheets } = useFinanceSheets();
	const { data: leaseSheets } = useLeaseSheets();
	const { data: watchData } = useWatch();
	const { colorScheme } = useColorScheme();
	const insets = useSafeAreaInsets();
	const theme = getThemeColors(colorScheme === 'dark');
	const anim = useDashboardAnimations();
	const totalActivity = (stats?.watchCount ?? 0) + (stats?.financeCount ?? 0) + (stats?.leaseCount ?? 0);

	return (
		<ScreenContainer>
			<FocusAwareStatusBar />
			<TabAwareScrollView
				style={{ flex: 1, paddingTop: insets.top + 12 }}
				refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchStats} tintColor={theme.accent} />}
			>
				<Animated.View entering={anim.masthead}>
					<MastheadBar left={TODAY_LABEL} right={`v ${Env.VERSION}`} />
				</Animated.View>

				<Animated.View entering={anim.greeting} className="my-8 px-4">
					<DashboardGreeting user={user} isFresh={totalActivity === 0} />
				</Animated.View>

				<Animated.View entering={anim.focus} className="mb-8 px-4">
					<DashboardFocusTrio stats={stats} theme={theme} />
				</Animated.View>

				<Animated.View entering={anim.actions} className="mb-8 px-4">
					<DashboardQuickActions theme={theme} />
				</Animated.View>

				<Animated.View entering={anim.recent} className="mb-4 px-4">
					<DashboardRecentActivity
						financeSheets={financeSheets}
						leaseSheets={leaseSheets}
						watchData={watchData ?? undefined}
						theme={theme}
					/>
				</Animated.View>
			</TabAwareScrollView>
		</ScreenContainer>
	);
}
