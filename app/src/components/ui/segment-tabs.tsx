import { useColorScheme } from 'nativewind';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import colors from './colors';
import { Text } from './text';

type Tab = {
  key: string;
  label: string;
};

type SegmentTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
};

const IOS_PADDING = 3;

export function SegmentTabs({ tabs, activeTab, onTabChange }: SegmentTabsProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';

  const activeIndex = tabs.findIndex(t => t.key === activeTab);
  const containerWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => {
    if (containerWidth.value === 0) return { opacity: 0 };

    // Account for container padding (3px on each side)
    const innerWidth = containerWidth.value - IOS_PADDING * 2;
    const tabWidth = innerWidth / tabs.length;
    return {
      opacity: 1,
      width: tabWidth,
      transform: [{ translateX: activeIndex * tabWidth }],
    };
  });

  if (isIOS) {
    return (
      <View
        style={[
          styles.iosContainer,
          {
            // Apple-style: light gray in light mode, dark gray in dark mode
            backgroundColor: isDark ? colors.charcoal[800] : colors.charcoal[200],
          },
        ]}
        onLayout={e => {
          containerWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View
          style={[
            styles.iosIndicator,
            {
              // White indicator in light mode, elevated gray in dark mode
              backgroundColor: isDark ? colors.charcoal[700] : '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 2,
              elevation: 2,
            },
            indicatorStyle,
          ]}
        />
        {tabs.map(tab => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable key={tab.key} style={styles.iosTab} onPress={() => onTabChange(tab.key)}>
              <Text
                style={[
                  styles.iosLabel,
                  {
                    // White text when active in dark mode, black in light mode
                    color: isActive
                      ? isDark
                        ? '#FFFFFF'
                        : '#000000'
                      : isDark
                        ? colors.charcoal[400]
                        : colors.charcoal[500],
                    fontFamily: isActive ? 'Rubik-SemiBold' : 'Rubik-Medium',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Android: Material-style underline tabs
  return (
    <View
      style={[
        styles.androidContainer,
        {
          backgroundColor: isDark ? colors.charcoal[950] : colors.neutral[50],
          borderBottomColor: isDark ? colors.charcoal[700] : colors.charcoal[200],
        },
      ]}
      onLayout={e => {
        containerWidth.value = e.nativeEvent.layout.width;
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={styles.androidTab}
            onPress={() => onTabChange(tab.key)}
            android_ripple={{ color: isDark ? colors.charcoal[700] : colors.charcoal[200] }}
          >
            <Text
              style={[
                styles.androidLabel,
                {
                  color: isActive ? colors.accent.DEFAULT : isDark ? colors.charcoal[400] : colors.charcoal[500],
                  fontFamily: isActive ? 'Rubik-SemiBold' : 'Rubik-Medium',
                },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={[styles.androidIndicator, { backgroundColor: colors.accent.DEFAULT }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // iOS Segmented Control Style
  iosContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    padding: 3,
    position: 'relative',
  },
  iosIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: 8,
  },
  iosTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iosLabel: {
    fontSize: 14,
  },

  // Android Material Style
  androidContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  androidTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  androidLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  androidIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
