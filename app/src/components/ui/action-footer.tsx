import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from './colors';
import { Text } from './text';

type Variant = 'default' | 'destructive';

interface ActionFooterProps {
	primaryLabel: string;
	onPrimary: () => void;
	isPrimaryDisabled?: boolean;
	primaryVariant?: Variant;

	onCancel?: () => void;
	cancelLabel?: string;

	/** Optional secondary destructive button (e.g. Delete on a Detail screen) */
	onSecondary?: () => void;
	secondaryLabel?: string;
	isSecondaryDisabled?: boolean;
	secondaryVariant?: Variant;
}

/**
 * Floating editorial action footer. Sits above the safe area with paper-cream
 * surface and a subtle shadow lift so it reads as a separate plane from the
 * scrolling page beneath.
 */
export function ActionFooter({
	primaryLabel,
	onPrimary,
	isPrimaryDisabled,
	primaryVariant = 'default',
	onCancel,
	cancelLabel = 'Cancel',
	onSecondary,
	secondaryLabel,
	isSecondaryDisabled,
	secondaryVariant = 'destructive',
}: ActionFooterProps) {
	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const cardBg = isDark ? colors.surface.dark : colors.surface.light;
	const borderColor = isDark ? colors.border.dark : colors.border.light;

	return (
		<View
			pointerEvents="box-none"
			style={{
				position: 'absolute',
				left: 12,
				right: 12,
				bottom: Math.max(insets.bottom, 12),
			}}
		>
			<View
				style={{
					backgroundColor: cardBg,
					borderColor,
					borderWidth: 1,
					borderRadius: 14,
					paddingHorizontal: 12,
					paddingVertical: 10,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: 0.12,
					shadowRadius: 18,
					elevation: 12,
				}}
				className="flex-row items-center gap-2"
			>
				{onSecondary && secondaryLabel ? (
					<FooterPill
						label={secondaryLabel}
						onPress={onSecondary}
						disabled={isSecondaryDisabled}
						variant={secondaryVariant}
						tone="ghost"
					/>
				) : null}
				{onCancel ? <FooterPill label={cancelLabel} onPress={onCancel} tone="ghost" /> : null}

				<View style={{ flex: 1 }} />

				<FooterPill
					label={primaryLabel}
					onPress={onPrimary}
					disabled={isPrimaryDisabled}
					variant={primaryVariant}
					tone="solid"
				/>
			</View>
		</View>
	);
}

interface FooterPillProps {
	label: string;
	onPress: () => void;
	disabled?: boolean;
	variant?: Variant;
	tone: 'solid' | 'ghost';
}

function FooterPill({ label, onPress, disabled, variant = 'default', tone }: FooterPillProps) {
	const isDestructive = variant === 'destructive';

	if (tone === 'solid') {
		const bg = isDestructive ? colors.danger.DEFAULT : colors.primary.DEFAULT;
		return (
			<Pressable
				onPress={onPress}
				disabled={disabled}
				style={{
					backgroundColor: bg,
					paddingHorizontal: 18,
					paddingVertical: 11,
					borderRadius: 10,
					opacity: disabled ? 0.5 : 1,
				}}
				className="active:opacity-80"
			>
				<Text className="text-sm font-semibold tracking-tight text-surface-light" style={{ letterSpacing: 0.2 }}>
					{label}
				</Text>
			</Pressable>
		);
	}

	// Ghost (text-style) — used for Cancel / Delete inline pills
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, opacity: disabled ? 0.5 : 1 }}
			className="active:opacity-60"
		>
			<Text
				className={`text-sm font-medium ${
					isDestructive ? 'text-danger' : 'text-text-muted-light dark:text-text-muted-dark'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}
