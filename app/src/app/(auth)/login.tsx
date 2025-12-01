import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useLogin } from '@/api/auth/use-auth';
import { Button, ControlledInput, Pressable, SafeAreaView, ScrollView, Text, View } from '@/components/ui';

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
      onError: (error: any) => {
        console.error('Login error:', error.response?.data || error.message);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-8 mt-12">
          <Text className="font-rubik text-3xl font-bold text-neutral-900 dark:text-white">Welcome Back</Text>
          <Text className="mt-2 font-rubik text-neutral-600 dark:text-neutral-400">
            Sign in to continue to Sneaky Salesman
          </Text>
        </View>

        {/* Form Card - Glassmorphism style */}
        <View className="gap-4 rounded-xl border border-neutral-200/60 bg-white p-5 shadow-card dark:border-charcoal-700/60 dark:bg-charcoal-850/90">
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

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable className="self-end">
              <Text className="font-rubik text-sm font-medium text-primary-600 dark:text-primary-400">
                Forgot Password?
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Submit Button */}
        <View className="mt-6">
          <Button
            label={isPending ? 'Signing In...' : 'Sign In'}
            // onPress={handleSubmit(onSubmit)}
            onPress={() => onSubmit({ email: 'test@test.com', password: '123456' })}
            disabled={isPending}
            loading={isPending}
          />
        </View>

        {/* Register Link */}
        <View className="mt-6 flex-row items-center justify-center">
          <Text className="font-rubik text-neutral-600 dark:text-neutral-400">Don{"'"}t have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="font-rubik font-semibold text-primary-600 dark:text-primary-400">Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
