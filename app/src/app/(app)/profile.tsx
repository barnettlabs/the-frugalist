import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';
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

export default function ProfileScreen() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

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
      <ScrollView className="flex-1">
        <View className="p-4">
        <ProfileForm
          profile={profile}
          onSubmit={handleUpdateProfile}
          isSubmitting={isUpdating}
        />

        <View className="mt-8 border-t border-neutral-200 pt-8 dark:border-neutral-700">
          <Text className="mb-4 text-lg font-semibold text-danger-600">
            Danger Zone
          </Text>
          <Button
            label={isDeleting ? 'Deleting...' : 'Delete Account'}
            variant="destructive"
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          />
        </View>
      </View>
      </ScrollView>
    </ScreenContainer>
  );
}
