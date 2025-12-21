import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import colors from './colors';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  withDots?: boolean;
}

export function ScreenContainer({ children, withDots = true, className, style, ...props }: ScreenContainerProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.charcoal[950] : colors.neutral[50];
  const dotColor = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.15)';

  return (
    <View className={`flex-1 bg-neutral-50 dark:bg-charcoal-950 ${className ?? ''}`} style={style} {...props}>
      {withDots && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <Pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <Circle cx="2" cy="2" r="1" fill={dotColor} />
              </Pattern>
            </Defs>
            {/*<Rect x="0" y="0" width="100%" height="100%" fill={bgColor} />*/}
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
          </Svg>
        </View>
      )}
      {children}
    </View>
  );
}
