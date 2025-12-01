import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useLogin } from '@/api/auth/use-auth';
import { foxLogo } from '@/assets/images';
import { Button, ControlledInput, Image, Pressable, SafeAreaView, ScrollView, Text, View } from '@/components/ui';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { mutate: login, isPending } = useLogin();

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        router.replace('/(app)');
      },
      onError: (error: Error & { response?: { data?: unknown } }) => {
        console.error('Login error:', error.response?.data || error.message);
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
        {/* Logo */}
        <View className="my-6 items-center">
          <Image source={foxLogo} className="size-28" contentFit="contain" />
        </View>

        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-center text-3xl font-bold text-neutral-900 dark:text-white">
            Welcome to Sneaky Salesman
          </Text>
          <Text className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">Login</Text>
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

          <ControlledInput
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {/* Submit Button */}
        <View className="mt-8">
          <Button
            label={isPending ? 'Signing In...' : 'Sign In'}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            loading={isPending}
          />
        </View>

        {/* Register Link */}
        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-neutral-600 dark:text-neutral-400">Don{"'"}t have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="font-semibold text-primary-600">Sign Up</Text>
            </Pressable>
          </Link>
        </View>

        {/* Forgot Password Link */}
        <View className="mt-4 items-center">
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable>
              <Text className="text-sm font-medium text-primary-600 dark:text-primary-400">Forgot Password?</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
