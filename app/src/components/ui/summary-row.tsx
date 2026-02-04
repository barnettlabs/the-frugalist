import React from 'react';

import { Text, View } from '@/components/ui';

interface SummaryRowProps {
  label: string;
  value: string;
  isBold?: boolean;
  isNegative?: boolean;
  isHighlight?: boolean;
}

export function SummaryRow({
  label,
  value,
  isBold = false,
  isNegative = false,
  isHighlight = false,
}: SummaryRowProps) {
  return (
    <View className="flex-row justify-between">
      <Text
        className={`text-charcoal-600 dark:text-charcoal-400 ${
          isBold ? 'font-semibold' : ''
        }`}
      >
        {label}
      </Text>
      <Text
        className={`${isBold ? 'font-bold' : 'font-medium'} ${
          isNegative
            ? 'text-success-600 dark:text-success-400'
            : isHighlight
              ? 'text-accent dark:text-accent-light'
              : 'text-charcoal-900 dark:text-white'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
