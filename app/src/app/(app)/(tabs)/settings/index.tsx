import { Env } from '@env';
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { Platform, Share } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

import { useProfile } from '@/api/auth/use-profile';
import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import {
	Button,
	colors,
	FocusAwareStatusBar,
	Pressable,
	ScreenContainer,
	TabPageHeader,
	Text,
	View,
} from '@/components/ui';
import { TabAwareScrollView } from '@/components/ui/scroll-aware';
import { Bug, Chevron, Rate, Share as ShareIcon, Support, Website } from '@/components/ui/icons';
import { useAuth, useIsFirstTime, useSelectedTheme } from '@/lib';
import type { ColorSchemeType } from '@/lib';
import { openLinkInBrowser } from '@/lib/utils';

function isDevUser(email: string | undefined): boolean {
	if (!email || !Env.DEV_EMAILS) return false;
	const normalizedEmail = email.toLowerCase().trim();
	const baseEmail = normalizedEmail.replace(/\+[^@]*@/, '@');
	return Env.DEV_EMAILS.split(',')
		.map(e => e.trim().toLowerCase())
		.some(devEmail => baseEmail === devEmail);
}

export default function Settings() {
	const { t } = useTranslation();
	const signOut = useAuth.use.signOut();
	const { colorScheme } = useColorScheme();
	const { data: profile } = useProfile();

	const isDark = colorScheme === 'dark';
	const iconColor = isDark ? colors.text.muted.dark : colors.text.muted.light;

	const showDebug = isDevUser(profile?.email);

	const handleShare = async () => {
		try {
			await Share.share({
				message: Platform.select({
					ios: 'Check out TheFrugalist - the ultimate car finance & lease calculator!',
					default: 'Check out TheFrugalist - the ultimate car finance & lease calculator! https://thefrugalist.io',
				}),
				url: 'https://thefrugalist.io',
				title: 'TheFrugalist',
			});
		} catch {
			showMessage({
				message: t('common.error'),
				description: t('settings.share_failed'),
				type: 'danger',
			});
		}
	};

	const handleRate = async () => {
		const storeUrl = Platform.select({
			ios: `https://apps.apple.com/app/id${Application.applicationId}`,
			android: `https://play.google.com/store/apps/details?id=${Application.applicationId}`,
			default: 'https://thefrugalist.io',
		});
		// const storeUrl = 'https://thefrugalist.io';
		await openLinkInBrowser(storeUrl);
	};

	const handleContactSupport = async () => {
		const subject = encodeURIComponent('TheFrugalist Support Request');
		const body = encodeURIComponent(`\n\n---\nApp Version: ${Env.VERSION}\nPlatform: ${Platform.OS}`);
		const mailUrl = `mailto:jason@tensifi.com?subject=${subject}&body=${body}`;

		const canOpen = await Linking.canOpenURL(mailUrl);
		if (canOpen) {
			await Linking.openURL(mailUrl);
		} else {
			showMessage({
				message: t('common.error'),
				description: t('settings.email_client_error'),
				type: 'danger',
			});
		}
	};

	return (
		<ScreenContainer>
			<FocusAwareStatusBar />
			<TabPageHeader title="Account" />
			<TabAwareScrollView style={{ flex: 1 }}>
				<View className="flex-1 px-4 pt-3">
					{/* Profile Header Card */}
					<ProfileCard profile={profile} isDark={isDark} />

					{/* Appearance Section */}
					<Text className="pb-2 pt-4 text-lg text-neutral-900 dark:text-white">Appearance</Text>
					<ThemeButtonGroup />

					{/* App Info Section */}
					<ItemsContainer title="settings.app_info">
						<Item text="settings.app_name" value={Env.NAME} />
						<Item text="settings.version" value={Env.VERSION} />
						{/* <Item text="settings.build" value={Application.nativeBuildVersion || 'N/A'} /> */}
					</ItemsContainer>

					{/* Support Section */}
					<ItemsContainer title="settings.support_us">
						<Item text="settings.share" icon={<ShareIcon color={iconColor} />} onPress={handleShare} />
						<Item text="settings.rate" icon={<Rate color={iconColor} />} onPress={handleRate} />
						<Item text="settings.support" icon={<Support color={iconColor} />} onPress={handleContactSupport} />
					</ItemsContainer>

					{/* Links Section */}
					<ItemsContainer title="settings.links">
						<Item
							text="settings.web_app"
							icon={<Website color={iconColor} />}
							onPress={() => openLinkInBrowser('https://thefrugalist.io')}
						/>
						<Item text="settings.company" onPress={() => openLinkInBrowser('https://tensifi.com')} />
						<Item text="settings.privacy" onPress={() => openLinkInBrowser('https://thefrugalist.io/privacy')} />
						<Item text="settings.terms" onPress={() => openLinkInBrowser('https://thefrugalist.io/terms')} />
					</ItemsContainer>

					{/* Debug Section - Only for developers */}
					{showDebug && <DebugSection iconColor={iconColor} />}

					{/* Sign Out Button */}
					<View className="mt-8">
						<Pressable
							onPress={signOut}
							className="flex-row items-center justify-center rounded-md border border-danger/30 bg-danger/5 px-6 py-3.5 active:opacity-80"
						>
							<Text className="text-sm font-medium text-danger">Sign out</Text>
						</Pressable>
					</View>
				</View>
			</TabAwareScrollView>
		</ScreenContainer>
	);
}

