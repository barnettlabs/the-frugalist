import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { useProfile } from '@/api/auth/use-profile';
import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { FocusAwareStatusBar, Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Calculator as CalculatorIcon, Car as CarIcon, Chevron, Plus, Tag as TagIcon } from '@/components/ui/icons';

export default function Dashboard() {
  const { data: stats, isLoading, refetch, isRefetching } = useDashboardStats();
  const { data: user } = useProfile();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.first_name || 'User';

  const gradientColors = isDark
    ? [colors.charcoal[950], colors.charcoal[900], colors.charcoal[950]]
    : [colors.neutral[50], colors.neutral[100], colors.neutral[50]];

  const dotColor = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.15)';

  return (
    <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1" fill={dotColor} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
      </Svg>
      <FocusAwareStatusBar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary[400]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: theme.textMuted }]}>{greeting},</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <Link href="/(app)/profile" asChild>
            <Pressable style={[styles.avatar, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: theme.textSecondary }]}>
                  {firstName[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </Pressable>
          </Link>
        </View>

        {/* Overview Stats */}
        <View style={[styles.overviewCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <Text style={[styles.overviewTitle, { color: theme.textSecondary }]}>Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <Text style={[styles.overviewValue, { color: theme.textPrimary }]}>
                  {(stats?.financeCount ?? 0) + (stats?.leaseCount ?? 0)}
                </Text>
              )}
              <Text style={[styles.overviewLabel, { color: theme.textMuted }]}>Total Estimates</Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.overviewStat}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <Text style={[styles.overviewValue, { color: theme.textPrimary }]}>{stats?.trackerCount ?? 0}</Text>
              )}
              <Text style={[styles.overviewLabel, { color: theme.textMuted }]}>Tracked Items</Text>
            </View>
          </View>
        </View>

        {/* Finance Section */}
        <EntitySection
          title="Finance Estimates"
          icon={<CalculatorIcon color="#3B82F6" size={20} />}
          accentColor="#3B82F6"
          count={stats?.financeCount ?? 0}
          isLoading={isLoading}
          theme={theme}
          onViewAll={() => router.push('/(app)/finance')}
          onCreateNew={() => router.push('/(app)/finance/create')}
        />

        {/* Lease Section */}
        <EntitySection
          title="Lease Estimates"
          icon={<CarIcon color="#10B981" size={20} />}
          accentColor="#10B981"
          count={stats?.leaseCount ?? 0}
          isLoading={isLoading}
          theme={theme}
          onViewAll={() => router.push('/(app)/lease')}
          onCreateNew={() => router.push('/(app)/lease/create')}
        />

        {/* Tracker Section */}
        <EntitySection
          title="Product Tracker"
          icon={<TagIcon color="#8B5CF6" size={20} />}
          accentColor="#8B5CF6"
          count={stats?.trackerCount ?? 0}
          isLoading={isLoading}
          theme={theme}
          onViewAll={() => router.push('/(app)/tracker')}
          onCreateNew={() => router.push('/(app)/tracker/create')}
        />

        {/* Learning Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Learn</Text>
          <View style={styles.resourcesRow}>
            <Link href="/(app)/learning/financing" asChild>
              <Pressable
                style={[styles.resourceCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
              >
                <View style={[styles.resourceIcon, { backgroundColor: '#3B82F615' }]}>
                  <CalculatorIcon color="#3B82F6" size={18} />
                </View>
                <Text style={[styles.resourceTitle, { color: theme.textPrimary }]}>Financing</Text>
                <Text style={[styles.resourceSubtitle, { color: theme.textMuted }]}>Guide</Text>
              </Pressable>
            </Link>
            <Link href="/(app)/learning/leasing" asChild>
              <Pressable
                style={[styles.resourceCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
              >
                <View style={[styles.resourceIcon, { backgroundColor: '#10B98115' }]}>
                  <CarIcon color="#10B981" size={18} />
                </View>
                <Text style={[styles.resourceTitle, { color: theme.textPrimary }]}>Leasing</Text>
                <Text style={[styles.resourceSubtitle, { color: theme.textMuted }]}>Guide</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Blurred status bar area */}
      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.statusBarBlur, { height: insets.top }]}
      />
    </LinearGradient>
  );
}

type Theme = {
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
};

const darkTheme: Theme = {
  cardBg: colors.charcoal[800],
  cardBorder: colors.charcoal[700],
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
};

const lightTheme: Theme = {
  cardBg: '#FFFFFF',
  cardBorder: colors.neutral[200],
  textPrimary: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textMuted: colors.neutral[500],
};

function EntitySection({
  title,
  icon,
  accentColor,
  count,
  isLoading,
  theme,
  onViewAll,
  onCreateNew,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  count: number;
  isLoading: boolean;
  theme: Theme;
  onViewAll: () => void;
  onCreateNew: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIcon, { backgroundColor: `${accentColor}15` }]}>{icon}</View>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
        </View>
        <Pressable onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={[styles.viewAllText, { color: accentColor }]}>View All</Text>
          <Chevron direction="right" color={accentColor} size={16} />
        </Pressable>
      </View>

      <View style={[styles.entityCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.entityContent}>
          <View style={styles.entityMetric}>
            {isLoading ? (
              <ActivityIndicator size="small" color={accentColor} />
            ) : (
              <Text style={[styles.entityCount, { color: accentColor }]}>{count}</Text>
            )}
            <Text style={[styles.entityLabel, { color: theme.textMuted }]}>{count === 1 ? 'item' : 'items'}</Text>
          </View>

          <View style={styles.entityActions}>
            <Pressable onPress={onViewAll} style={[styles.entityButton, { backgroundColor: theme.cardBorder }]}>
              <Chevron direction="right" color={theme.textSecondary} size={18} />
              <Text style={[styles.entityButtonText, { color: theme.textSecondary }]}>View</Text>
            </Pressable>
            <Pressable
              onPress={onCreateNew}
              style={[styles.entityButton, styles.entityButtonPrimary, { backgroundColor: accentColor }]}
            >
              <Plus color="#FFFFFF" size={18} />
              <Text style={[styles.entityButtonText, { color: '#FFFFFF' }]}>New</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
    marginBottom: 2,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
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
  overviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  overviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 13,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 2,
  },
  entityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  entityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entityMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entityCount: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
    lineHeight: 40,
  },
  entityLabel: {
    fontSize: 14,
  },
  entityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  entityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  entityButtonPrimary: {},
  entityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resourcesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resourceCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  resourceSubtitle: {
    fontSize: 13,
  },
  statusBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
