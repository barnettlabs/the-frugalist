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
 * Visible footprint of the native @bottom-tabs translucent tab bar on Android.
 * iOS lets UIKit auto-adjust the scroll content inset for the translucent tab
 * bar via `contentInsetAdjustmentBehavior: automatic` (default), so we don't
 * add any manual padding for it on iOS — only the small breathing buffer.
 */
const ANDROID_TAB_BAR = 56;

interface TabAwareScrollViewProps extends ScrollViewProps {
  /** When true, adds tab-bar-safe bottom padding. Set false on screens with no tab bar. */
  tabAware?: boolean;
  /** Breathing room above the tab bar. Defaults to 8pt. */
  extraBottomPadding?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const TabAwareScrollView = React.forwardRef<ScrollView, TabAwareScrollViewProps>(
  (
    { tabAware = true, extraBottomPadding = 8, contentContainerStyle, children, ...rest },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const bottomPadding = !tabAware
      ? extraBottomPadding
      : Platform.OS === 'ios'
        ? extraBottomPadding
        : ANDROID_TAB_BAR + insets.bottom + extraBottomPadding;

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
 * Returns a numeric `paddingBottom` value that clears the tab bar + safe area
 * on Android. iOS callers can use 0 (or a small breathing buffer) and rely on
 * UIKit's automatic content-inset adjustment.
 */
export function useTabBarBottomPadding(extra = 8) {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios' ? extra : ANDROID_TAB_BAR + insets.bottom + extra;
}
