import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/api/auth/use-profile';
import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { useFinanceSheets } from '@/api/finance/use-finance-sheets';
import { useLeaseSheets } from '@/api/lease/use-lease-sheets';
import { useWatch } from '@/api/watch';
import { FocusAwareStatusBar, Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  Calculator as CalculatorIcon,
  Car as CarIcon,
  Chevron,
  Eye as EyeIcon,
} from '@/components/ui/icons';
import { getThemeColors } from '@/components/ui/theme';
import type { PriceTrackerItem, VehicleFinanceSheet, VehicleLeaseSheet } from '@/lib/types/models';

type RecentItem = {
  id: string;
  type: 'finance' | 'lease' | 'watch';
  title: string;
  subtitle: string;
  updatedAt: Date;
  route: string;
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats, isRefetching } = useDashboardStats();
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.first_name || 'User';
  const backgroundColor = isDark ? colors.charcoal[950] : colors.neutral[50];

  // Build recent activity list
  const recentItems = React.useMemo(() => {
    const items: RecentItem[] = [];

    // Add finance sheets
    (financeSheets ?? []).forEach((sheet: VehicleFinanceSheet) => {
      items.push({
        id: `finance-${sheet.id}`,
        type: 'finance',
        title: sheet.sheet_name || 'Finance Estimate',
        subtitle: [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model].filter(Boolean).join(' ') || 'Vehicle',
        updatedAt: new Date(sheet.updated_at),
        route: `/compute/finance/${sheet.id}`,
      });
    });

    // Add lease sheets
    (leaseSheets ?? []).forEach((sheet: VehicleLeaseSheet) => {
      items.push({
        id: `lease-${sheet.id}`,
        type: 'lease',
        title: sheet.sheet_name || 'Lease Estimate',
        subtitle: [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model].filter(Boolean).join(' ') || 'Vehicle',
        updatedAt: new Date(sheet.updated_at),
        route: `/compute/lease/${sheet.id}`,
      });
    });

    // Add watch items
    (watchData?.tracked_products ?? []).forEach((product: PriceTrackerItem['tracked_product']) => {
      items.push({
        id: `watch-${product.id}`,
        type: 'watch',
        title: product.product_name || 'Tracked Product',
        subtitle: product.retailer?.name || 'Unknown Retailer',
        updatedAt: new Date(product.last_checked_at || product.tracking_start_date),
        route: `/watch/${product.id}`,
      });
    });

    // Sort by updated date, most recent first
    items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Return top 5
    return items.slice(0, 5);
  }, [financeSheets, leaseSheets, watchData]);

  // Price alerts - products with price drops
  const priceAlerts = React.useMemo(() => {
    return (watchData?.tracked_products ?? [])
      .filter((p: PriceTrackerItem['tracked_product']) => p.price_drop_percentage > 0 || p.current_price <= p.target_price)
      .slice(0, 3);
  }, [watchData]);

  const handleRefresh = () => {
    refetchStats();
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: RecentItem['type']) => {
    switch (type) {
      case 'finance':
        return <CalculatorIcon color={colors.info.DEFAULT} size={18} />;
      case 'lease':
        return <CarIcon color={colors.success.DEFAULT} size={18} />;
      case 'watch':
        return <EyeIcon color={colors.accent.DEFAULT} size={18} />;
    }
  };

  const getTypeColor = (type: RecentItem['type']) => {
    switch (type) {
      case 'finance':
        return colors.info.DEFAULT;
      case 'lease':
        return colors.success.DEFAULT;
      case 'watch':
        return colors.accent.DEFAULT;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FocusAwareStatusBar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.accent.DEFAULT} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: theme.textMuted }]}>{greeting},</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <Link href="/(app)/profile">
            <Animated.View
              entering={FadeInDown.duration(600).delay(200).springify()}
              style={[
                styles.avatar,
                {
                  borderColor: colors.accent.DEFAULT,
                  backgroundColor: isDark ? colors.charcoal[800] : colors.neutral[100],
                },
              ]}
            >
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.accent.DEFAULT }]}>
                  {firstName[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </Animated.View>
          </Link>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.statsRow}>
          <Pressable
            style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/watch')}
          >
            <View style={[styles.statIconBg, { backgroundColor: `${colors.accent.DEFAULT}15` }]}>
              <EyeIcon color={colors.accent.DEFAULT} size={16} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.watchCount ?? 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Watching</Text>
          </Pressable>

          <Pressable
            style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/compute/finance')}
          >
            <View style={[styles.statIconBg, { backgroundColor: `${colors.info.DEFAULT}15` }]}>
              <CalculatorIcon color={colors.info.DEFAULT} size={16} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.financeCount ?? 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Finance</Text>
          </Pressable>

          <Pressable
            style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/compute/lease')}
          >
            <View style={[styles.statIconBg, { backgroundColor: `${colors.success.DEFAULT}15` }]}>
              <CarIcon color={colors.success.DEFAULT} size={16} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.leaseCount ?? 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Lease</Text>
          </Pressable>
        </Animated.View>

        {/* Price Alerts */}
        {priceAlerts.length > 0 && (
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Price Alerts</Text>
            </View>
            <View style={[styles.alertsCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              {priceAlerts.map((product: PriceTrackerItem['tracked_product'], index: number) => (
                <Pressable
                  key={product.id}
                  style={[
                    styles.alertItem,
                    index < priceAlerts.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.cardBorder },
                  ]}
                  onPress={() => router.push(`/watch/${product.id}` as any)}
                >
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {product.product_name}
                    </Text>
                    <Text style={[styles.alertSubtitle, { color: colors.success.DEFAULT }]}>
                      {product.current_price <= product.target_price
                        ? 'Target reached!'
                        : `${product.price_drop_percentage.toFixed(0)}% off`}
                    </Text>
                  </View>
                  <Chevron direction="right" color={theme.textMuted} size={16} />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Activity</Text>
          </View>
          {recentItems.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No recent activity yet. Create your first estimate or start tracking a product!
              </Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: colors.accent.DEFAULT }]}
                onPress={() => router.push('/(app)/(tabs)/tools')}
              >
                <Text style={styles.emptyButtonText}>Get Started</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.activityCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              {recentItems.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.activityItem,
                    index < recentItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.cardBorder },
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={[styles.activityIconBg, { backgroundColor: `${getTypeColor(item.type)}15` }]}>
                    {getTypeIcon(item.type)}
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.activitySubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: theme.textMuted }]}>
                    {formatRelativeTime(item.updatedAt)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Blurred status bar area */}
      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.statusBarBlur, { height: insets.top }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rubik-Bold',
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Rubik-SemiBold',
  },
  alertsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
  },
  activityTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
