import { Stack } from 'expo-router';
import React from 'react';

export default function LearningLayout() {
	return (
		<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
			<Stack.Screen name="financing" />
			<Stack.Screen name="leasing" />
		</Stack>
	);
}
