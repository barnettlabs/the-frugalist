import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { useRegister } from '@/api/auth/use-auth';
import {
  Button,
  ControlledInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { mutate: register, isPending } = useRegister();

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    register(data, {
      onSuccess: () => {
        showMessage({
          message: 'Account Created',
          description: 'Please check your email to verify your account',
          type: 'success',
        });
        router.replace('/(auth)/verify-email');
      },
      onError: (error) => {
        showMessage({
          message: 'Registration Failed',
          description: error.message || 'Could not create account',
          type: 'danger',
        });
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="my-8">
          <Text className="text-3xl font-bold text-neutral-900 dark:text-white">
            Create Account
          </Text>
          <Text className="mt-2 text-neutral-600 dark:text-neutral-400">
            Sign up to get started with Sneaky Salesman
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <ControlledInput
                control={control}
                name="first_name"
                label="First Name"
                placeholder="John"
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <ControlledInput
                control={control}
                name="last_name"
                label="Last Name"
                placeholder="Doe"
                autoCapitalize="words"
              />
            </View>
          </View>

          <ControlledInput
            control={control}
            name="email"
            label="Email"
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <ControlledInput
            control={control}
            name="password"
            label="Password"
            placeholder="Min 8 characters"
            secureTextEntry
            autoComplete="new-password"
          />

          <ControlledInput
            control={control}
            name="password_confirmation"
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        {/* Submit Button */}
        <View className="mt-8">
          <Button
            label={isPending ? 'Creating Account...' : 'Create Account'}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          />
        </View>

        {/* Login Link */}
        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="font-semibold text-primary">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
