import { Link } from 'expo-router';
import React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { FinanceCalculator, formatCurrencyWithSymbol } from '@/lib/calculators';
import type { VehicleFinanceSheet } from '@/lib/types/models';

interface FinanceCardProps {
  sheet: VehicleFinanceSheet;
}

export function FinanceCard({ sheet }: FinanceCardProps) {
  const calculator = new FinanceCalculator(sheet);
  const monthlyPayment = calculator.calculateMonthlyPayment();

  return (
    <Link href={`/compute/finance/${sheet.id}?from=finance`} asChild>
      <Pressable className="rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark overflow-hidden active:opacity-90">
        {/* Header strip */}
        <View className="px-4 py-2.5 border-b border-border-light dark:border-border-dark flex-row items-center">
          <Text className="flex-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark" numberOfLines={1}>
            {sheet.dealership_name || 'No dealership'}
          </Text>
          <Text className="text-[10px] font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
            {sheet.vehicle_type}
          </Text>
        </View>

        {/* Body */}
        <View className="p-4">
          <Text className="text-xs text-text-muted-light dark:text-text-muted-dark mb-1">
            {sheet.sheet_name || 'Untitled estimate'}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="font-mono text-text-muted-light dark:text-text-muted-dark mr-2"
              style={{ fontSize: 14 }}
            >
              {sheet.vehicle_year}
            </Text>
            <Text
              className="font-display tracking-tight text-text-primary-light dark:text-text-primary-dark flex-1"
              style={{ fontSize: 22, lineHeight: 24 }}
              numberOfLines={1}
            >
              {sheet.vehicle_make}{' '}
              <Text
                className="italic text-text-muted-light dark:text-text-muted-dark"
                style={{ fontSize: 22 }}
              >
                {sheet.vehicle_model}
              </Text>
            </Text>
          </View>

          {/* Monthly hero figure */}
          <View className="flex-row items-baseline justify-between mt-5">
            <View>
              <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-1.5">
                Monthly
              </Text>
              <Text
                className="font-mono tracking-tight text-text-primary-light dark:text-text-primary-dark"
                style={{ fontSize: 30, lineHeight: 32 }}
              >
                {formatCurrencyWithSymbol(monthlyPayment)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
                {sheet.finance_term} mo
              </Text>
              <Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
                @ {sheet.interest_rate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="px-4 py-3 border-t border-border-light dark:border-border-dark flex-row justify-between">
          <Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
            {formatCurrencyWithSymbol(calculator.calculateLoanAmount())} financed
          </Text>
          <Text className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
            Open ↗
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
