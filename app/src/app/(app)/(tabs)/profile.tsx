import { useColorScheme } from 'nativewind';
import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function ProfileScreen() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  // Account for floating tab bar
  const bottomPadding = Math.max(insets.bottom, 16) + 80;

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </ScreenContainer>
    );
  }

  if (isError || !profile) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="mb-4 text-center text-lg text-danger-600">
          Failed to load profile
        </Text>
        <Button label="Try Again" onPress={() => refetch()} />
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
          message: 'Profile Updated',
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
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            deleteAccount(undefined, {
              onSuccess: () => {
                showMessage({
                  message: 'Account Deleted',
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
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <View className="p-4">
          {/* Profile Header */}
          <ProfileHeader profile={profile} isDark={isDark} />

          {/* Profile Form */}
          <ProfileForm
            profile={profile}
            onSubmit={handleUpdateProfile}
            isSubmitting={isUpdating}
          />

          {/* Account Stats */}
          <AccountStats profile={profile} />

          {/* Danger Zone */}
          <DangerZone
            onDelete={handleDeleteAccount}
            isDeleting={isDeleting}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProfileHeader({
  profile,
  isDark,
}: {
  profile: User;
  isDark: boolean;
}) {
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();

  return (
    <View className="mb-6 items-center">
      {/* Avatar */}
      <View
        className={`size-24 items-center justify-center rounded-full ${
          isDark ? 'bg-primary-700' : 'bg-primary-100'
        }`}
      >
        <Text
          className={`text-3xl font-bold ${
            isDark ? 'text-primary-200' : 'text-primary-700'
          }`}
        >
          {initials}
        </Text>
      </View>

      {/* Name */}
      <Text className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
        {profile.first_name} {profile.last_name}
      </Text>

      {/* Email */}
      <Text className="mt-1 text-neutral-500 dark:text-neutral-400">
        {profile.email}
      </Text>

      {/* Member Since */}
      <Text className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
        Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })}
      </Text>
    </View>
  );
}

function AccountStats({ profile }: { profile: User }) {
  const memberDays = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View className="mt-6 rounded-xl bg-white p-4 dark:bg-neutral-800">
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        Account Info
      </Text>
      <View className="flex-row justify-around">
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary-600">
            {memberDays}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Days Active
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary-600">
            {profile.email_verified_at ? 'Yes' : 'No'}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Verified
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
    <View className="mt-8">
      <Text className="mb-3 text-lg font-semibold text-danger-600">
        Danger Zone
      </Text>
      <View className="rounded-xl border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-900/20">
        <Text className="mb-2 font-medium text-danger-700 dark:text-danger-400">
          Delete Account
        </Text>
        <Text className="mb-4 text-sm text-danger-600 dark:text-danger-500">
          Once you delete your account, there is no going back. All your data,
          including finance estimates, lease calculations, and tracked products
          will be permanently removed.
        </Text>
        <Button
          label={isDeleting ? 'Deleting...' : 'Delete My Account'}
          variant="destructive"
          onPress={onDelete}
          disabled={isDeleting}
        />
      </View>
    </View>
  );
}
