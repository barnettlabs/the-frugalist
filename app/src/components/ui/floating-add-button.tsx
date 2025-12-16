import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Plus } from './icons';

const TAB_BAR_HEIGHT = 64;
const FAB_SIZE = 56;

type FloatingAddButtonProps = {
  onPress: () => void;
  color: string;
  accessibilityLabel: string;
};

export function FloatingAddButton({
  onPress,
  color,
  accessibilityLabel,
}: FloatingAddButtonProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Position the FAB so it sits centered above the tab bar, overlapping slightly
  const tabBarBottom = insets.bottom || 16;
  const fabBottom = tabBarBottom + TAB_BAR_HEIGHT - 8;

  const stemColor = isDark ? '#0F172A' : '#FFFFFF';

  return (
    <View
      style={[
        styles.container,
        {
          bottom: fabBottom,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Water droplet flare effect - left side */}
      <View
        style={[
          styles.flareLeft,
          {
            backgroundColor: stemColor,
            bottom: -18,
          },
        ]}
      />

      {/* Water droplet flare effect - right side */}
      <View
        style={[
          styles.flareRight,
          {
            backgroundColor: stemColor,
            bottom: -18,
          },
        ]}
      />

      {/* Center stem */}
      <View
        style={[
          styles.stem,
          {
            backgroundColor: stemColor,
            bottom: -16,
          },
        ]}
      />

      {/* The actual button */}
      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        <Plus color="#FFFFFF" size={28} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  stem: {
    position: 'absolute',
    width: 24,
    height: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  flareLeft: {
    position: 'absolute',
    left: '50%',
    marginLeft: -32,
    width: 24,
    height: 22,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 4,
    transform: [{ skewX: '-15deg' }],
  },
  flareRight: {
    position: 'absolute',
    right: '50%',
    marginRight: -32,
    width: 24,
    height: 22,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 4,
    transform: [{ skewX: '15deg' }],
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
});
