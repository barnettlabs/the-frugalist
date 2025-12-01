import React, { useState } from 'react';

import { Pressable, Text, View } from '@/components/ui';

interface TermCardProps {
  term: string;
  definition: string;
}

export function TermCard({ term, definition }: TermCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setIsExpanded(!isExpanded)}
      className="rounded-xl border border-neutral-200/60 bg-white p-4 shadow-card dark:border-charcoal-700/60 dark:bg-charcoal-850/90"
    >
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 font-semibold text-neutral-900 dark:text-white">{term}</Text>
        <Text className="ml-2 text-primary-500 dark:text-primary-400">{isExpanded ? '▲' : '▼'}</Text>
      </View>

      {isExpanded && <Text className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400">{definition}</Text>}
    </Pressable>
  );
}
