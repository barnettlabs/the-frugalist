import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'transparent' },
			}}
		>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="learning" />
			<Stack.Screen name="profile" />
			<Stack.Screen name="watch" />
			<Stack.Screen name="compute" />
		</Stack>
	);
}
