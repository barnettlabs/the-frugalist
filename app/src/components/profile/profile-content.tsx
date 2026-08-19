import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { useDeleteAccount, useProfile, useUpdateProfile } from '@/api/auth/use-profile';
import { ProfileForm } from '@/components/profile/profile-form';
import { Button, ScreenContainer, TabPageHeader, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { TabAwareScrollView } from '@/components/ui/scroll-aware';
import { signOut } from '@/lib/auth';
import type { User } from '@/lib/types/models';

export function ProfileContent({
	backLabel = 'Account',
	tabAware = true,
}: { backLabel?: string; tabAware?: boolean } = {}) {
	const { t } = useTranslation();
	const { data: profile, isLoading, isError, refetch } = useProfile();
	const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
	const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

	if (isLoading) {
		return (
			<ScreenContainer className="items-center justify-center">
				<ActivityIndicator size="large" color={colors.primary.DEFAULT} />
			</ScreenContainer>
		);
	}

	if (isError || !profile) {
		return (
			<ScreenContainer className="items-center justify-center p-6">
				<Text className="mb-4 text-center font-display text-2xl text-text-primary-light dark:text-text-primary-dark">
					Couldn’t load profile
				</Text>
				<Button label="Try again" onPress={() => refetch()} />
			</ScreenContainer>
		);
	}

	const handleUpdateProfile = (data: { first_name: string; last_name: string; email: string }) => {
		updateProfile(data, {
			onSuccess: () => {
				showMessage({
					message: t('profile_toast.updated'),
					description: t('profile_toast.updated_description'),
					type: 'success',
				});
				refetch();
			},
			onError: error => {
				showMessage({
					message: t('common.error'),
					description: error.message || 'Failed to update profile',
					type: 'danger',
				});
			},
		});
	};

	const handleDeleteAccount = () => {
		Alert.alert(
			'Delete account',
			'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete account',
					style: 'destructive',
					onPress: () => {
						deleteAccount(undefined, {
							onSuccess: () => {
								showMessage({
									message: t('profile_toast.deleted'),
									description: t('profile_toast.deleted_description'),
									type: 'success',
								});
								signOut();
							},
							onError: error => {
								showMessage({
									message: t('common.error'),
									description: error.message || 'Failed to delete account',
									type: 'danger',
								});
							},
						});
					},
				},
			]
		);
	};

	return (
		<ScreenContainer>
			<TabPageHeader title="Profile" showBack backLabel={backLabel} />
			<TabAwareScrollView className="flex-1" tabAware={tabAware}>
				<View className="p-4">
					<ProfileHeader profile={profile} />
					<ProfileForm profile={profile} onSubmit={handleUpdateProfile} isSubmitting={isUpdating} />
					<AccountStats profile={profile} />
					<DangerZone onDelete={handleDeleteAccount} isDeleting={isDeleting} />
				</View>
			</TabAwareScrollView>
		</ScreenContainer>
	);
}

function ProfileHeader({ profile }: { profile: User }) {
	const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();

	return (
		<View className="mb-6 items-center">
			<View className="size-20 items-center justify-center rounded-full border border-border-light bg-tan-light dark:border-border-dark dark:bg-charcoal-800">
				<Text
					className="font-display text-text-primary-light dark:text-text-primary-dark"
					style={{ fontSize: 26, lineHeight: 32, includeFontPadding: false }}
				>
					{initials}
				</Text>
			</View>

			<Text
				className="mt-4 font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
				style={{ fontSize: 26, lineHeight: 32, includeFontPadding: false }}
			>
				{profile.first_name} {profile.last_name}
			</Text>

			<Text className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">{profile.email}</Text>

			<Text className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
				Member since{' '}
				{new Date(profile.created_at).toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric',
				})}
			</Text>
		</View>
	);
}

function AccountStats({ profile }: { profile: User }) {
	const memberDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));

	return (
		<View className="mt-6">
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				Account info
			</Text>
			<View className="flex-row gap-px overflow-hidden rounded-md border border-border-light dark:border-border-dark">
				<View className="flex-1 bg-surface-light p-4 dark:bg-surface-dark">
					<Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Days active
					</Text>
					<Text
						className="font-mono text-text-primary-light dark:text-text-primary-dark"
						style={{ fontSize: 24, lineHeight: 30, includeFontPadding: false }}
					>
						{memberDays}
					</Text>
				</View>
				<View style={{ width: 1, backgroundColor: colors.border.light }} />
				<View className="flex-1 bg-surface-light p-4 dark:bg-surface-dark">
					<Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Verified
					</Text>
					<Text
						className="font-mono"
						style={{
							fontSize: 24,
							lineHeight: 30,
							includeFontPadding: false,
							color: profile.email_verified_at ? colors.success.DEFAULT : colors.text.muted.light,
						}}
					>
						{profile.email_verified_at ? 'Yes' : 'No'}
					</Text>
				</View>
			</View>
		</View>
	);
}

function DangerZone({ onDelete, isDeleting }: { onDelete: () => void; isDeleting: boolean }) {
	return (
		<View className="mt-10">
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-danger">Danger zone</Text>
			<View className="rounded-md border border-danger/30 bg-danger/5 p-4">
				<Text className="mb-2 font-display text-lg text-text-primary-light dark:text-text-primary-dark">
					Delete account
				</Text>
				<Text className="mb-4 text-xs leading-5 text-text-muted-light dark:text-text-muted-dark">
					Once you delete your account, there is no going back. All your data — finance estimates, lease calculations,
					and tracked products — will be permanently removed.
				</Text>
				<Pressable
					onPress={onDelete}
					disabled={isDeleting}
					className="items-center rounded-md bg-danger px-4 py-3 active:opacity-80"
					style={{ opacity: isDeleting ? 0.6 : 1 }}
				>
					<Text className="text-sm font-medium text-surface-light">
						{isDeleting ? 'Deleting…' : 'Delete my account'}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
