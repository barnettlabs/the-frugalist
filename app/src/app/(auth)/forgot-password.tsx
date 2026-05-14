import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
					message: 'Error',
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
					<MastheadBar left="v 1.0.0" center="A field guide to what things should cost" />
				</View>
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
						Check your inbox
					</Text>
					<Text
						className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark text-center"
						style={{ fontSize: 36, lineHeight: 38 }}
					>
						Sent.
					</Text>
					<Text
						className="font-display italic tracking-tight text-accent dark:text-accent-light text-center mt-1"
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
						className="rounded-md bg-primary px-5 py-3.5 mt-8 active:opacity-80"
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
						center="A field guide to what things should cost"
						right={
							<Link href="/(auth)/login" asChild>
								<Pressable>
									<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
										Sign in
									</Text>
								</Pressable>
							</Link>
						}
					/>

					<View className="px-6 pt-12">
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
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

						<View className="mt-8 rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6">
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
								className="rounded-md bg-primary px-5 py-3.5 items-center mt-2 active:opacity-80"
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
