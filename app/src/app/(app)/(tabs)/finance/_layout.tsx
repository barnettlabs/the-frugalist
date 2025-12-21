import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import colors from '@/components/ui/colors';

export default function FinanceLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const headerColors = isDark ? colors.header.dark : colors.header.light;

  return (
    <Stack
      initialRouteName="index"
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
          title: 'Finance Estimates',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'New Finance Estimate',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: headerColors.background,
          },
          headerTintColor: headerColors.text,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Finance Details',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: headerColors.background,
          },
          headerTintColor: headerColors.text,
        }}
      />
      <Stack.Screen
        name="compare"
        options={{
          title: 'Compare Estimates',
          headerStyle: {
            backgroundColor: headerColors.background,
          },
          headerTintColor: headerColors.text,
        }}
      />
      <Stack.Screen
        name="learn"
        options={{
          title: 'Learning Center',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: headerColors.background,
          },
          headerTintColor: headerColors.text,
        }}
      />
    </Stack>
  );
}
