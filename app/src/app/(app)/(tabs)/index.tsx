import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Platform, RefreshControl, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

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
  const { data: stats, refetch: refetchStats, isRefetching } = useDashboardStats();
  const { data: user } = useProfile();
  const { data: financeSheets } = useFinanceSheets();
  const { data: leaseSheets } = useLeaseSheets();
  const { data: watchData } = useWatch();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const theme = getThemeColors(isDark);
  const dotColor = isDark ? 'rgba(90, 125, 171, 0.18)' : 'rgba(35, 88, 146, 0.12)';

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.first_name || 'User';
  const backgroundColor = isDark ? colors.charcoal[950] : colors.neutral[50];

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
      });
    });

    items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return items.slice(0, 5);
  }, [financeSheets, leaseSheets, watchData]);

  const priceAlerts = React.useMemo(() => {
    return (watchData?.tracked_products ?? [])
      .filter((p: PriceTrackerItem['tracked_product']) => p.price_drop_percentage > 0 || p.current_price <= p.target_price)
      .slice(0, 3);
  }, [watchData]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FocusAwareStatusBar />

      {/* Dotted background pattern */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dashDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <Circle cx="2" cy="2" r="1" fill={dotColor} />
            </Pattern>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#dashDots)" />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetchStats} tintColor={colors.accent.DEFAULT} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.systemLabel, { color: colors.accent.DEFAULT }]}>DASHBOARD</Text>
            <Text style={[styles.greeting, { color: theme.textMuted }]}>{greeting},</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <Link href="/(app)/profile">
            <Animated.View entering={FadeInDown.duration(600).delay(200).springify()}>
              <View
                style={[
                  styles.avatarGlow,
                  {
                    backgroundColor: isDark ? `${colors.accent.DEFAULT}20` : `${colors.accent.DEFAULT}10`,
                  },
                ]}
              >
                <View
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
                </View>
              </View>
            </Animated.View>
          </Link>
        </Animated.View>

        {/* Stats HUD */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.statsRow}>
          <StatCard
            label="Watching"
            value={stats?.watchCount ?? 0}
            icon={<EyeIcon color={colors.accent.DEFAULT} size={16} />}
            accentColor={colors.accent.DEFAULT}
            isDark={isDark}
            theme={theme}
            onPress={() => router.push('/watch?from=home')}
          />
          <StatCard
            label="Finance"
            value={stats?.financeCount ?? 0}
            icon={<CalculatorIcon color={colors.info.DEFAULT} size={16} />}
            accentColor={colors.info.DEFAULT}
            isDark={isDark}
            theme={theme}
            onPress={() => router.push('/compute/finance?from=home')}
          />
          <StatCard
            label="Lease"
            value={stats?.leaseCount ?? 0}
            icon={<CarIcon color={colors.success.DEFAULT} size={16} />}
            accentColor={colors.success.DEFAULT}
            isDark={isDark}
            theme={theme}
            onPress={() => router.push('/compute/lease?from=home')}
          />
        </Animated.View>

        {/* Price Alerts */}
        {priceAlerts.length > 0 && (
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
            <SectionHeader title="PRICE ALERTS" color={colors.success.DEFAULT} textColor={theme.textPrimary} />
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              {priceAlerts.map((product: PriceTrackerItem['tracked_product'], index: number) => (
                <Pressable
                  key={product.id}
                  style={[
                    styles.alertItem,
                    index < priceAlerts.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.cardBorder },
                  ]}
                  onPress={() => router.push(`/watch/${product.id}?from=home` as any)}
                >
                  <View style={[styles.typeIndicator, { backgroundColor: colors.success.DEFAULT }]} />
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
          <SectionHeader title="RECENT ACTIVITY" color={colors.accent.DEFAULT} textColor={theme.textPrimary} />
          {recentItems.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyLabel, { color: colors.accent.DEFAULT }]}>NO DATA</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Create your first estimate or start tracking a product.
              </Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: colors.accent.DEFAULT }]}
                onPress={() => router.push('/(app)/(tabs)/tools')}
              >
                <Text style={styles.emptyButtonText}>GET STARTED</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              {recentItems.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.activityItem,
                    index < recentItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.cardBorder },
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]} />
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

      {/* Blurred status bar */}
      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.statusBarBlur, { height: insets.top }]}
      />
    </View>
  );
}

// --- Sub-components ---

function StatCard({
  label,
  value,
  icon,
  accentColor,
  isDark,
  theme,
  onPress,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  isDark: boolean;
  theme: ReturnType<typeof getThemeColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.statCard,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          ...(Platform.OS === 'ios' && {
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.15 : 0.08,
            shadowRadius: 8,
          }),
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.statIconBg, { backgroundColor: `${accentColor}15` }]}>{icon}</View>
      <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      {/* Accent bottom stripe */}
      <View style={[styles.statAccent, { backgroundColor: accentColor }]} />
    </Pressable>
  );
}

function SectionHeader({ title, color, textColor }: { title: string; color: string; textColor: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: color }]} />
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
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

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getTypeIcon(type: RecentItem['type']) {
  switch (type) {
    case 'finance':
      return <CalculatorIcon color={colors.info.DEFAULT} size={16} />;
    case 'lease':
      return <CarIcon color={colors.success.DEFAULT} size={16} />;
    case 'watch':
      return <EyeIcon color={colors.accent.DEFAULT} size={16} />;
  }
}

function getTypeColor(type: RecentItem['type']) {
  switch (type) {
    case 'finance':
      return colors.info.DEFAULT;
    case 'lease':
      return colors.success.DEFAULT;
    case 'watch':
      return colors.accent.DEFAULT;
  }
}

// --- Styles ---

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

  // Header
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
  systemLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: 'Rubik-Bold',
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Rubik-Bold',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  avatarGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 18,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 0,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statAccent: {
    height: 3,
    width: '100%',
    marginTop: 12,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rubik-Bold',
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Rubik-Bold',
    letterSpacing: 1.5,
  },

  // Cards
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Alert items
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 14,
  },
  typeIndicator: {
    width: 3,
    height: '60%',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginRight: 12,
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

  // Activity items
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 14,
  },
  activityIconBg: {
    width: 34,
    height: 34,
    borderRadius: 8,
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
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  // Empty state
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  emptyLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Status bar
  statusBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
