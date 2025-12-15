import { Redirect, SplashScreen, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  Calculator as CalculatorIcon,
  Car as CarIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Tag as TagIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime } from '@/lib';

type TabButtonProps = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  isDark: boolean;
};

function TabButton({ onPress, onLongPress, isFocused, label, icon, activeIcon, isDark }: TabButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={tabStyles.tabButton}
    >
      <Animated.View
        style={[
          tabStyles.tabContent,
          isFocused && (isDark ? tabStyles.activeTabDark : tabStyles.activeTabLight),
          animatedStyle,
        ]}
      >
        {isFocused ? activeIcon : icon}
        {isFocused && (
          <Text style={[tabStyles.label, isDark ? tabStyles.labelDark : tabStyles.labelLight]}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const tabStyles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  activeTabLight: {
    backgroundColor: colors.primary[500],
  },
  activeTabDark: {
    backgroundColor: colors.primary[500],
  },
  label: {
    fontSize: 12,
    fontFamily: 'Rubik-SemiBold',
  },
  labelLight: {
    color: '#FFFFFF',
  },
  labelDark: {
    color: '#FFFFFF',
  },
});

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  //   if (isFirstTime) {
  //     return <Redirect href="/onboarding" />;
  //   }
  if (status === 'signOut') {
    return <Redirect href="/(auth)/login" />;
  }

  // Theme-aware colors
  const tabBarColors = isDark ? colors.tabBar.dark : colors.tabBar.light;
  const headerColors = isDark ? colors.header.dark : colors.header.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarColors.active,
        tabBarInactiveTintColor: tabBarColors.inactive,
        headerShown: true,
        // Neutral header - no color, just clean
        headerStyle: {
          backgroundColor: headerColors.background,
          borderBottomWidth: 1,
          borderBottomColor: headerColors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: headerColors.text,
        headerTitleStyle: {
          fontFamily: 'Rubik-SemiBold',
          fontSize: 17,
        },
        // Floating tab bar styling
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom || 16,
          marginHorizontal: 16,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 100,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 68,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.4 : 0.2,
          shadowRadius: 16,
          elevation: 12,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarButton: (props) => (
            <TabButton
              onPress={props.onPress!}
              onLongPress={props.onLongPress!}
              isFocused={props.accessibilityState?.selected ?? false}
              label="Home"
              icon={<DashboardIcon color={tabBarColors.inactive} />}
              activeIcon={<DashboardIcon color="#FFFFFF" />}
              isDark={isDark}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          headerShown: false,
          tabBarButton: (props) => (
            <TabButton
              onPress={props.onPress!}
              onLongPress={props.onLongPress!}
              isFocused={props.accessibilityState?.selected ?? false}
              label="Finance"
              icon={<CalculatorIcon color={tabBarColors.inactive} />}
              activeIcon={<CalculatorIcon color="#FFFFFF" />}
              isDark={isDark}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="lease"
        options={{
          title: 'Lease',
          headerShown: false,
          tabBarButton: (props) => (
            <TabButton
              onPress={props.onPress!}
              onLongPress={props.onLongPress!}
              isFocused={props.accessibilityState?.selected ?? false}
              label="Lease"
              icon={<CarIcon color={tabBarColors.inactive} />}
              activeIcon={<CarIcon color="#FFFFFF" />}
              isDark={isDark}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          headerShown: false,
          tabBarButton: (props) => (
            <TabButton
              onPress={props.onPress!}
              onLongPress={props.onLongPress!}
              isFocused={props.accessibilityState?.selected ?? false}
              label="Tracker"
              icon={<TagIcon color={tabBarColors.inactive} />}
              activeIcon={<TagIcon color="#FFFFFF" />}
              isDark={isDark}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: headerColors.background,
          },
          headerTintColor: headerColors.text,
          headerTitleStyle: {
            fontFamily: 'Rubik-SemiBold',
          },
          headerShadowVisible: false,
          tabBarButton: (props) => (
            <TabButton
              onPress={props.onPress!}
              onLongPress={props.onLongPress!}
              isFocused={props.accessibilityState?.selected ?? false}
              label="Settings"
              icon={<SettingsIcon color={tabBarColors.inactive} />}
              activeIcon={<SettingsIcon color="#FFFFFF" />}
              isDark={isDark}
            />
          ),
        }}
      />

      {/* Hidden screens that are accessible but not in tabs */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: true,
          title: 'Profile',
          headerStyle: {
            backgroundColor: headerColors.background,
            borderBottomWidth: 1,
            borderBottomColor: headerColors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: headerColors.text,
          headerTitleStyle: {
            fontFamily: 'Rubik-SemiBold',
            fontSize: 17,
          },
        }}
      />

      <Tabs.Screen
        name="learning"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      {/* Hide the old style screen */}
      <Tabs.Screen
        name="style"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
