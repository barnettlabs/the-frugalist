import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

type EmptyLedgerProps = {
	onPress: () => void;
};

export const EmptyLedger = React.memo(function EmptyLedger({ onPress }: EmptyLedgerProps) {
	return (
		<View className="overflow-hidden rounded-md border border-primary-dark bg-primary p-6">
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-white/60">Your first entry</Text>
			<Text className="font-display tracking-tightest text-white" style={{ fontSize: 28, lineHeight: 30 }}>
				{"Pick something you've been"}
			</Text>
			<Text
				className="mt-1 font-display italic tracking-tightest text-signal-light"
				style={{ fontSize: 28, lineHeight: 30 }}
			>
				eyeing.
			</Text>
			<Text className="mb-5 mt-3 text-sm text-white/70">
				Track your first product. Set a target. Wait for the market to come to you.
			</Text>
			<Pressable onPress={onPress} className="self-start rounded-md bg-surface-light px-5 py-3">
				<Text className="text-sm font-medium text-primary">Track first product</Text>
			</Pressable>
		</View>
	);
});
