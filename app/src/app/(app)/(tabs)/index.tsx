import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { Dimensions, RefreshControl, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { useProfile } from '@/api/auth/use-profile';
import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import { FocusAwareStatusBar, Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  Calculator as CalculatorIcon,
  Car as CarIcon,
  Chevron,
  Plus,
  Tag as TagIcon,
} from '@/components/ui/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const dotColor = isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(148, 163, 184, 0.1)';

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
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
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary[400]}
          />
        }
      >
        {/* Header with entrance animation */}
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
                  borderColor: colors.primary[500],
                  shadowColor: colors.primary[500],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                },
              ]}
            >
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.primary[500] }]}>
                  {firstName[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </Animated.View>
          </Link>
        </Animated.View>

        {/* Finance Section */}
        <GlassEntitySection
          title="Finance Estimates"
          icon={<CalculatorIcon color="#3B82F6" size={20} />}
          accentColor="#3B82F6"
          count={stats?.financeCount ?? 0}
          isLoading={isLoading}
          theme={theme}
          isDark={isDark}
          delay={300}
          onViewAll={() => router.push('/(app)/finance')}
          onCreateNew={() => router.push('/(app)/finance/create')}
        />

        {/* Lease Section */}
        <GlassEntitySection
          title="Lease Estimates"
          icon={<CarIcon color="#10B981" size={20} />}
          accentColor="#10B981"
          count={stats?.leaseCount ?? 0}
          isLoading={isLoading}
          theme={theme}
          isDark={isDark}
          delay={400}
          onViewAll={() => router.push('/(app)/lease')}
          onCreateNew={() => router.push('/(app)/lease/create')}
        />

        {/* Tracker Section */}
        <GlassEntitySection
          title="Product Tracker"
          icon={<TagIcon color="#8B5CF6" size={20} />}
          accentColor="#8B5CF6"
          count={stats?.trackerCount ?? 0}
          isLoading={isLoading}
          theme={theme}
          isDark={isDark}
          delay={500}
          onViewAll={() => router.push('/(app)/tracker')}
          onCreateNew={() => router.push('/(app)/tracker/create')}
        />

        {/* Learning Resources */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Learn</Text>
          <View style={styles.resourcesRow}>
            <Link href="/(app)/learning/financing" asChild>
              <Pressable>
                <GlassCard isDark={isDark} style={styles.resourceCard}>
                  <View style={[styles.resourceIcon, { backgroundColor: '#3B82F620' }]}>
                    <CalculatorIcon color="#3B82F6" size={18} />
                  </View>
                  <Text style={[styles.resourceTitle, { color: theme.textPrimary }]}>
                    Financing
                  </Text>
                  <Text style={[styles.resourceSubtitle, { color: theme.textMuted }]}>Terms</Text>
                </GlassCard>
              </Pressable>
            </Link>
            <Link href="/(app)/learning/leasing" asChild>
              <Pressable>
                <GlassCard isDark={isDark} style={styles.resourceCard}>
                  <View style={[styles.resourceIcon, { backgroundColor: '#10B98120' }]}>
                    <CarIcon color="#10B981" size={18} />
                  </View>
                  <Text style={[styles.resourceTitle, { color: theme.textPrimary }]}>Leasing</Text>
                  <Text style={[styles.resourceSubtitle, { color: theme.textMuted }]}>Terms</Text>
                </GlassCard>
              </Pressable>
            </Link>
          </View>
        </Animated.View>

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

// Animated Counter Component
function AnimatedCounter({
  value,
  color,
  isLoading,
}: {
  value: number;
  color: string;
  isLoading: boolean;
}) {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    if (!isLoading) {
      animatedValue.value = 0;
      animatedValue.value = withSpring(value, {
        damping: 20,
        stiffness: 90,
        mass: 1,
      });
    }
  }, [value, isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = Math.round(animatedValue.value);
      setDisplayValue(current);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.counterLoading}>
        <View style={[styles.counterSkeleton, { backgroundColor: `${color}30` }]} />
      </View>
    );
  }

  return (
    <Text style={[styles.entityCount, { color }]}>
      {displayValue}
    </Text>
  );
}

// Card Component
function GlassCard({
  children,
  isDark,
  style,
}: {
  children: React.ReactNode;
  isDark: boolean;
  style?: any;
}) {
  const backgroundColor = isDark ? colors.charcoal[800] : '#FFFFFF';
  const borderColor = isDark ? colors.charcoal[700] : colors.neutral[200];

  return (
    <View
      style={[
        {
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
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

function GlassEntitySection({
  title,
  icon,
  accentColor,
  count,
  isLoading,
  theme,
  isDark,
  delay,
  onViewAll,
  onCreateNew,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  count: number;
  isLoading: boolean;
  theme: Theme;
  isDark: boolean;
  delay: number;
  onViewAll: () => void;
  onCreateNew: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(600).delay(delay).springify()} style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View
            style={[
              styles.sectionIcon,
              {
                backgroundColor: `${accentColor}20`,
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              },
            ]}
          >
            {icon}
          </View>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
        </View>
        <Pressable onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={[styles.viewAllText, { color: accentColor }]}>View All</Text>
          <Chevron direction="right" color={accentColor} size={16} />
        </Pressable>
      </View>

      <GlassCard isDark={isDark} style={styles.entityCardContainer}>
        <View style={styles.entityCard}>
          <View style={styles.entityContent}>
            <View style={styles.entityMetric}>
              <AnimatedCounter value={count} color={accentColor} isLoading={isLoading} />
              <Text style={[styles.entityLabel, { color: theme.textMuted }]}>
                {count === 1 ? 'item' : 'items'}
              </Text>
            </View>

            <Pressable
              onPress={onCreateNew}
              style={[
                styles.entityButton,
                {
                  backgroundColor: accentColor,
                  shadowColor: accentColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                },
              ]}
            >
              <Plus color="#FFFFFF" size={18} />
              <Text style={[styles.entityButtonText, { color: '#FFFFFF' }]}>New</Text>
            </Pressable>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
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
    marginBottom: 28,
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
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
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
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
  entityCardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  entityCard: {
    padding: 18,
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
    fontSize: 36,
    fontWeight: '700',
    marginRight: 10,
    lineHeight: 44,
  },
  entityLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  entityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
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
    padding: 18,
    alignItems: 'center',
    minWidth: (SCREEN_WIDTH - 44) / 2,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontWeight: '500',
  },
  statusBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  counterLoading: {
    height: 44,
    justifyContent: 'center',
  },
  counterSkeleton: {
    width: 48,
    height: 36,
    borderRadius: 8,
  },
});
