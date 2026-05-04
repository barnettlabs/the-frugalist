import React from 'react';
import { ActivityIndicator, Alert, Pressable } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  useDeleteAccount,
  useProfile,
  useUpdateProfile,
} from '@/api/auth/use-profile';
import { ProfileForm } from '@/components/profile/profile-form';
import { Button, ScreenContainer, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { signOut } from '@/lib/auth';
import type { User } from '@/lib/types/models';

export function ProfileContent() {
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

  const handleUpdateProfile = (data: {
    first_name: string;
    last_name: string;
    email: string;
  }) => {
    updateProfile(data, {
      onSuccess: () => {
        showMessage({
          message: 'Profile updated',
          description: 'Your profile has been updated successfully',
          type: 'success',
        });
        refetch();
      },
      onError: (error) => {
        showMessage({
          message: 'Error',
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
                  message: 'Account deleted',
                  description: 'Your account has been deleted',
                  type: 'success',
                });
                signOut();
              },
              onError: (error) => {
                showMessage({
                  message: 'Error',
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View className="p-4">
          <ProfileHeader profile={profile} />
          <ProfileForm
            profile={profile}
            onSubmit={handleUpdateProfile}
            isSubmitting={isUpdating}
          />
          <AccountStats profile={profile} />
          <DangerZone
            onDelete={handleDeleteAccount}
            isDeleting={isDeleting}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProfileHeader({ profile }: { profile: User }) {
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();

  return (
    <View className="mb-6 items-center">
      <View className="size-20 items-center justify-center rounded-full border border-border-light dark:border-border-dark bg-tan-light dark:bg-charcoal-800">
        <Text
          className="font-display text-text-primary-light dark:text-text-primary-dark"
          style={{ fontSize: 26 }}
        >
          {initials}
        </Text>
      </View>

      <Text
        className="mt-4 font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
        style={{ fontSize: 26, lineHeight: 28 }}
      >
        {profile.first_name} {profile.last_name}
      </Text>

      <Text className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
        {profile.email}
      </Text>

      <Text className="mt-2 text-[10px] font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
        Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })}
      </Text>
    </View>
  );
}

function AccountStats({ profile }: { profile: User }) {
  const memberDays = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <View className="mt-6">
      <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
        Account info
      </Text>
      <View className="flex-row gap-px rounded-md overflow-hidden border border-border-light dark:border-border-dark">
        <View className="flex-1 bg-surface-light dark:bg-surface-dark p-4">
          <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-1.5">
            Days active
          </Text>
          <Text
            className="font-mono text-text-primary-light dark:text-text-primary-dark"
            style={{ fontSize: 24 }}
          >
            {memberDays}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: colors.border.light }} />
        <View className="flex-1 bg-surface-light dark:bg-surface-dark p-4">
          <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-1.5">
            Verified
          </Text>
          <Text
            className="font-mono"
            style={{
              fontSize: 24,
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

function DangerZone({
  onDelete,
  isDeleting,
}: {
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <View className="mt-10">
      <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-danger mb-3">
        Danger zone
      </Text>
      <View className="rounded-md border border-danger/30 bg-danger/5 p-4">
        <Text className="font-display text-lg text-text-primary-light dark:text-text-primary-dark mb-2">
          Delete account
        </Text>
        <Text className="text-xs text-text-muted-light dark:text-text-muted-dark mb-4 leading-5">
          Once you delete your account, there is no going back. All your data — finance
          estimates, lease calculations, and tracked products — will be permanently removed.
        </Text>
        <Pressable
          onPress={onDelete}
          disabled={isDeleting}
          className="rounded-md bg-danger px-4 py-3 items-center active:opacity-80"
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
