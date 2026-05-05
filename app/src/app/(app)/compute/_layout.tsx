import { Stack } from 'expo-router';
import React from 'react';

export default function ComputeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="finance/index" />
      <Stack.Screen name="finance/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="finance/[id]" />
      <Stack.Screen name="finance/learn" />
      <Stack.Screen name="finance/compare" />
      <Stack.Screen name="lease/index" />
      <Stack.Screen name="lease/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="lease/[id]" />
      <Stack.Screen name="lease/learn" />
      <Stack.Screen name="lease/compare" />
    </Stack>
  );
}
