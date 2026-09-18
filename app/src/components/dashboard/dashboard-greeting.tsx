import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { User } from '@/lib/types/models';

type DashboardGreetingProps = {
	user?: User;
	isFresh: boolean;
};

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 5) return 'Still up';
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	return 'Good evening';
}

export const DashboardGreeting = React.memo(function DashboardGreeting({ user, isFresh }: DashboardGreetingProps) {
	const firstName = user?.first_name || 'Welcome';
	const greeting = getGreeting();

	return (
		<View className="flex-row items-start justify-between gap-4">
			<View className="flex-1">
				<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
					{greeting}
				</Text>
				<Text
					className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
					style={{ fontSize: 40, lineHeight: 48, includeFontPadding: false }}
				>
					{firstName}
				</Text>
				<Text
					className="mt-1 font-display italic tracking-tight text-accent dark:text-accent-light"
					style={{ fontSize: 26, lineHeight: 34, includeFontPadding: false }}
				>
					{isFresh ? "Let's start small." : "Here's where you stand."}
				</Text>
			</View>
			<Link href="/(app)/profile" asChild>
				<Pressable className="active:opacity-70">
					<View className="size-12 items-center justify-center overflow-hidden rounded-full border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark">
						{user?.avatar_url ? (
							<Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
						) : (
							<Text
								className="font-display text-text-primary-light dark:text-text-primary-dark"
								style={{ fontSize: 18, lineHeight: 24, includeFontPadding: false }}
							>
								{firstName[0]?.toUpperCase() || 'U'}
							</Text>
						)}
					</View>
				</Pressable>
			</Link>
		</View>
	);
});

const styles = StyleSheet.create({
	avatarImage: { width: '100%', height: '100%' },
});
