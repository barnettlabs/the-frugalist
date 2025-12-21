import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Plus } from './icons';
import { Text } from './text';

const TAB_BAR_HEIGHT = 64;
const FAB_SIZE = 56;

type FloatingAddButtonProps = {
  onPress: () => void;
  color: string;
  accessibilityLabel: string;
};

export function FloatingAddButton({ onPress, color, accessibilityLabel }: FloatingAddButtonProps) {
  const insets = useSafeAreaInsets();

  // Position the FAB so it sits centered above the tab bar, overlapping slightly
  const tabBarBottom = insets.bottom || 16;
  const fabBottom = tabBarBottom + TAB_BAR_HEIGHT + 8;

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
