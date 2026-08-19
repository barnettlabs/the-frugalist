import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';

import { Text } from './text';

interface MastheadBarProps {
	/** Left slot text (defaults to app version label) */
	left?: React.ReactNode;
	/** Center tagline (defaults to "A field guide to what things should cost") */
	center?: string;
	/** Right slot — usually a count or a link */
	right?: React.ReactNode;
}

/**
 * Editorial masthead bar — three sections separated by hairline rules.
 * On narrow screens, the center tagline is hidden to prevent overlap.
 * On wider screens it floats centered between left + right slots.
 */
export function MastheadBar({
	left = 'v 1.0.0',
	center = 'A field guide to what things should cost',
	right,
}: MastheadBarProps) {
	const { width } = useWindowDimensions();
	// Below ~480pt the three slots can't all fit comfortably — drop the tagline.
	const showCenter = width >= 480;

	return (
		<View className="px-4 sm:px-6 lg:px-8">
			<View className="relative min-h-9 flex-row items-center justify-between border-y border-border-strong-light py-2 dark:border-border-strong-dark">
				{/* Left */}
				<View className="z-10 max-w-[40%]">
					{typeof left === 'string' ? (
						<Text
							numberOfLines={1}
							className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark"
						>
							{left}
						</Text>
					) : (
						left
					)}
				</View>

				{/* Center — only shown when there's room */}
				{showCenter && (
					<View className="absolute inset-x-0 items-center" pointerEvents="none">
						<Text
							numberOfLines={1}
							className="text-center text-[9px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark"
						>
							{center}
						</Text>
					</View>
				)}

				{/* Right */}
				<View className="z-10 max-w-[40%]">
					{typeof right === 'string' ? (
						<Text
							numberOfLines={1}
							className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark"
						>
							{right}
						</Text>
					) : (
						(right ?? null)
					)}
				</View>
			</View>
		</View>
	);
}
