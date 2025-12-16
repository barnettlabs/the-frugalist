import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TermCard } from '@/components/learning/term-card';
import { TipCard } from '@/components/learning/tip-card';
import { ScrollView, Text, View } from '@/components/ui';
import { LEASE_TERMS, LEASE_TIPS } from '@/lib/data/learning-content';

export default function LeasingTermsScreen() {
  const insets = useSafeAreaInsets();

  // Account for floating tab bar (64px height + 16px margin + safe area)
  const bottomPadding = Math.max(insets.bottom, 16) + 80;

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerStyle={{ paddingBottom: bottomPadding }}
    >
      <View className="p-4">
        {/* Introduction */}
        <View className="mb-6 rounded-xl bg-secondary-50 p-4 dark:bg-secondary-900/20">
          <Text className="text-lg font-semibold text-secondary-700 dark:text-secondary-300">
            Understanding Vehicle Leasing
          </Text>
          <Text className="mt-2 text-neutral-600 dark:text-neutral-400">
            Master the terminology and concepts behind vehicle leasing to make informed decisions.
          </Text>
        </View>

        {/* Key Terms */}
        <Text className="mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Key Terms
        </Text>
        <View className="mb-6 gap-3">
          {LEASE_TERMS.map((term, index) => (
            <TermCard key={index} term={term.term} definition={term.definition} />
          ))}
        </View>

        {/* Tips */}
        <Text className="mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Pro Tips
        </Text>
        <View className="gap-3">
          {LEASE_TIPS.map((tip, index) => (
            <TipCard key={index} tip={tip} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
