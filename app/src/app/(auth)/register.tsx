import { Env } from '@env';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { useRegister } from '@/api/auth/use-auth';
import {
  ControlledInput,
  LogoImage,
  MastheadBar,
  ScreenContainer,
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
  const insets = useSafeAreaInsets();

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
          message: 'Account created',
          description: 'Please check your email to verify your account',
          type: 'success',
        });
        router.replace('/(auth)/verify-email');
      },
      onError: (error) => {
        showMessage({
          message: 'Registration failed',
          description: error.message || 'Could not create account',
          type: 'danger',
        });
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
          bounces={false}
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
            right={`Est. ${Env.ESTABLISHED_YEAR}`}
          />

          <View className="flex-1 justify-center py-8">
            <View className="px-6 items-center">
              <LogoImage variant="auto" className="!size-20" />
              <Text
                className="font-display italic mt-4 text-accent dark:text-accent-light"
                style={{ fontSize: 18 }}
              >
                Spend with intent.
              </Text>
            </View>

            <View className="px-6 mt-8">
              <View className="relative">
                <View
                  className="absolute rounded-md bg-tan dark:bg-border-dark border border-border-light dark:border-border-strong-dark"
                  style={{ top: -10, bottom: -10, left: -10, right: -10, transform: [{ rotate: '-1.5deg' }] }}
                />
                <View
                  className="absolute rounded-md bg-surface-dark-light dark:bg-surface-dark-dark border border-border-light dark:border-border-dark"
                  style={{ top: -5, bottom: -5, left: -5, right: -5, transform: [{ rotate: '1deg' }] }}
                />

                <View className="relative rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6">
              <View className="items-center mb-5">
                <Text
                  className="font-display text-text-primary-light dark:text-text-primary-dark"
                  style={{ fontSize: 22 }}
                >
                  Create account
                </Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <ControlledInput
                    control={control}
                    name="first_name"
                    label="First name"
                    placeholder="John"
                    autoCapitalize="words"
                  />
                </View>
                <View className="flex-1">
                  <ControlledInput
                    control={control}
                    name="last_name"
                    label="Last name"
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
                label="Confirm password"
                placeholder="Confirm your password"
                secureTextEntry
                autoComplete="new-password"
              />

              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
                className="rounded-md bg-primary px-5 py-3.5 items-center mt-2 active:opacity-80"
                style={{ opacity: isPending ? 0.6 : 1 }}
              >
                <Text className="text-sm font-medium text-surface-light">
                  {isPending ? 'Creating account…' : 'Create account'}
                </Text>
              </Pressable>

              <View className="mt-6 pt-5 border-t border-border-light dark:border-border-dark items-center">
                <View className="flex-row items-center">
                  <Text className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    Already have an account?{' '}
                  </Text>
                  <Link href="/(auth)/login" asChild>
                    <Pressable>
                      <Text className="text-sm font-medium text-primary dark:text-text-primary-dark">
                        Sign in
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
              </View>
            </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
