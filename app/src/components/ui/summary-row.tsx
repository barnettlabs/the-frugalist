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
            ? 'text-secondary dark:text-secondary-light'
            : isHighlight
              ? 'text-primary dark:text-primary-light'
              : 'text-charcoal-900 dark:text-white'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
