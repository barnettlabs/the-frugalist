import React from 'react';
import { Platform, Pressable, Text } from 'react-native';

import { Chevron } from '@/components/ui/icons';

type HeaderBackButtonProps = {
	label?: string;
	color?: string;
	onPress: () => void;
};

export function HeaderBackButton({ label = 'Back', color = '#000', onPress }: HeaderBackButtonProps) {
	return (
		<Pressable
			onPress={onPress}
			hitSlop={8}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				paddingRight: 12,
			}}
		>
			<Chevron direction="left" size={32} color={color} />
			{Platform.OS === 'ios' && <Text style={{ color, fontSize: 17, marginLeft: 2 }}>{label}</Text>}
		</Pressable>
	);
}
