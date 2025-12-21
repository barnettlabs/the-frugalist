import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Animated, Pressable, View } from 'react-native';

import { Chevron } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import colors from '@/components/ui/colors';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function FormSection({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const rotateAnim = React.useRef(
    new Animated.Value(defaultCollapsed ? 0 : 1)
  ).current;

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

  return (
    <View className="mb-6">
      <Pressable
        onPress={toggleCollapse}
        disabled={!collapsible}
        className="mb-3 flex-row items-center justify-between"
      >
        <Text className="font-rubik-semibold text-lg text-neutral-800 dark:text-neutral-200">
          {title}
        </Text>
        {collapsible && (
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Chevron
              direction="down"
              size={20}
              color={isDark ? colors.neutral[400] : colors.neutral[500]}
            />
          </Animated.View>
        )}
      </Pressable>

      {!isCollapsed && (
        <View className="rounded-lg bg-white p-4 dark:bg-charcoal-800">
          {children}
        </View>
      )}
    </View>
  );
}
