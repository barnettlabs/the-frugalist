import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResendVerificationEmail } from '@/api/auth/use-auth';
import { MastheadBar, ScreenContainer, Text, View } from '@/components/ui';

export default function VerifyEmailScreen() {
	const { t } = useTranslation();
	const { mutate: resendEmail, isPending } = useResendVerificationEmail();
	const insets = useSafeAreaInsets();

	const handleResend = () => {
		resendEmail(undefined, {
			onSuccess: () => {
				showMessage({
					message: t('auth.email_sent'),
					description: t('auth.email_sent_description'),
					type: 'success',
				});
			},
			onError: error => {
				showMessage({
					message: t('common.error'),
					description: error.message || 'Could not resend email',
					type: 'danger',
				});
			},
		});
	};

	return (
		<ScreenContainer>
			<View style={{ paddingTop: insets.top + 12 }}>
				<MastheadBar left="v 1.0.0" center={t('auth.masthead_subtitle')} />
			</View>

			<View className="flex-1 items-center justify-center px-6">
				<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
					Almost there
				</Text>
				<Text
					className="text-center font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
					style={{ fontSize: 38, lineHeight: 40 }}
				>
					Verify your
				</Text>
				<Text
					className="text-center font-display italic tracking-tightest text-accent dark:text-accent-light"
					style={{ fontSize: 38, lineHeight: 40 }}
				>
					email.
				</Text>

				<Text className="mt-5 max-w-xs text-center text-sm text-text-muted-light dark:text-text-muted-dark">
					We sent a verification email to your inbox. Click the link to verify your account.
				</Text>

				<View className="mt-10 w-full max-w-xs gap-3">
					<Pressable
						onPress={handleResend}
						disabled={isPending}
						className="items-center rounded-md bg-primary px-5 py-3.5 active:opacity-80"
						style={{ opacity: isPending ? 0.6 : 1 }}
					>
						<Text className="text-sm font-medium text-surface-light">
							{isPending ? 'Sending…' : 'Resend verification email'}
						</Text>
					</Pressable>
					<Pressable
						onPress={() => router.replace('/(auth)/login')}
						className="items-center rounded-md border border-primary px-5 py-3.5 active:opacity-70"
					>
						<Text className="text-sm font-medium text-primary dark:text-text-primary-dark">Back to sign in</Text>
					</Pressable>
				</View>

				<Text className="mt-10 text-xs text-text-muted-light dark:text-text-muted-dark">
					Already verified? Sign in.
				</Text>
			</View>
		</ScreenContainer>
	);
}
