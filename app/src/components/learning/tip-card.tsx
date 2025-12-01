import React from 'react';

import { Text, View } from '@/components/ui';

interface TipCardProps {
  tip: string;
}

export function TipCard({ tip }: TipCardProps) {
  return (
    <View className="flex-row rounded-xl border border-primary-200/60 bg-primary-50 p-4 dark:border-primary-800/60 dark:bg-primary-900/20">
      <Text className="mr-3 text-xl">💡</Text>
      <Text className="flex-1 font-rubik leading-relaxed text-neutral-700 dark:text-neutral-300">
        {tip}
      </Text>
    </View>
  );
}
