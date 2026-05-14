import * as React from 'react';
import { View } from 'react-native';

import { Text } from './text';

type IconComponent = React.ComponentType<{ color?: string; size?: number; width?: number; height?: number }>;

interface SectionHeaderProps {
	/** Small caps eyebrow label, e.g. "Watch · Price ledger" */
	eyebrow?: string;
	/** Editorial serif title */
	title: string;
	/** Optional supporting description (right-side aside on web; below title on mobile) */
	description?: string;
	/** Optional icon for the inset chip */
	icon?: IconComponent;
	/** Optional running issue/index number */
	index?: string | number;
	/** Compact variant for sub-pages */
	variant?: 'editorial' | 'compact';
	/** Optional action node (button, link) rendered below the hairline divider */
	actions?: React.ReactNode;
	/** Optional aside content rendered below the description */
	aside?: React.ReactNode;
}

/**
 * Editorial section header — eyebrow + serif title + description + hairline + actions.
 * Mirrors the web SectionHeader component.
 */
export function SectionHeader({
	eyebrow,
	title,
	description,
	icon: Icon,
	index,
	variant = 'editorial',
	actions,
	aside,
}: SectionHeaderProps) {
	const isCompact = variant === 'compact';
	return (
		<View className={`px-4 sm:px-6 lg:px-8 ${isCompact ? 'pt-6 pb-6' : 'pt-8 pb-7'}`}>
			{/* Top row: eyebrow + chip + index */}
			<View className="flex-row items-center justify-between mb-5">
				<View className="flex-row items-center gap-3">
					{Icon ? (
						<View className="w-8 h-8 items-center justify-center rounded-md bg-primary dark:bg-text-primary-dark">
							<Icon color="#FCFAF5" width={16} height={16} />
						</View>
					) : null}
					<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
						{eyebrow ?? '·'}
					</Text>
				</View>
				{index !== undefined && index !== null ? (
					<Text className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark">
						№ {String(index).padStart(2, '0')}
					</Text>
				) : null}
			</View>

			{/* Title */}
			<Text
				className={`font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark ${
					isCompact ? 'text-3xl' : 'text-4xl'
				}`}
				style={{ lineHeight: isCompact ? 36 : 44 }}
			>
				{title}
			</Text>

			{/* Description */}
			{description ? (
				<View className="mt-4 border-l border-border-light dark:border-border-dark pl-4">
					<Text className="text-sm leading-5 text-text-muted-light dark:text-text-muted-dark">{description}</Text>
				</View>
			) : null}

			{/* Aside content */}
			{aside ? <View className="mt-4">{aside}</View> : null}

			{/* Hairline divider + actions */}
			{(actions || !isCompact) && (
				<View className="mt-6 flex-row items-center gap-4">
					<View className="flex-1 h-px bg-border-light dark:bg-border-dark" />
					{actions ? <View className="flex-row items-center gap-2">{actions}</View> : null}
				</View>
			)}
		</View>
	);
}
