import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from './colors';
import { Chevron } from './icons';
import { Text } from './text';

interface TabPageHeaderProps {
	/** Page title — always rendered absolute-centered in the bar */
	title: string;
	/** Show a back button on the left. Defaults to false. */
	showBack?: boolean;
	/** Label rendered next to the chevron (iOS-style). Defaults to 'Back'. */
	backLabel?: string;
	/** Override the back action. Defaults to router.back(). */
	onBack?: () => void;
	/** Optional right-slot node (e.g. action button) */
	right?: React.ReactNode;
}

/**
 * Inline page header that mimics the native iOS nav bar look but is fully
 * part of the React tree. The title is always absolute-centered so it stays
 * fixed regardless of what (if anything) sits in the left or right slots.
 *
 * Drop this in at the top of any screen body and set `headerShown: false`
 * on its Stack screen options. The Stack still drives the native push
 * transition; the header slides in with the rest of the screen content.
 */
export function TabPageHeader({ title, showBack = false, backLabel = 'Back', onBack, right }: TabPageHeaderProps) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	const handleBack = onBack ?? (() => router.back());
	const accentTint = isDark ? colors.accent.light : colors.accent.DEFAULT;

	return (
		<View
			style={{
				paddingTop: insets.top,
				backgroundColor: isDark ? colors.surface.dark : colors.surface.light,
				borderBottomWidth: 1,
				borderBottomColor: isDark ? colors.border.dark : colors.border.light,
			}}
		>
			<View className="h-11 flex-row items-center px-4">
				{/* Absolute-centered title — always fixed, never shifts */}
				<View pointerEvents="none" className="absolute inset-x-0 h-full items-center justify-center px-16">
					<Text
						className="font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
						style={{ fontSize: 17, lineHeight: 22, includeFontPadding: false }}
						numberOfLines={1}
					>
						{title}
					</Text>
				</View>

				{/* Left slot — back button when requested */}
				{showBack ? (
					<Pressable
						onPress={handleBack}
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
						className="z-10 -ml-1.5 flex-row items-center pr-2 active:opacity-60"
						accessibilityRole="button"
						accessibilityLabel="Back"
					>
						<Chevron direction="left" color={accentTint} size={22} />
						<Text
							className="ml-0.5 text-[17px] text-accent dark:text-accent-light"
							style={{ lineHeight: 22, includeFontPadding: false }}
							numberOfLines={1}
						>
							{backLabel}
						</Text>
					</Pressable>
				) : null}

				<View className="flex-1" />

				{/* Right slot */}
				{right ? <View className="z-10">{right}</View> : null}
			</View>
		</View>
	);
}
