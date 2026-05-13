import { Env } from '@env';
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

const DEBUG_TAP_COUNT = 3;
const DEBUG_TAP_WINDOW_MS = 1500;

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { mutate: login, isPending } = useLogin();
  const insets = useSafeAreaInsets();
  const [showDebug, setShowDebug] = React.useState(false);
  const tapState = React.useRef<{ count: number; first: number }>({ count: 0, first: 0 });

  const handleLogoTap = React.useCallback(() => {
    const now = Date.now();
    const state = tapState.current;
    if (now - state.first > DEBUG_TAP_WINDOW_MS) {
      state.first = now;
      state.count = 1;
    } else {
      state.count += 1;
    }
    if (state.count >= DEBUG_TAP_COUNT) {
      state.count = 0;
      state.first = 0;
      setShowDebug((s) => !s);
    }
  }, []);

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
              <Pressable onPress={handleLogoTap} hitSlop={12}>
                <LogoImage variant="auto" className="!size-20" />
              </Pressable>
              <Text
                className="font-display italic mt-4 text-accent dark:text-accent-light"
                style={{ fontSize: 18 }}
              >
                Spend with intent.
              </Text>
            </View>

            {showDebug && (
              <View className="px-6 mt-6">
                <View className="rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-mono text-xs uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
                      Debug
                    </Text>
                    <Pressable onPress={() => setShowDebug(false)} hitSlop={8}>
                      <Text className="text-xs font-medium text-primary dark:text-text-primary-dark">Hide</Text>
                    </Pressable>
                  </View>
                  {[
                    ['env', Env.APP_ENV],
                    ['api', Env.API_URL],
                    ['version', Env.VERSION],
                    ['bundle', Env.BUNDLE_ID],
                    ['scheme', Env.SCHEME],
                  ].map(([k, v]) => (
                    <View key={k} className="flex-row py-0.5">
                      <Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark w-16">
                        {k}
                      </Text>
                      <Text className="font-mono text-xs text-text-primary-light dark:text-text-primary-dark flex-1">
                        {String(v ?? '—')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Floating paper card with stacked-paper depth */}
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
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
