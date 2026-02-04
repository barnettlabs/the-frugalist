import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TermCard } from '@/components/learning/term-card';
import { TipCard } from '@/components/learning/tip-card';
import { ScrollView, Text, View } from '@/components/ui';
import type { Term } from '@/lib/data/learning-content';

export type LearningContentVariant = 'finance' | 'lease';

type LearningContentProps = {
  variant: LearningContentVariant;
  title: string;
  description: string;
  terms: Term[];
  tips: string[];
};

export function LearningContent({
  variant,
  title,
  description,
  terms,
  tips,
}: LearningContentProps) {
  const insets = useSafeAreaInsets();

  // Account for floating tab bar (64px height + 16px margin + safe area)
  const bottomPadding = Math.max(insets.bottom, 16) + 80;

  const colorClasses = variant === 'finance'
    ? {
        introBg: 'bg-accent/5 dark:bg-accent/10',
        introTitle: 'text-accent-dark dark:text-accent-light',
      }
    : {
        introBg: 'bg-info/5 dark:bg-info/10',
        introTitle: 'text-info-dark dark:text-info-light',
      };

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerStyle={{ paddingBottom: bottomPadding }}
    >
      <View className="p-4">
        {/* Introduction */}
        <View className={`mb-6 rounded-xl p-4 ${colorClasses.introBg}`}>
          <Text className={`text-lg font-semibold ${colorClasses.introTitle}`}>
            {title}
          </Text>
          <Text className="mt-2 text-neutral-600 dark:text-neutral-400">
            {description}
          </Text>
        </View>

        {/* Key Terms */}
        <Text className="mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Key Terms
        </Text>
        <View className="mb-6 gap-3">
          {terms.map((term, index) => (
            <TermCard key={index} term={term.term} definition={term.definition} />
          ))}
        </View>

        {/* Tips */}
        <Text className="mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Pro Tips
        </Text>
        <View className="gap-3">
          {tips.map((tip, index) => (
            <TipCard key={index} tip={tip} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
