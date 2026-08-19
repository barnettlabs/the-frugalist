import * as React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface FormSectionProps {
	/** Numbered label, e.g. "01" — rendered as monospace numeral */
	number?: string | number;
	/** Section title — Fraunces serif */
	title: string;
	/** Optional helper text below the title */
	helper?: string;
	/** Optional right-aligned status icon or chip */
	status?: React.ReactNode;
	/** Children render inside a padded content block below the header strip */
	children: React.ReactNode;
	/** Optional className passthrough */
	className?: string;
}

/**
 * Editorial section card — used for the multi-step finance/lease forms
 * and the watch tracker form. Header strip with numeral + serif title,
 * content area below with consistent padding.
 */
export function FormSection({ number, title, helper, status, children, className }: FormSectionProps) {
	const numberLabel = number !== undefined && number !== null ? `№ ${String(number).padStart(2, '0')}` : null;

	return (
		<View
			className={`mb-3 overflow-hidden rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark ${
				className ?? ''
			}`}
		>
			<View className="flex-row items-center gap-3 border-b border-border-light px-5 py-4 dark:border-border-dark">
				{numberLabel ? (
					<Text className="font-mono text-[11px] tracking-tight text-text-muted-light dark:text-text-muted-dark">
						{numberLabel}
					</Text>
				) : null}
				<Text className="font-display text-lg tracking-tight text-text-primary-light dark:text-text-primary-dark">
					{title}
				</Text>
				{status ? <View className="ml-auto">{status}</View> : null}
			</View>

			<View className="p-5">
				{children}
				{helper ? <Text className="mt-3 text-xs text-text-muted-light dark:text-text-muted-dark">{helper}</Text> : null}
			</View>
		</View>
	);
}
