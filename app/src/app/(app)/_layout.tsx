import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';

import colors from '@/components/ui/colors';
import { useNotifications } from '@/lib/notifications/use-notifications';

export default function AppLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const headerColors = isDark ? colors.header.dark : colors.header.light;

  // Register for push notifications when entering the authenticated app
  const { register, isRegistered, error } = useNotifications();

  useEffect(() => {
    if (!isRegistered && !error) {
      register();
    }
  }, [isRegistered, error, register]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: headerColors.background,
        },
        headerTintColor: headerColors.text,
        headerTitleStyle: {
          fontFamily: 'Rubik-SemiBold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="learning"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerBackTitle: 'Home',
        }}
      />
    </Stack>
  );
}
