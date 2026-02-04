import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/components/ui/colors';
import { SegmentTabs } from '@/components/ui/segment-tabs';
import { Text } from '@/components/ui/text';

import { useComputeTabs } from '../_layout';

function IndexHeader() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { activeTab, handleTabChange, tabs } = useComputeTabs();

  return (
    <View
      style={{
        backgroundColor: isDark ? colors.header.dark.background : colors.header.light.background,
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text
          style={{
            fontSize: 17,
            fontFamily: 'Rubik-SemiBold',
            color: isDark ? colors.header.dark.text : colors.header.light.text,
            textAlign: 'center',
          }}
        >
          Estimates
        </Text>
      </View>
      <SegmentTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}

export default function LeaseLayout() {
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
          header: () => <IndexHeader />,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'New Lease Estimate',
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
          title: 'Lease Details',
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
          headerBackTitle: 'Back',
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