function ThemeButtonGroup() {
	const { selectedTheme, setSelectedTheme } = useSelectedTheme();

	const themes: { value: ColorSchemeType; label: string; icon: string }[] = [
		{ value: 'light', label: 'Light', icon: '☀️' },
		{ value: 'dark', label: 'Dark', icon: '🌙' },
		{ value: 'system', label: 'Auto', icon: '⚙️' },
	];

	return (
		<View className="flex-row p-1 rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
			{themes.map(theme => {
				const isSelected = selectedTheme === theme.value;
				return (
					<Pressable
						key={theme.value}
						onPress={() => setSelectedTheme(theme.value)}
						className={`flex-1 flex-row items-center justify-center gap-1.5 rounded py-2 ${
							isSelected ? 'bg-tan-light dark:bg-charcoal-800' : ''
						}`}
					>
						<Text className="text-base">{theme.icon}</Text>
						<Text
							className={`text-sm font-medium ${
								isSelected
									? 'text-text-primary-light dark:text-text-primary-dark'
									: 'text-text-muted-light dark:text-text-muted-dark'
							}`}
						>
							{theme.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

function ProfileCard({
	profile,
	isDark,
}: {
	profile: { first_name: string; last_name: string; email: string } | undefined;
	isDark: boolean;
}) {
	const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '?';

	return (
		<Pressable
			onPress={() => router.push('/settings/profile')}
			className="mb-5 flex-row items-center rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark p-4 active:opacity-80"
		>
			<View className="size-14 items-center justify-center rounded-full border border-border-light dark:border-border-dark bg-tan-light dark:bg-charcoal-800">
				<Text
					className="font-display text-text-primary-light dark:text-text-primary-dark"
					style={{ fontSize: 18, lineHeight: 24, includeFontPadding: false }}
				>
					{initials}
				</Text>
			</View>

			<View className="ml-4 flex-1">
				<Text
					className="font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
					style={{ fontSize: 18, lineHeight: 24, includeFontPadding: false }}
				>
					{profile ? `${profile.first_name} ${profile.last_name}` : 'Loading…'}
				</Text>
				<Text className="text-sm text-text-muted-light dark:text-text-muted-dark mt-0.5">{profile?.email || ''}</Text>
			</View>
			<View className="flex-row items-center gap-1.5">
				<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
					View
				</Text>
				<Chevron direction="right" color={isDark ? colors.text.muted.dark : colors.text.muted.light} size={12} />
			</View>
		</Pressable>
	);
}

function DebugSection({ iconColor }: { iconColor: string }) {
	const [isSending, setIsSending] = useState(false);
	const [, setIsFirstTime] = useIsFirstTime();

	const handleResetOnboarding = () => {
		setIsFirstTime(true);
		showMessage({
			message: 'Onboarding Reset',
			description: 'Restart the app to see the onboarding flow.',
			type: 'success',
			duration: 3000,
		});
	};

	const handleTestNotification = async () => {
		setIsSending(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 500));

			showMessage({
				message: 'Test Notification',
				description: 'This is a test notification to verify the notification system is working correctly.',
				type: 'info',
				duration: 4000,
				icon: 'info',
			});

			showMessage({
				message: 'Notification Sent',
				description: 'Local notification triggered successfully',
				type: 'success',
				duration: 2000,
			});
		} catch {
			showMessage({
				message: 'Error',
				description: 'Failed to send test notification',
				type: 'danger',
			});
		} finally {
			setIsSending(false);
		}
	};

	const handleTestPriceAlert = () => {
		showMessage({
			message: 'Price Drop Alert!',
			description: 'MacBook Pro 14" dropped from $1,999 to $1,799 - 10% off!',
			type: 'success',
			duration: 5000,
		});
	};

	const handleTestError = () => {
		showMessage({
			message: 'Connection Error',
			description: 'Unable to connect to the server. Please check your internet connection.',
			type: 'danger',
			duration: 5000,
		});
	};

	return (
		<>
			<Text className="pb-2 pt-4 text-lg text-neutral-900 dark:text-white">Developer Tools</Text>
			<View className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
				<View className="border-b border-amber-200 p-3 dark:border-amber-800">
					<View className="flex-row items-center">
						<Bug color={colors.warning[600]} />
						<Text className="ml-2 font-medium text-amber-700 dark:text-amber-400">Debug Mode Enabled</Text>
					</View>
					<Text className="mt-1 text-xs text-amber-600 dark:text-amber-500">
						These tools are only visible to developer accounts
					</Text>
				</View>

				{/* Notification Testing */}
				<View className="p-4">
					<Text className="mb-3 font-semibold text-neutral-900 dark:text-white">Notification Testing</Text>

					<View className="gap-2">
						<Button
							label={isSending ? 'Sending...' : 'Test Info Notification'}
							variant="outline"
							onPress={handleTestNotification}
							disabled={isSending}
						/>
						<Button label="Test Price Alert" variant="secondary" onPress={handleTestPriceAlert} />
						<Button label="Test Error Notification" variant="destructive" onPress={handleTestError} />
					</View>
				</View>

				{/* Storage Actions */}
				<View className="border-t border-amber-200 p-4 dark:border-amber-800">
					<Text className="mb-3 font-semibold text-neutral-900 dark:text-white">Storage Actions</Text>
					<View className="gap-2">
						<Button label="Reset Onboarding" variant="outline" onPress={handleResetOnboarding} />
					</View>
				</View>

				{/* Additional Debug Info */}
				<View className="border-t border-amber-200 p-4 dark:border-amber-800">
					<Text className="mb-2 font-semibold text-neutral-900 dark:text-white">Environment Info</Text>
					<View className="gap-1">
						<Text className="text-sm text-neutral-600 dark:text-neutral-400">App: {Env.NAME}</Text>
						<Text className="text-sm text-neutral-600 dark:text-neutral-400">Version: {Env.VERSION}</Text>
						<Text className="text-sm text-neutral-600 dark:text-neutral-400">Bundle ID: {Env.BUNDLE_ID}</Text>
					</View>
				</View>
			</View>
		</>
	);
}
