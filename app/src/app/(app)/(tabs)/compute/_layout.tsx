import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import colors from '@/components/ui/colors';

export default function ComputeLayout() {
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
        contentStyle: {
          backgroundColor: isDark ? colors.charcoal[950] : colors.neutral[50],
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="finance/[id]"
        options={{
          title: 'Finance Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="finance/create"
        options={{
          title: 'New Finance Estimate',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="finance/compare"
        options={{
          title: 'Compare Estimates',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="finance/learn"
        options={{
          title: 'Financing Guide',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="lease/[id]"
        options={{
          title: 'Lease Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="lease/create"
        options={{
          title: 'New Lease Estimate',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="lease/compare"
        options={{
          title: 'Compare Estimates',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="lease/learn"
        options={{
          title: 'Leasing Guide',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
