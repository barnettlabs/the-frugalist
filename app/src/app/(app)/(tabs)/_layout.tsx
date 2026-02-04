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
      tabBarActiveTintColor={isDark ? '#5A7DAB' : '#235892'}
      tabBarInactiveTintColor={isDark ? '#64748B' : '#94A3B8'}
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
        name="compute"
        options={{
          title: 'Compute',
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'plusminus.circle.fill' : 'plusminus.circle',
          }),
        }}
      />

      <NativeTabs.Screen
        name="watch"
        options={{
          title: 'Watch',
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'binoculars.fill' : 'binoculars',
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

      {/* Hide style screen from tab bar */}
      <NativeTabs.Screen
        name="style"
        options={{
          tabBarItemHidden: true,
        }}
      />
    </NativeTabs>
  );
}
