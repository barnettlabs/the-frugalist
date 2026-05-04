import * as React from 'react';
import {
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Approximate translucent tab-bar height when rendered by @bottom-tabs.
 * iOS ≈ 49pt + bottom safe area; Android ≈ 56dp.
 * We add this on top of `safeAreaInsets.bottom` so content scrolls fully
 * past the tab bar with comfortable breathing room above it.
 */
const TAB_BAR_HEIGHT = Platform.select({ ios: 56, android: 60, default: 56 });

interface TabAwareScrollViewProps extends ScrollViewProps {
  /** When true, adds tab-bar-safe bottom padding. Set false on screens with no tab bar. */
  tabAware?: boolean;
  /** Extra padding beyond the tab clearance — for empty state, etc. */
  extraBottomPadding?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Drop-in replacement for ScrollView that automatically adds the right
 * paddingBottom to clear the translucent tab bar + safe area inset.
 * Content scrolls behind the tab bar, but every field is reachable.
 */
export const TabAwareScrollView = React.forwardRef<ScrollView, TabAwareScrollViewProps>(
  (
    { tabAware = true, extraBottomPadding = 32, contentContainerStyle, children, ...rest },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const bottomPadding = tabAware ? TAB_BAR_HEIGHT + insets.bottom + extraBottomPadding : extraBottomPadding;

    return (
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[{ paddingBottom: bottomPadding }, contentContainerStyle]}
        {...rest}
      >
        {children}
      </ScrollView>
    );
  },
);

TabAwareScrollView.displayName = 'TabAwareScrollView';

/**
 * Returns a numeric `paddingBottom` value that clears the tab bar + safe area.
 * Use when you need to apply the offset to a non-ScrollView (FlatList contentContainerStyle, etc.).
 */
export function useTabBarBottomPadding(extra = 32) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + insets.bottom + extra;
}
