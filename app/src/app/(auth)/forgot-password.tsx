import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { useForgotPassword } from '@/api/auth/use-auth';
import {
  Button,
  ControlledInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [emailSent, setEmailSent] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const { control, handleSubmit, getValues } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        setEmailSent(true);
      },
      onError: (error) => {
        showMessage({
          message: 'Error',
          description: error.message || 'Could not send reset email',
          type: 'danger',
        });
      },
    });
  };

  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
        <View className="flex-1 items-center justify-center p-6">
          <View className="mb-6 rounded-full bg-green-100 p-4 dark:bg-green-900">
            <Text className="text-4xl">✉️</Text>
          </View>
          <Text className="mb-2 text-center text-2xl font-bold text-neutral-900 dark:text-white">
            Check Your Email
          </Text>
          <Text className="mb-8 text-center text-neutral-600 dark:text-neutral-400">
            We{"'"}ve sent a password reset link to{'\n'}
            <Text className="font-semibold">{getValues('email')}</Text>
          </Text>
          <Button
            label="Back to Login"
            onPress={() => router.replace('/(auth)/login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Link href="/(auth)/login" asChild>
          <Pressable className="mb-4">
            <Text className="text-primary">← Back to Login</Text>
          </Pressable>
        </Link>

        {/* Header */}
        <View className="my-8">
          <Text className="text-3xl font-bold text-neutral-900 dark:text-white">
            Forgot Password
          </Text>
          <Text className="mt-2 text-neutral-600 dark:text-neutral-400">
            Enter your email address and we{"'"}ll send you a link to reset your
            password.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <ControlledInput
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Submit Button */}
        <View className="mt-8">
          <Button
            label={isPending ? 'Sending...' : 'Send Reset Link'}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
