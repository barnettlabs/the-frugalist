import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import { HeaderBackButton } from '@/components/ui/header-back-button';
import colors from '@/components/ui/colors';

export default function WatchLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          title: 'Watch',
          headerLeft: () => <HeaderBackButton label="Tools" color={headerColors.text} onPress={() => router.back()} />,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Track New Product',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Product Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
