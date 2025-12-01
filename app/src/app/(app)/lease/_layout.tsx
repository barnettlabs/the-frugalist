import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import colors from '@/components/ui/colors';

export default function LeaseLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const headerColors = isDark ? colors.header.dark : colors.header.light;

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
        name="index"
        options={{
          title: 'Lease Estimates',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'New Lease Estimate',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Lease Details',
        }}
      />
      <Stack.Screen
        name="compare"
        options={{
          title: 'Compare Estimates',
        }}
      />
    </Stack>
  );
}
