import { useColorScheme } from 'nativewind';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import colors from './colors';
import { Chevron, Plus } from './icons';
import { Pressable, Text } from './index';
import { getThemeColors } from './theme';

type ToolCardProps = {
	title: string;
	subtitle?: string;
	icon: React.ReactNode;
	accentColor: string;
	count?: number;
	isLoading?: boolean;
	size?: 'default' | 'mini';
	onPress: () => void;
	onCreateNew?: () => void;
	delay?: number;
};

export function ToolCard({
	title,
	subtitle,
	icon,
	accentColor,
	count,
	isLoading = false,
	size = 'default',
	onPress,
	onCreateNew,
	delay = 0,
}: ToolCardProps) {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const theme = getThemeColors(isDark);

	if (size === 'mini') {
		return (
			<Animated.View entering={FadeInDown.duration(500).delay(delay).springify()}>
				<Pressable
					onPress={onPress}
					style={[
						styles.miniCard,
						{
							backgroundColor: theme.cardBg,
							borderColor: theme.cardBorder,
						},
					]}
				>
					<View style={styles.miniContent}>
						<View style={[styles.miniIconContainer, { backgroundColor: `${accentColor}15` }]}>{icon}</View>
						<View style={styles.miniTextContainer}>
							<Text style={[styles.miniTitle, { color: theme.textPrimary }]}>{title}</Text>
							{subtitle && <Text style={[styles.miniSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
						</View>
						<Chevron direction="right" color={theme.textMuted} size={20} />
					</View>
				</Pressable>
			</Animated.View>
		);
	}

	return (
		<Animated.View entering={FadeInDown.duration(500).delay(delay).springify()} style={styles.defaultCardWrapper}>
			<Pressable
				onPress={onPress}
				style={[
					styles.defaultCard,
					{
						backgroundColor: theme.cardBg,
						borderColor: theme.cardBorder,
					},
				]}
			>
				{/* Icon and Title */}
				<View style={styles.defaultHeader}>
					<View style={[styles.defaultIconContainer, { backgroundColor: `${accentColor}15` }]}>{icon}</View>
					<Text style={[styles.defaultTitle, { color: theme.textPrimary }]}>{title}</Text>
				</View>

				{/* Count */}
				<View style={styles.defaultCountContainer}>
					{isLoading ? (
						<View style={[styles.countSkeleton, { backgroundColor: `${accentColor}30` }]} />
					) : (
						<Text style={[styles.defaultCount, { color: accentColor }]}>{count ?? 0}</Text>
					)}
					<Text style={[styles.defaultCountLabel, { color: theme.textMuted }]}>{count === 1 ? 'item' : 'items'}</Text>
				</View>

				{/* New Button */}
				{onCreateNew && (
					<Pressable
						onPress={e => {
							e.stopPropagation();
							onCreateNew();
						}}
						style={[
							styles.newButton,
							{
								backgroundColor: accentColor,
								shadowColor: accentColor,
							},
						]}
					>
						<Plus color="#FFFFFF" size={14} />
						<Text style={styles.newButtonText}>New</Text>
					</Pressable>
				)}
			</Pressable>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	// Default size styles
	defaultCardWrapper: {
		width: '48.5%',
	},
	defaultCard: {
		borderRadius: 16,
		borderWidth: 1,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},
	defaultHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	defaultIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	defaultTitle: {
		fontSize: 15,
		fontWeight: '600',
		fontFamily: 'Rubik-SemiBold',
	},
	defaultCountContainer: {
		flexDirection: 'row',
		alignItems: 'baseline',
		marginBottom: 16,
	},
	defaultCount: {
		fontSize: 28,
		fontWeight: '700',
		fontFamily: 'Rubik-Bold',
		lineHeight: 34,
		marginRight: 6,
	},
	defaultCountLabel: {
		fontSize: 13,
		fontWeight: '500',
	},
	countSkeleton: {
		width: 40,
		height: 32,
		borderRadius: 6,
		marginRight: 6,
	},
	newButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		gap: 4,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 4,
	},
	newButtonText: {
		color: '#FFFFFF',
		fontSize: 13,
		fontWeight: '600',
		fontFamily: 'Rubik-SemiBold',
	},

	// Mini size styles
	miniCard: {
		borderRadius: 14,
		borderWidth: 1,
		padding: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 6,
		elevation: 2,
	},
	miniContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	miniIconContainer: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14,
	},
	miniTextContainer: {
		flex: 1,
	},
	miniTitle: {
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Rubik-SemiBold',
		marginBottom: 2,
	},
	miniSubtitle: {
		fontSize: 13,
		fontWeight: '400',
	},
});
