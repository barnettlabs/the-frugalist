import { Link } from 'expo-router';
import React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { tw } from '@/components/ui/theme';
import { formatCurrencyWithSymbol, LeaseCalculator } from '@/lib/calculators';
import type { VehicleLeaseSheet } from '@/lib/types/models';

interface LeaseCardProps {
  sheet: VehicleLeaseSheet;
}

export function LeaseCard({ sheet }: LeaseCardProps) {
  const calculator = new LeaseCalculator(sheet);
  const leasePayment = calculator.calculateLeasePayment();
  const cashDueAtSigning = calculator.calculateCashDueAtSigning();

  return (
    <Link href={`/compute/lease/${sheet.id}`} asChild>
      {/* Glassmorphism card with soft shadow and rounded corners */}
      <Pressable className={`p-4 ${tw.cardElevated}`}>
        {/* Header */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
              {sheet.sheet_name || 'Untitled Estimate'}
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {sheet.vehicle_year} {sheet.vehicle_make} {sheet.vehicle_model}
              {sheet.vehicle_trim ? ` ${sheet.vehicle_trim}` : ''}
            </Text>
          </View>
          {/* Status badge with secondary purple accent */}
          <View className="rounded-full bg-secondary/10 px-3 py-1 dark:bg-secondary/20">
            <Text className="text-xs font-bold uppercase tracking-wide text-secondary dark:text-secondary-light">
              Lease
            </Text>
          </View>
        </View>

        {/* Monthly Payment - subtle glass effect */}
        <View className="mb-3 rounded-lg bg-neutral-50 p-3 dark:bg-charcoal-800/60">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">Monthly Payment</Text>
          <Text className="text-2xl font-bold text-secondary dark:text-secondary-light">
            {formatCurrencyWithSymbol(leasePayment)}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {sheet.lease_term} months • {sheet.residual_percent}% residual
          </Text>
        </View>

        {/* Details row */}
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              MSRP
            </Text>
            <Text className="font-medium text-neutral-700 dark:text-neutral-300">
              {formatCurrencyWithSymbol(sheet.msrp)}
            </Text>
          </View>
          <View>
            <Text className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Down
            </Text>
            <Text className="font-medium text-neutral-700 dark:text-neutral-300">
              {formatCurrencyWithSymbol(sheet.down_payment)}
            </Text>
          </View>
          <View>
            <Text className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Due
            </Text>
            <Text className="font-medium text-neutral-700 dark:text-neutral-300">
              {formatCurrencyWithSymbol(cashDueAtSigning)}
            </Text>
          </View>
        </View>

        {/* Dealership Info */}
        {sheet.dealership_name && (
          <View className="mt-3 border-t border-neutral-100 pt-3 dark:border-charcoal-700">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {sheet.dealership_name}
              {sheet.sales_consultant && ` • ${sheet.sales_consultant}`}
            </Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}
