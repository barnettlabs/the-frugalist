import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { Chevron } from '@/components/ui/icons';
import type { getThemeColors } from '@/components/ui/theme';

type ActionRowProps = {
	label: string;
	hint: string;
	icon: React.ReactNode;
	onPress: () => void;
	theme: ReturnType<typeof getThemeColors>;
};

export const ActionRow = React.memo(function ActionRow({ label, hint, icon, onPress, theme }: ActionRowProps) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center gap-3 px-4 py-3.5 rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark active:opacity-60"
		>
			<View className="w-10 h-10 items-center justify-center rounded-md bg-primary dark:bg-text-primary-dark">
				{icon}
			</View>
			<View className="flex-1">
				<Text className="text-[15px] font-medium text-text-primary-light dark:text-text-primary-dark">{label}</Text>
				<Text className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">{hint}</Text>
			</View>
			<Chevron direction="right" color={theme.textMuted} size={14} />
		</Pressable>
	);
});
