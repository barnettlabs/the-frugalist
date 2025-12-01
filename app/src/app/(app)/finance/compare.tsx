import React from 'react';

import { Text, View } from '@/components/ui';

export default function FinanceCompareScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-100 p-6 dark:bg-neutral-900">
      <Text className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
        Compare Estimates
      </Text>
      <Text className="text-center text-neutral-500 dark:text-neutral-400">
        Select multiple estimates from the list to compare them side by side.
      </Text>
    </View>
  );
}
