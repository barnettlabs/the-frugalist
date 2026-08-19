import { Env } from '@env';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { useLogin } from '@/api/auth/use-auth';
import { ControlledInput, LogoImage, MastheadBar, ScreenContainer, Text, View } from '@/components/ui';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
	const { t } = useTranslation();
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
					bounces={false}
					contentContainerStyle={{
						flexGrow: 1,
						paddingTop: insets.top + 12,
						paddingBottom: insets.bottom + 32,
					}}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<MastheadBar left="v 1.0.0" center={t('auth.masthead_subtitle')} right={`Est. ${Env.ESTABLISHED_YEAR}`} />

					<View className="flex-1 justify-center py-8">
						<View className="items-center px-6">
							<LogoImage variant="auto" className="!size-20" />
							<Text className="mt-4 font-display italic text-accent dark:text-accent-light" style={{ fontSize: 18 }}>
								{t('auth.login_tagline')}
							</Text>
						</View>

						{/* Floating paper card with stacked-paper depth */}
						<View className="mt-8 px-6">
							<View className="relative">
								<View
									className="absolute rounded-md border border-border-light bg-tan dark:border-border-strong-dark dark:bg-border-dark"
									style={{ top: -10, bottom: -10, left: -10, right: -10, transform: [{ rotate: '-1.5deg' }] }}
								/>
								<View
									className="absolute rounded-md border border-border-light bg-surface-dark-light dark:border-border-dark dark:bg-surface-dark-dark"
									style={{ top: -5, bottom: -5, left: -5, right: -5, transform: [{ rotate: '1deg' }] }}
								/>

								<View className="relative rounded-md border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
									<View className="mb-5 items-center">
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
										className="mt-2 items-center rounded-md bg-primary px-5 py-3.5 active:opacity-80"
										style={{ opacity: isPending ? 0.6 : 1 }}
									>
										<Text className="text-sm font-medium text-surface-light">
											{isPending ? t('auth.signing_in') : t('auth.sign_in')}
										</Text>
									</Pressable>

									<View className="mt-6 items-center gap-3 border-t border-border-light pt-5 dark:border-border-dark">
										<Link href="/(auth)/forgot-password" asChild>
											<Pressable>
												<Text className="text-xs font-medium text-text-muted-light underline dark:text-text-muted-dark">
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
