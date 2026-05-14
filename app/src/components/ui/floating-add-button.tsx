import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Plus } from './icons';
import { Text } from './text';

const FAB_SIZE = 56;

type FloatingAddButtonProps = {
	onPress: () => void;
	color: string;
	accessibilityLabel: string;
};

export function FloatingAddButton({ onPress, color, accessibilityLabel }: FloatingAddButtonProps) {
	const insets = useSafeAreaInsets();
	const fabBottom = Math.max(insets.bottom, 16) + 16;

	return (
		<View
			style={[
				styles.container,
				{
					bottom: fabBottom,
				},
			]}
			pointerEvents="box-none"
		>
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: color,
						shadowColor: color,
					},
				]}
				onPress={onPress}
				accessibilityLabel={accessibilityLabel}
				accessibilityRole="button"
			>
				<Plus color="#FFFFFF" size={28} />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		right: 20,
		zIndex: 100,
	},
	fab: {
		width: FAB_SIZE,
		height: FAB_SIZE,
		borderRadius: FAB_SIZE / 2,
		alignItems: 'center',
		justifyContent: 'center',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 8,
		elevation: 10,
	},
});
