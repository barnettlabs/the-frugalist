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
		<View className={`px-4 sm:px-6 lg:px-8 ${isCompact ? 'py-6' : 'pb-7 pt-8'}`}>
			{/* Top row: eyebrow + chip + index */}
			<View className="mb-5 flex-row items-center justify-between">
				<View className="flex-row items-center gap-3">
					{Icon ? (
						<View className="size-8 items-center justify-center rounded-md bg-primary dark:bg-text-primary-dark">
							<Icon color="#FCFAF5" width={16} height={16} />
						</View>
					) : null}
					<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						{eyebrow ?? '·'}
					</Text>
				</View>
				{index !== undefined && index !== null ? (
					<Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
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
				<View className="mt-4 border-l border-border-light pl-4 dark:border-border-dark">
					<Text className="text-sm leading-5 text-text-muted-light dark:text-text-muted-dark">{description}</Text>
				</View>
			) : null}

			{/* Aside content */}
			{aside ? <View className="mt-4">{aside}</View> : null}

			{/* Hairline divider + actions */}
			{(actions || !isCompact) && (
				<View className="mt-6 flex-row items-center gap-4">
					<View className="h-px flex-1 bg-border-light dark:bg-border-dark" />
					{actions ? <View className="flex-row items-center gap-2">{actions}</View> : null}
				</View>
			)}
		</View>
	);
}
