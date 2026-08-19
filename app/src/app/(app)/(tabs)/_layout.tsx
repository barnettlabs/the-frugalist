import { Redirect, SplashScreen } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect } from 'react';

import { useAuth, useIsFirstTime } from '@/lib';

export default function TabLayout() {
	const status = useAuth.use.status();
	const [isFirstTime] = useIsFirstTime();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	const hideSplash = useCallback(async () => {
		await SplashScreen.hideAsync();
	}, []);

	useEffect(() => {
		if (status !== 'idle') {
			setTimeout(() => {
				hideSplash();
			}, 1000);
		}
	}, [hideSplash, status]);

	if (isFirstTime) {
		return <Redirect href="/onboarding" />;
	}
	if (status === 'signOut') {
		return <Redirect href="/(auth)/login" />;
	}

	const activeTint = isDark ? '#F0EADE' : '#171B27';
	const inactiveTint = isDark ? '#9F9889' : '#857C6B';

	return (
		<NativeTabs
			tintColor={activeTint}
			iconColor={{ default: inactiveTint, selected: activeTint }}
			labelStyle={{ default: { color: inactiveTint }, selected: { color: activeTint } }}
		>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
				<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="tools">
				<NativeTabs.Trigger.Icon sf={{ default: 'wrench.and.screwdriver', selected: 'wrench.and.screwdriver.fill' }} />
				<NativeTabs.Trigger.Label>Toolkit</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="settings">
				<NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
				<NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			{/* Reachable by route, but not shown in the tab bar. */}
			<NativeTabs.Trigger name="style" hidden />
		</NativeTabs>
	);
}
