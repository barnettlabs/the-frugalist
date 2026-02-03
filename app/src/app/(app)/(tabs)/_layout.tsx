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
          tabBarIcon: () => ({ sfSymbol: 'house.fill' }),
        }}
      />

      <NativeTabs.Screen
        name="tracker"
        options={{
          title: 'Watch',
          tabBarIcon: () => ({ sfSymbol: 'eye.fill' }),
        }}
      />

      <NativeTabs.Screen
        name="finance"
        options={{
          title: 'Compute',
          tabBarIcon: () => ({ sfSymbol: 'plusminus.circle.fill' }),
        }}
      />

      <NativeTabs.Screen
        name="settings"
        options={{
          title: 'Account',
          tabBarIcon: () => ({ sfSymbol: 'person.circle.fill' }),
        }}
      />

      {/* Hide screens not in main nav */}
      <NativeTabs.Screen
        name="lease"
        options={{
          href: null,
        }}
      />
      <NativeTabs.Screen
        name="style"
        options={{
          href: null,
        }}
      />
    </NativeTabs>
  );
}
