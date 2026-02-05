import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import colors from '@/components/ui/colors';
import { HeaderBackButton } from '@/components/ui/header-back-button';

export default function ComputeLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const headerColors = isDark ? colors.header.dark : colors.header.light;
  const router = useRouter();

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
      {/* Redirect index */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      {/* Finance Screens */}
      <Stack.Screen
        name="finance/index"
        options={{
          title: 'Finance Estimates',
          headerLeft: () => <HeaderBackButton label="Tools" color={headerColors.text} onPress={() => router.back()} />,
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
        name="finance/[id]"
        options={{
          title: 'Finance Details',
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
        name="finance/compare"
        options={{
          title: 'Compare Estimates',
          headerBackTitle: 'Back',
        }}
      />

      {/* Lease Screens */}
      <Stack.Screen
        name="lease/index"
        options={{
          title: 'Lease Estimates',
          headerLeft: () => <HeaderBackButton label="Tools" color={headerColors.text} onPress={() => router.back()} />,
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
        name="lease/[id]"
        options={{
          title: 'Lease Details',
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
      <Stack.Screen
        name="lease/compare"
        options={{
          title: 'Compare Estimates',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
