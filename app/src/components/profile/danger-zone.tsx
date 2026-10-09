import React from 'react';
import { Pressable } from 'react-native';

import { Input, Text, View } from '@/components/ui';

type DangerZoneProps = {
	onDelete: (password: string) => void;
	isDeleting: boolean;
};

/**
 * Account deletion. The server requires the account password to delete it, and
 * Alert.prompt is iOS-only, so the password is entered here before confirming.
 */
export function DangerZone({ onDelete, isDeleting }: DangerZoneProps) {
	const [password, setPassword] = React.useState('');
	const disabled = isDeleting || password.length === 0;

	return (
		<View className="mt-10">
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-danger">Danger zone</Text>
			<View className="rounded-md border border-danger/30 bg-danger/5 p-4">
				<Text className="mb-2 font-display text-lg text-text-primary-light dark:text-text-primary-dark">
					Delete account
				</Text>
				<Text className="mb-4 text-xs leading-5 text-text-muted-light dark:text-text-muted-dark">
					Once you delete your account, there is no going back. All your data — finance estimates, lease calculations,
					and tracked products — will be permanently removed.
				</Text>
				<Input
					label="Password"
					placeholder="Enter your password to confirm"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					autoCapitalize="none"
					autoComplete="current-password"
				/>
				<Pressable
					onPress={() => onDelete(password)}
					disabled={disabled}
					className="items-center rounded-md bg-danger px-4 py-3 active:opacity-80"
					style={{ opacity: disabled ? 0.6 : 1 }}
				>
					<Text className="text-sm font-medium text-surface-light">
						{isDeleting ? 'Deleting…' : 'Delete my account'}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
