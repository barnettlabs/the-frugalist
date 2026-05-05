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
 * Visible footprint of the native @bottom-tabs translucent tab bar.
 * iOS ≈ 49pt + bottom safe area; Android ≈ 56dp + bottom inset.
 * On iOS the OS auto-adjusts content insets for the translucent tab bar via
 * `contentInsetAdjustmentBehavior: automatic`, so we deliberately disable that
 * and apply paddingBottom ourselves to keep both platforms identical.
 */
const TAB_BAR_VISIBLE = Platform.select({ ios: 49, android: 56, default: 49 });

interface TabAwareScrollViewProps extends ScrollViewProps {
  /** When true, adds tab-bar-safe bottom padding. Set false on screens with no tab bar. */
  tabAware?: boolean;
  /** Extra breathing room beyond the tab-bar clearance. Defaults to 8pt. */
  extraBottomPadding?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const TabAwareScrollView = React.forwardRef<ScrollView, TabAwareScrollViewProps>(
  (
    { tabAware = true, extraBottomPadding = 8, contentContainerStyle, children, ...rest },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const bottomPadding = tabAware
      ? TAB_BAR_VISIBLE + insets.bottom + extraBottomPadding
      : extraBottomPadding;

    return (
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
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
export function useTabBarBottomPadding(extra = 8) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_VISIBLE + insets.bottom + extra;
}
