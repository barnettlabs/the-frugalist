import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import colors from '@/components/ui/colors';
import { HeaderBackButton } from '@/components/ui/header-back-button';

const BACK_LABELS: Record<string, string> = {
  home: 'Home',
  tools: 'Tools',
  finance: 'Finance',
  lease: 'Lease',
};

export default function ComputeLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const headerColors = isDark ? colors.header.dark : colors.header.light;
  const router = useRouter();

  const backButton = (route: any) => {
    const from = (route.params as any)?.from;
    const label = BACK_LABELS[from] || 'Back';
    return <HeaderBackButton label={label} color={headerColors.text} onPress={() => router.back()} />;
  };

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
        options={({ route }) => ({
          title: 'Finance Estimates',
          headerLeft: () => backButton(route),
        })}
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
        options={({ route }) => ({
          title: 'Finance Details',
          headerLeft: () => backButton(route),
        })}
      />
      <Stack.Screen
        name="finance/learn"
        options={({ route }) => ({
          title: 'Financing Guide',
          headerLeft: () => backButton(route),
        })}
      />
      <Stack.Screen
        name="finance/compare"
        options={({ route }) => ({
          title: 'Compare Estimates',
          headerLeft: () => backButton(route),
        })}
      />

      {/* Lease Screens */}
      <Stack.Screen
        name="lease/index"
        options={({ route }) => ({
          title: 'Lease Estimates',
          headerLeft: () => backButton(route),
        })}
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
        options={({ route }) => ({
          title: 'Lease Details',
          headerLeft: () => backButton(route),
        })}
      />
      <Stack.Screen
        name="lease/learn"
        options={({ route }) => ({
          title: 'Leasing Guide',
          headerLeft: () => backButton(route),
        })}
      />
      <Stack.Screen
        name="lease/compare"
        options={({ route }) => ({
          title: 'Compare Estimates',
          headerLeft: () => backButton(route),
        })}
      />
    </Stack>
  );
}
