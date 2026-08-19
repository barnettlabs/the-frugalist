import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Pressable } from 'react-native';
import { z } from 'zod';

import { ControlledInput, Text, View } from '@/components/ui';
import type { User } from '@/lib/types/models';

const profileSchema = z.object({
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
	profile: User;
	onSubmit: (data: ProfileFormData) => void;
	isSubmitting: boolean;
}

export function ProfileForm({ profile, onSubmit, isSubmitting }: ProfileFormProps) {
	const { control, handleSubmit } = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			first_name: profile.first_name,
			last_name: profile.last_name,
			email: profile.email,
		},
	});

	return (
		<View>
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				Personal information
			</Text>

			<View className="rounded-md border border-border-light bg-surface-light p-5 dark:border-border-dark dark:bg-surface-dark">
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
				/>

				<Pressable
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting}
					className="mt-2 items-center rounded-md bg-primary px-5 py-3.5 active:opacity-80"
					style={{ opacity: isSubmitting ? 0.6 : 1 }}
				>
					<Text className="text-sm font-medium text-surface-light">{isSubmitting ? 'Saving…' : 'Save changes'}</Text>
				</Pressable>
			</View>

			{/* Email Verification Status */}
			<View className="mt-5">
				<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
					Email verification
				</Text>
				{profile.email_verified_at ? (
					<View className="rounded-md border border-success/30 bg-success/5 px-4 py-3">
						<Text className="text-sm font-medium text-success">Your email has been verified.</Text>
					</View>
				) : (
					<View className="rounded-md border border-warning/30 bg-warning/5 px-4 py-3">
						<Text className="text-sm font-medium text-warning">Email not verified</Text>
						<Text className="mt-1 text-xs leading-5 text-text-muted-light dark:text-text-muted-dark">
							Check your inbox for the verification email. You may need to check spam.
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}
