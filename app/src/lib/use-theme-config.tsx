import type { Theme } from 'expo-router';
import { DarkTheme as _DarkTheme, DefaultTheme } from 'expo-router';
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
		primary: colors.accent.light,
		background: colors.background.dark, // Pure black
		text: colors.text.primary.dark,
		border: colors.border.dark,
		card: colors.surface.dark, // Dark gray cards
		notification: colors.accent.DEFAULT,
	},
	fonts,
};

const LightTheme: Theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: colors.accent.DEFAULT,
		background: colors.background.light, // Off-white
		text: colors.text.primary.light,
		border: colors.border.light,
		card: colors.surface.light, // Bright white cards
		notification: colors.accent.DEFAULT,
	},
	fonts,
};

export function useThemeConfig() {
	const { colorScheme } = useColorScheme();

	if (colorScheme === 'dark') return DarkTheme;

	return LightTheme;
}
