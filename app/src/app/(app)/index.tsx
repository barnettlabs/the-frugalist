import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';

import { useProfile } from '@/api/auth/use-profile';
import { useDashboardStats } from '@/api/dashboard/use-dashboard-stats';
import {
  FocusAwareStatusBar,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  ArrowRight,
  Calculator as CalculatorIcon,
  Car as CarIcon,
  Tag as TagIcon,
} from '@/components/ui/icons';

export default function Dashboard() {
  const { data: stats, isLoading, refetch, isRefetching } = useDashboardStats();
  const { data: user } = useProfile();

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary[400]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.first_name || 'Welcome'}</Text>
          </View>
          <Pressable style={styles.avatar}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.first_name?.[0]?.toUpperCase() || 'U'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Finance"
            value={stats?.financeCount ?? 0}
            subtitle="estimates"
            isLoading={isLoading}
            href="/(app)/finance"
            accentColor="#3B82F6"
            icon={<CalculatorIcon color="#3B82F6" />}
          />
          <StatCard
            title="Lease"
            value={stats?.leaseCount ?? 0}
            subtitle="estimates"
            isLoading={isLoading}
            href="/(app)/lease"
            accentColor="#10B981"
            icon={<CarIcon color="#10B981" />}
          />
          <StatCard
            title="Tracked"
            value={stats?.trackerCount ?? 0}
            subtitle="products"
            isLoading={isLoading}
            href="/(app)/tracker"
            accentColor="#14B8A6"
            icon={<TagIcon color="#14B8A6" />}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              href="/(app)/finance/create"
              title="Finance"
              subtitle="New estimate"
              icon={<CalculatorIcon color="#3B82F6" />}
              accentColor="#3B82F6"
            />
            <ActionCard
              href="/(app)/lease/create"
              title="Lease"
              subtitle="New estimate"
              icon={<CarIcon color="#10B981" />}
              accentColor="#10B981"
            />
            <ActionCard
              href="/(app)/tracker/create"
              title="Track"
              subtitle="New product"
              icon={<TagIcon color="#14B8A6" />}
              accentColor="#14B8A6"
            />
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.resourcesContainer}>
            <ResourceCard
              href="/(app)/learning/financing"
              title="Financing Guide"
              description="Learn key terms and strategies"
              tag="GUIDE"
            />
            <ResourceCard
              href="/(app)/learning/leasing"
              title="Leasing Explained"
              description="Understand your options"
              tag="LEARN"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  isLoading,
  href,
  accentColor,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  isLoading: boolean;
  href: string;
  accentColor: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.statCard}>
        <View style={styles.statCardContent}>
          <View style={[styles.statIconContainer, { backgroundColor: `${accentColor}20` }]}>
            {icon}
          </View>
          <Text style={styles.statTitle}>{title}</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={accentColor} style={{ marginTop: 8 }} />
          ) : (
            <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
          )}
          <Text style={styles.statSubtitle}>{subtitle}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function ActionCard({
  href,
  title,
  subtitle,
  icon,
  accentColor,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.actionCard}>
        <View style={[styles.actionIconContainer, { backgroundColor: `${accentColor}15` }]}>
          {icon}
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
        <View style={[styles.actionArrow, { backgroundColor: `${accentColor}20` }]}>
          <ArrowRight color={accentColor} />
        </View>
      </Pressable>
    </Link>
  );
}

function ResourceCard({
  href,
  title,
  description,
  tag,
}: {
  href: string;
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.resourceCard}>
        <View style={styles.resourceContent}>
          <View style={styles.resourceTag}>
            <Text style={styles.resourceTagText}>{tag}</Text>
          </View>
          <Text style={styles.resourceTitle}>{title}</Text>
          <Text style={styles.resourceDescription}>{description}</Text>
        </View>
        <ArrowRight color="#64748B" />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
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
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff10',
    backgroundColor: '#1E293B',
  },
  statCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourcesContainer: {
    gap: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTag: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  resourceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#64748B',
  },
});
