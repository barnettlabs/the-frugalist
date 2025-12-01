import { Redirect, SplashScreen, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect } from 'react';

import colors from '@/components/ui/colors';
import {
  Calculator as CalculatorIcon,
  Car as CarIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Tag as TagIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime } from '@/lib';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/(auth)/login" />;
  }

  // Theme-aware colors
  const tabBarColors = isDark ? colors.tabBar.dark : colors.tabBar.light;
  const headerColors = isDark ? colors.header.dark : colors.header.light;

  return (
    <Tabs
      screenOptions={{
          tabBarActiveTintColor: tabBarColors.active,
          tabBarInactiveTintColor: tabBarColors.inactive,
          headerShown: true,
          // Neutral header - no color, just clean
          headerStyle: {
            backgroundColor: headerColors.background,
            borderBottomWidth: 1,
            borderBottomColor: headerColors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: headerColors.text,
          headerTitleStyle: {
            fontFamily: 'Rubik-SemiBold',
            fontSize: 17,
          },
          // Tab bar styling - theme aware
          tabBarStyle: {
            backgroundColor: tabBarColors.background,
            borderTopColor: tabBarColors.border,
            borderTopWidth: 1,
            paddingTop: 6,
            paddingBottom: 6,
            // height: 60,
          },
          tabBarLabelStyle: {
            fontFamily: 'Rubik-Medium',
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
            tabBarButtonTestID: 'dashboard-tab',
          }}
        />

        <Tabs.Screen
          name="finance"
          options={{
            title: 'Finance',
            headerShown: false,
            tabBarIcon: ({ color }) => <CalculatorIcon color={color} />,
            tabBarButtonTestID: 'finance-tab',
          }}
        />

        <Tabs.Screen
          name="lease"
          options={{
            title: 'Lease',
            headerShown: false,
            tabBarIcon: ({ color }) => <CarIcon color={color} />,
            tabBarButtonTestID: 'lease-tab',
          }}
        />

        <Tabs.Screen
          name="tracker"
          options={{
            title: 'Tracker',
            headerShown: false,
            tabBarIcon: ({ color }) => <TagIcon color={color} />,
            tabBarButtonTestID: 'tracker-tab',
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: true,
            tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
            tabBarButtonTestID: 'settings-tab',
            headerStyle: {
              backgroundColor: headerColors.background,
            },
            headerTintColor: headerColors.text,
            headerTitleStyle: {
              fontFamily: 'Rubik-SemiBold',
            },
            headerShadowVisible: false,
          }}
        />

        {/* Hidden screens that are accessible but not in tabs */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            headerShown: true,
            title: 'Profile',
            headerStyle: {
              backgroundColor: headerColors.background,
              borderBottomWidth: 1,
              borderBottomColor: headerColors.border,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: headerColors.text,
            headerTitleStyle: {
              fontFamily: 'Rubik-SemiBold',
              fontSize: 17,
            },
          }}
        />

        <Tabs.Screen
          name="learning"
          options={{
            href: null,
            headerShown: false,
          }}
        />

        {/* Hide the old style screen */}
        <Tabs.Screen
          name="style"
          options={{
            href: null,
          }}
        />
    </Tabs>
  );
}
