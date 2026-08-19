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
			className="flex-row items-center gap-3 rounded-md border border-border-light bg-surface-light px-4 py-3.5 active:opacity-60 dark:border-border-dark dark:bg-surface-dark"
		>
			<View className="size-10 items-center justify-center rounded-md bg-primary dark:bg-text-primary-dark">
				{icon}
			</View>
			<View className="flex-1">
				<Text className="text-[15px] font-medium text-text-primary-light dark:text-text-primary-dark">{label}</Text>
				<Text className="mt-0.5 text-xs text-text-muted-light dark:text-text-muted-dark">{hint}</Text>
			</View>
			<Chevron direction="right" color={theme.textMuted} size={14} />
		</Pressable>
	);
});
