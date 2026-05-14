import React, { useState } from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { tw } from '@/components/ui/theme';

interface TermCardProps {
	term: string;
	definition: string;
}

export function TermCard({ term, definition }: TermCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<Pressable onPress={() => setIsExpanded(!isExpanded)} className={`p-4 ${tw.cardElevated}`}>
			<View className="flex-row items-start justify-between">
				<Text className="flex-1 font-semibold text-neutral-900 dark:text-white">{term}</Text>
				<Text className="ml-2 text-primary dark:text-primary-light">{isExpanded ? '▲' : '▼'}</Text>
			</View>

			{isExpanded && <Text className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400">{definition}</Text>}
		</Pressable>
	);
}
