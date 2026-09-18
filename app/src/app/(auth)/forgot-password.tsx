import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { useForgotPassword } from '@/api/auth/use-auth';
import { ControlledInput, MastheadBar, ScreenContainer, Text, View } from '@/components/ui';

const forgotPasswordSchema = z.object({
	email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
	const { t } = useTranslation();
	const [emailSent, setEmailSent] = useState(false);
	const { mutate: forgotPassword, isPending } = useForgotPassword();
	const insets = useSafeAreaInsets();

	const { control, handleSubmit, getValues } = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = (data: ForgotPasswordFormData) => {
		forgotPassword(data, {
			onSuccess: () => setEmailSent(true),
			onError: error => {
				showMessage({
					message: t('common.error'),
					description: error.message || 'Could not send reset email',
					type: 'danger',
				});
			},
		});
	};

	if (emailSent) {
		return (
			<ScreenContainer>
				<View style={{ paddingTop: insets.top + 12 }}>
					<MastheadBar left="v 1.0.0" center={t('auth.masthead_subtitle')} />
				</View>
				<View className="flex-1 items-center justify-center px-6">
					<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Check your inbox
					</Text>
					<Text
						className="text-center font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
						style={{ fontSize: 36, lineHeight: 38 }}
					>
						Sent.
					</Text>
					<Text
						className="mt-1 text-center font-display italic tracking-tight text-accent dark:text-accent-light"
						style={{ fontSize: 22, lineHeight: 24 }}
					>
						Check your email.
					</Text>
					<Text className="mt-5 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
						We sent a password reset link to{'\n'}
						<Text className="font-mono text-text-primary-light dark:text-text-primary-dark">{getValues('email')}</Text>
					</Text>
					<Pressable
						onPress={() => router.replace('/(auth)/login')}
						className="mt-8 rounded-md bg-primary px-5 py-3.5 active:opacity-80"
					>
						<Text className="text-sm font-medium text-surface-light">Back to sign in</Text>
					</Pressable>
				</View>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
				<ScrollView
					className="flex-1"
					contentContainerStyle={{
						flexGrow: 1,
						paddingTop: insets.top + 12,
						paddingBottom: insets.bottom + 32,
					}}
					keyboardShouldPersistTaps="handled"
				>
					<MastheadBar
						left="v 1.0.0"
						center={t('auth.masthead_subtitle')}
						right={
							<Link href="/(auth)/login" asChild>
								<Pressable>
									<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
										Sign in
									</Text>
								</Pressable>
							</Link>
						}
					/>

					<View className="px-6 pt-12">
						<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
							Forgot password
						</Text>
						<Text
							className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
							style={{ fontSize: 38, lineHeight: 40 }}
						>
							Reset and
						</Text>
						<Text
							className="font-display italic tracking-tightest text-accent dark:text-accent-light"
							style={{ fontSize: 38, lineHeight: 40 }}
						>
							recover.
						</Text>
						<Text className="mt-4 text-sm text-text-muted-light dark:text-text-muted-dark">
							Drop in your email. We’ll send a reset link.
						</Text>

						<View className="mt-8 rounded-md border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
							<ControlledInput
								control={control}
								name="email"
								label="Email"
								placeholder="Enter your email"
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
							/>
							<Pressable
								onPress={handleSubmit(onSubmit)}
								disabled={isPending}
								className="mt-2 items-center rounded-md bg-primary px-5 py-3.5 active:opacity-80"
								style={{ opacity: isPending ? 0.6 : 1 }}
							>
								<Text className="text-sm font-medium text-surface-light">
									{isPending ? 'Sending…' : 'Send reset link'}
								</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ScreenContainer>
	);
}
