import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

type EmptyLedgerProps = {
	onPress: () => void;
};

export const EmptyLedger = React.memo(function EmptyLedger({ onPress }: EmptyLedgerProps) {
	return (
		<View className="rounded-md p-6 overflow-hidden border bg-primary border-primary-dark">
			<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-3">Your first entry</Text>
			<Text className="font-display tracking-tightest text-white" style={{ fontSize: 28, lineHeight: 30 }}>
				Pick something you've been
			</Text>
			<Text
				className="font-display italic tracking-tightest mt-1 text-signal-light"
				style={{ fontSize: 28, lineHeight: 30 }}
			>
				eyeing.
			</Text>
			<Text className="text-sm text-white/70 mt-3 mb-5">
				Track your first product. Set a target. Wait for the market to come to you.
			</Text>
			<Pressable onPress={onPress} className="self-start rounded-md px-5 py-3 bg-surface-light">
				<Text className="text-sm font-medium text-primary">Track first product</Text>
			</Pressable>
		</View>
	);
});
