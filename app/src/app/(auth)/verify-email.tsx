import { router } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useResendVerificationEmail } from '@/api/auth/use-auth';
import { Button, SafeAreaView, Text, View } from '@/components/ui';

export default function VerifyEmailScreen() {
  const { mutate: resendEmail, isPending } = useResendVerificationEmail();

  const handleResend = () => {
    resendEmail(undefined, {
      onSuccess: () => {
        showMessage({
          message: 'Email Sent',
          description: 'Verification email has been resent',
          type: 'success',
        });
      },
      onError: (error) => {
        showMessage({
          message: 'Error',
          description: error.message || 'Could not resend email',
          type: 'danger',
        });
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="flex-1 items-center justify-center p-6">
        <View className="mb-6 rounded-full bg-primary-100 p-4 dark:bg-primary-900">
          <Text className="text-4xl">📧</Text>
        </View>

        <Text className="mb-2 text-center text-2xl font-bold text-neutral-900 dark:text-white">
          Verify Your Email
        </Text>

        <Text className="mb-8 text-center text-neutral-600 dark:text-neutral-400">
          We{"'"}ve sent a verification email to your inbox. Please click the
          link in the email to verify your account.
        </Text>

        <View className="w-full gap-4">
          <Button
            label={isPending ? 'Sending...' : 'Resend Verification Email'}
            onPress={handleResend}
            disabled={isPending}
          />

          <Button
            label="Back to Login"
            variant="outline"
            onPress={() => router.replace('/(auth)/login')}
          />
        </View>

        <Text className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already verified? Go back to login and sign in.
        </Text>
      </View>
    </SafeAreaView>
  );
}
