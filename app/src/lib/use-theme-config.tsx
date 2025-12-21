import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

import colors from '@/components/ui/colors';

const fonts: Theme['fonts'] = {
  regular: {
    fontFamily: 'Rubik-Regular',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'Rubik-Bold',
    fontWeight: 'bold',
  },
  heavy: {
    fontFamily: 'Rubik-Bold',
    fontWeight: '900',
  },
};

const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary.light, // Primary tint for dark mode
    background: colors.charcoal[950],
    text: colors.charcoal[50],
    border: colors.charcoal[700],
    card: colors.charcoal[900],
    notification: colors.primary.DEFAULT,
  },
  fonts,
};

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.DEFAULT, // Deep Blue
    background: colors.neutral[50],
    text: colors.charcoal[900],
    border: colors.neutral[200],
    card: colors.white,
    notification: colors.primary.DEFAULT,
  },
  fonts,
};

export function useThemeConfig() {
  const { colorScheme } = useColorScheme();

  if (colorScheme === 'dark') return DarkTheme;

  return LightTheme;
}
