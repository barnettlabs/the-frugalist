import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import colors from './colors';
import { tw } from './theme';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  withDots?: boolean;
}

export function ScreenContainer({ children, withDots = true, className, style, ...props }: ScreenContainerProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Accent blue dots matching web pattern
  // Light: accent blue on off-white. Dark: lighter blue on black for visibility.
  const dotColor = isDark ? 'rgba(90, 125, 171, 0.18)' : 'rgba(35, 88, 146, 0.12)';

  return (
    <View className={`flex-1 ${tw.pageBg} ${className ?? ''}`} style={style} {...props}>
      {withDots && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <Pattern id="dotPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
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
