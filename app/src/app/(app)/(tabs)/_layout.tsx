import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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

const TAB_CONFIG = [
  { name: 'index', label: 'Home', Icon: DashboardIcon },
  { name: 'finance', label: 'Finance', Icon: CalculatorIcon },
  { name: 'lease', label: 'Lease', Icon: CarIcon },
  { name: 'tracker', label: 'Tracker', Icon: TagIcon },
  { name: 'settings', label: 'Settings', Icon: SettingsIcon },
];

const TAB_BAR_HEIGHT = 64;
const PILL_HEIGHT = 56;
const TAB_BAR_PADDING = 4;
const SPRING_CONFIG = { damping: 18, stiffness: 200 };

function CustomTabBar({
  state,
  descriptors,
  navigation,
  isDark,
  insets,
}: BottomTabBarProps & { isDark: boolean; insets: { bottom: number } }) {
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const [tabCenters, setTabCenters] = useState<number[]>([]);

  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(80);
  const isDragging = useSharedValue(false);
  const dragStartX = useSharedValue(0);

  // Filter to only visible tabs (those defined in TAB_CONFIG)
  const visibleRoutes = state.routes.filter(route => TAB_CONFIG.some(tab => tab.name === route.name));

  const activeIndex = visibleRoutes.findIndex(route => route.key === state.routes[state.index].key);

  // Calculate tab centers whenever widths change
  useEffect(() => {
    if (tabWidths.length === visibleRoutes.length) {
      const centers: number[] = [];
      let xPos = TAB_BAR_PADDING;
      for (let i = 0; i < tabWidths.length; i++) {
        centers.push(xPos + tabWidths[i] / 2);
        xPos += tabWidths[i];
      }
      setTabCenters(centers);
    }
  }, [tabWidths, visibleRoutes.length]);

  // Navigate to tab by index
  const navigateToTab = useCallback(
    (index: number) => {
      if (index >= 0 && index < visibleRoutes.length) {
        const route = visibleRoutes[index];
        navigation.navigate(route.name);
      }
    },
    [navigation, visibleRoutes]
  );

  // Find closest tab and navigate - called from JS thread
  const handleDragEnd = useCallback(
    (currentX: number, currentWidth: number) => {
      if (tabCenters.length === 0) return;

      const pillCenter = currentX + currentWidth / 2;
      let closestIndex = 0;
      let closestDistance = Math.abs(tabCenters[0] - pillCenter);

      for (let i = 1; i < tabCenters.length; i++) {
        const distance = Math.abs(tabCenters[i] - pillCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      navigateToTab(closestIndex);
    },
    [tabCenters, navigateToTab]
  );

  // Pan gesture for dragging the pill
  const panGesture = Gesture.Pan()
    .hitSlop({ top: 20, bottom: 20, left: 10, right: 10 })
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      dragStartX.value = pillX.value;
    })
    .onUpdate(event => {
      'worklet';
      const newX = dragStartX.value + event.translationX;
      const minX = TAB_BAR_PADDING;
      const maxX = tabBarWidth - TAB_BAR_PADDING * 2 - pillWidth.value;
      pillX.value = Math.max(minX, Math.min(maxX, newX));
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
      runOnJS(handleDragEnd)(pillX.value, pillWidth.value);
    });

  // Calculate pill position when active tab changes or measurements update
  useEffect(() => {
    if (tabWidths.length === visibleRoutes.length && tabBarWidth > 0 && activeIndex >= 0 && !isDragging.value) {
      let xPosition = TAB_BAR_PADDING;
      for (let i = 0; i < activeIndex; i++) {
        xPosition += tabWidths[i];
      }

      // Pill matches the tab width
      const targetWidth = tabWidths[activeIndex];
      const targetX = xPosition;

      pillX.value = withSpring(targetX, SPRING_CONFIG);
      pillWidth.value = withSpring(targetWidth, SPRING_CONFIG);
    }
  }, [activeIndex, tabWidths, tabBarWidth, visibleRoutes, pillX, pillWidth, isDragging]);

  const pillOpacity = useSharedValue(activeIndex >= 0 ? 1 : 0);

  useEffect(() => {
    pillOpacity.value = withSpring(activeIndex >= 0 ? 1 : 0, SPRING_CONFIG);
  }, [activeIndex, pillOpacity]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillOpacity.value,
  }));

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  const handleBarLayout = (event: LayoutChangeEvent) => {
    setTabBarWidth(event.nativeEvent.layout.width);
  };

  const tabBarColors = isDark ? colors.tabBar.dark : colors.tabBar.light;

  // Animated style for the mask container (moves with pill)
  const maskContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillOpacity.value,
  }));

  // Animated style for the inner content (counter-translates to keep icons aligned)
  const maskContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -pillX.value + TAB_BAR_PADDING }],
  }));

  return (
    <View
      style={[
        tabBarStyles.container,
        {
          bottom: insets.bottom || 16,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
          shadowOpacity: isDark ? 0.4 : 0.2,
        },
      ]}
      onLayout={handleBarLayout}
    >
      {/* Base layer: Inactive icons + labels (handles taps) */}
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const tabConfig = TAB_CONFIG.find(t => t.name === route.name);

        if (!tabConfig) return null;

        const { Icon, label } = tabConfig;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            onLayout={e => handleTabLayout(index, e)}
            style={tabBarStyles.tabButton}
            accessibilityRole="button"
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            <View style={[tabBarStyles.tabContent, { marginTop: 2 }]}>
              <Icon color={tabBarColors.inactive} size={22} />
              <Text style={[tabBarStyles.label, { color: tabBarColors.inactive }]}>{label}</Text>
            </View>
          </Pressable>
        );
      })}

      {/* Middle layer: Draggable pill */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            tabBarStyles.pill,
            { backgroundColor: isDark ? colors.charcoal[700] : colors.neutral[200] },
            pillStyle,
          ]}
        />
      </GestureDetector>

      {/* Top layer: Masked active icons (blue icon + text, covers inactive) */}
      <Animated.View style={[tabBarStyles.maskContainer, maskContainerStyle]} pointerEvents="none">
        <Animated.View style={[tabBarStyles.maskContent, maskContentStyle]}>
          {visibleRoutes.map((route, index) => {
            const tabConfig = TAB_CONFIG.find(t => t.name === route.name);
            if (!tabConfig) return null;

            const { Icon, label } = tabConfig;
            const tabWidth = tabWidths[index] || 0;

            return (
              <View key={route.key} style={[tabBarStyles.maskTab, { width: tabWidth }]}>
                <View style={tabBarStyles.tabContent}>
                  <Icon color={colors.primary.DEFAULT} size={22} />
                  <Text style={[tabBarStyles.label, { color: colors.primary.DEFAULT }]}>{label}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    borderRadius: 32,
    borderWidth: 1,
    paddingVertical: TAB_BAR_PADDING,
    paddingHorizontal: TAB_BAR_PADDING,
    height: TAB_BAR_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
  },
  pill: {
    position: 'absolute',
    height: PILL_HEIGHT,
    borderRadius: 26,
    top: TAB_BAR_PADDING - 1,
  },
  tabButton: {
    flex: 1,
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Rubik-Medium',
  },
  maskContainer: {
    position: 'absolute',
    height: PILL_HEIGHT,
    top: TAB_BAR_PADDING,
    left: 0,
    overflow: 'hidden',
    borderRadius: 26,
  },
  maskContent: {
    flexDirection: 'row',
    height: PILL_HEIGHT,
    alignItems: 'center',
  },
  maskTab: {
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
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
  const headerColors = isDark ? colors.header.dark : colors.header.light;

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} isDark={isDark} insets={insets} />}
      screenOptions={{
        headerShown: true,
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
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="lease"
        options={{
          title: 'Lease',
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
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
