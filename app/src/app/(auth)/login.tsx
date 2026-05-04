import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { z } from 'zod';

import { useLogin } from '@/api/auth/use-auth';
import {
  ControlledInput,
  LogoImage,
  MastheadBar,
  ScreenContainer,
  Text,
  View,
} from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { mutate: login, isPending } = useLogin();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => router.replace('/(app)'),
      onError: (error: Error & { response?: { data?: unknown } }) => {
        console.error('Login error:', error.response?.data || error.message);
      },
    });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MastheadBar
            left="v 1.0.0"
            center="A field guide to what things should cost"
            right={
              <Link href="/" asChild>
                <Pressable>
                  <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
                    Back to home
                  </Text>
                </Pressable>
              </Link>
            }
          />

          <View className="px-6 mt-12 items-center">
            <LogoImage variant="auto" className="!size-20" />
            <Text
              className="font-display italic mt-4 text-accent dark:text-accent-light"
              style={{ fontSize: 18 }}
            >
              Spend with intent.
            </Text>
          </View>

          {/* Floating paper card with stacked-paper depth */}
          <View className="px-6 mt-8">
            <View className="relative">
              <View
                className="absolute rounded-md bg-tan border border-border-light"
                style={{ top: -10, bottom: -10, left: -10, right: -10, transform: [{ rotate: '-1.5deg' }] }}
              />
              <View
                className="absolute rounded-md bg-surface-dark-light border border-border-light"
                style={{ top: -5, bottom: -5, left: -5, right: -5, transform: [{ rotate: '1deg' }] }}
              />

              <View className="relative rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6">
                <View className="items-center mb-5">
                  <Text
                    className="font-display text-text-primary-light dark:text-text-primary-dark"
                    style={{ fontSize: 22 }}
                  >
                    Sign in
                  </Text>
                </View>

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

                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isPending}
                  className="rounded-md bg-primary px-5 py-3.5 items-center mt-2 active:opacity-80"
                  style={{ opacity: isPending ? 0.6 : 1 }}
                >
                  <Text className="text-sm font-medium text-surface-light">
                    {isPending ? 'Signing in…' : 'Sign in'}
                  </Text>
                </Pressable>

                <View className="mt-6 pt-5 border-t border-border-light dark:border-border-dark items-center gap-3">
                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable>
                      <Text className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark underline">
                        Forgot password?
                      </Text>
                    </Pressable>
                  </Link>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      Don’t have an account?{' '}
                    </Text>
                    <Link href="/(auth)/register" asChild>
                      <Pressable>
                        <Text className="text-sm font-medium text-primary dark:text-text-primary-dark">
                          Create account
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="items-center mt-10">
            <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light/60 dark:text-text-muted-dark/60">
              v. 1.0.0 · Established {new Date().getFullYear()}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
