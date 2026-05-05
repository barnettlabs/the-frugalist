import { Redirect, SplashScreen } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect } from 'react';

import { NativeTabs } from '@/components/ui/native-tabs';
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

  return (
    <NativeTabs
      tabBarActiveTintColor={isDark ? '#F0EADE' : '#171B27'}
      tabBarInactiveTintColor={isDark ? '#9F9889' : '#857C6B'}
      hapticFeedbackEnabled
      translucent
    >
      <NativeTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'house.fill' : 'house',
          }),
        }}
      />

      <NativeTabs.Screen
        name="tools"
        options={{
          title: 'Toolkit',
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'wrench.and.screwdriver.fill' : 'wrench.and.screwdriver',
          }),
        }}
      />

      <NativeTabs.Screen
        name="settings"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'person.crop.circle.fill' : 'person.crop.circle',
          }),
        }}
      />

      {/* Hidden screens */}
      <NativeTabs.Screen
        name="style"
        options={{
          tabBarItemHidden: true,
        }}
      />
    </NativeTabs>
  );
}
