import React from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui';
import type { getThemeColors } from '@/components/ui/theme';

type FocusTileProps = {
	label: string;
	value: number;
	onPress: () => void;
	theme: ReturnType<typeof getThemeColors>;
};

export const FocusTile = React.memo(function FocusTile({ label, value, onPress, theme }: FocusTileProps) {
	return (
		<Pressable
			className="flex-1 active:opacity-65"
			style={{ backgroundColor: theme.cardBg, paddingVertical: 18, paddingHorizontal: 16 }}
			onPress={onPress}
			android_ripple={{ color: theme.cardBorder }}
		>
			<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
				{label}
			</Text>
			<Text
				className="font-mono tracking-tight text-text-primary-light dark:text-text-primary-dark"
				style={{ fontSize: 36, lineHeight: 42, includeFontPadding: false }}
			>
				{value}
			</Text>
		</Pressable>
	);
});
