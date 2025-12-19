import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import colors from '@/components/ui/colors';

export default function LearningLayout() {
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
        name="financing"
        options={{
          title: 'Financing Terms',
          headerBackTitle: 'Home',
        }}
      />
      <Stack.Screen
        name="leasing"
        options={{
          title: 'Leasing Terms',
          headerBackTitle: 'Home',
        }}
      />
    </Stack>
  );
}
