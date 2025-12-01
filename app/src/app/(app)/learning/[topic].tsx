import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { TermCard } from '@/components/learning/term-card';
import { TipCard } from '@/components/learning/tip-card';
import { ScrollView, Text, View } from '@/components/ui';
import {
  FINANCE_TERMS,
  FINANCE_TIPS,
  LEASE_TERMS,
  LEASE_TIPS,
} from '@/lib/data/learning-content';

export default function LearningTopicScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();

  const isFinancing = topic === 'financing';
  const terms = isFinancing ? FINANCE_TERMS : LEASE_TERMS;
  const tips = isFinancing ? FINANCE_TIPS : LEASE_TIPS;
  const title = isFinancing ? 'Financing Terms' : 'Leasing Terms';

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
        <View className="p-4">
          {/* Introduction */}
          <View className="mb-6 rounded-xl bg-primary-50 p-4 dark:bg-primary-900/20">
            <Text className="text-lg font-semibold text-primary-700 dark:text-primary-300">
              {isFinancing
                ? 'Understanding Vehicle Financing'
                : 'Understanding Vehicle Leasing'}
            </Text>
            <Text className="mt-2 text-neutral-600 dark:text-neutral-400">
              {isFinancing
                ? 'Learn the key terms and concepts that will help you navigate the vehicle financing process with confidence.'
                : 'Master the terminology and concepts behind vehicle leasing to make informed decisions.'}
            </Text>
          </View>

          {/* Key Terms */}
          <Text className="mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Key Terms
          </Text>
          <View className="mb-6 gap-3">
            {terms.map((term, index) => (
              <TermCard
                key={index}
                term={term.term}
                definition={term.definition}
              />
            ))}
          </View>

          {/* Tips */}
          <Text className="mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Pro Tips
          </Text>
          <View className="gap-3 pb-6">
            {tips.map((tip, index) => (
              <TipCard key={index} tip={tip} />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
