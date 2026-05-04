import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Animated, Pressable, View } from 'react-native';

import { Chevron } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { getThemeColors } from '@/components/ui/theme';

interface FormSectionProps {
  /** Editorial section title — Fraunces serif */
  title: string;
  /** Optional numbered eyebrow, e.g. 1, 2, 3 */
  number?: string | number;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Optional helper rendered as small caps under the title */
  helper?: string;
}

/**
 * Editorial form section card. Used by all multi-section forms (finance, lease, watch).
 * Header strip with numeral + serif title; expandable content area.
 */
export function FormSection({
  title,
  number,
  children,
  collapsible = false,
  defaultCollapsed = false,
  helper,
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);
  const rotateAnim = React.useRef(new Animated.Value(defaultCollapsed ? 0 : 1)).current;

  const toggleCollapse = () => {
    if (collapsible) {
      Animated.spring(rotateAnim, {
        toValue: isCollapsed ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
      setIsCollapsed(!isCollapsed);
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const numberLabel = number !== undefined && number !== null
    ? `№ ${String(number).padStart(2, '0')}`
    : null;

  return (
    <View className="mb-3 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden">
      <Pressable
        onPress={toggleCollapse}
        disabled={!collapsible}
        className="flex-row items-center gap-3 px-5 py-4 border-b border-border-light dark:border-border-dark"
      >
        {numberLabel ? (
          <Text className="text-[11px] font-mono tracking-tight text-text-muted-light dark:text-text-muted-dark">
            {numberLabel}
          </Text>
        ) : null}
        <Text className="flex-1 font-display text-lg tracking-tight text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>
        {collapsible && (
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Chevron direction="down" size={16} color={theme.textMuted} />
          </Animated.View>
        )}
      </Pressable>

      {!isCollapsed && (
        <View className="p-5">
          {children}
          {helper ? (
            <Text className="mt-3 text-xs text-text-muted-light dark:text-text-muted-dark">
              {helper}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
