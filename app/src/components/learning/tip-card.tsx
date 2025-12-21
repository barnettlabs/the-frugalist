import React from 'react';

import { Text, View } from '@/components/ui';

interface TipCardProps {
  tip: string;
}

export function TipCard({ tip }: TipCardProps) {
  return (
    <View className="flex-row rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
      <Text className="mr-3 text-xl">💡</Text>
      <Text className="flex-1 leading-relaxed text-neutral-700 dark:text-neutral-300">{tip}</Text>
    </View>
  );
}
