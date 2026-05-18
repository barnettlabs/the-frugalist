import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Calculator as CalculatorIcon, Car as CarIcon, Eye as EyeIcon } from '@/components/ui/icons';
import type { getThemeColors } from '@/components/ui/theme';
import type { AppHref } from '@/lib/navigation';

export type RecentItem = {
	id: string;
	type: 'finance' | 'lease' | 'watch';
	title: string;
	subtitle: string;
	updatedAt: Date;
	route: AppHref;
	imageUrl?: string;
};

type RecentThumbProps = {
	item: RecentItem;
	theme: ReturnType<typeof getThemeColors>;
};

export const RecentThumb = React.memo(function RecentThumb({ item, theme }: RecentThumbProps) {
	if (item.type === 'watch' && item.imageUrl) {
		return (
			<View className="size-12 rounded-md overflow-hidden border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
				<Image source={{ uri: item.imageUrl }} style={styles.thumbImage} contentFit="cover" />
			</View>
		);
	}
	const Icon = item.type === 'finance' ? CalculatorIcon : item.type === 'lease' ? CarIcon : EyeIcon;
	return (
		<View className="size-12 items-center justify-center rounded-md border border-border-light dark:border-border-dark bg-tan-light dark:bg-charcoal-800">
			<Icon color={theme.textMuted} size={18} />
		</View>
	);
});

const styles = StyleSheet.create({
	thumbImage: { width: '100%', height: '100%' },
});
