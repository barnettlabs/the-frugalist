import React, { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { useLeaseSheets } from '@/api/lease/use-lease-sheets';
import {
  Checkbox,
  Pressable,
  ScreenContainer,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import { tw } from '@/components/ui/theme';
import { formatCurrencyWithSymbol, LeaseCalculator } from '@/lib/calculators';
import type { VehicleLeaseSheet } from '@/lib/types/models';

const MAX_COMPARE = 3;

type Row = {
  label: string;
  get: (sheet: VehicleLeaseSheet, calc: LeaseCalculator) => string;
};

const rows: Row[] = [
  {
    label: 'Vehicle',
    get: (s) =>
      [s.vehicle_year, s.vehicle_make, s.vehicle_model, s.vehicle_trim]
        .filter(Boolean)
        .join(' ') || '—',
  },
  {
    label: 'Monthly Payment',
    get: (_, c) => formatCurrencyWithSymbol(c.calculateLeasePayment()),
  },
  { label: 'Term', get: (s) => `${s.lease_term} mo` },
  { label: 'Money Factor', get: (s) => String(s.money_factor) },
  { label: 'Residual %', get: (s) => `${s.residual_percent}%` },
  { label: 'MSRP', get: (s) => formatCurrencyWithSymbol(s.msrp) },
  {
    label: 'Down Payment',
    get: (s) => formatCurrencyWithSymbol(s.down_payment),
  },
  {
    label: 'Cash Due at Signing',
    get: (_, c) => formatCurrencyWithSymbol(c.calculateCashDueAtSigning()),
  },
  {
    label: 'Total Lease Cost',
    get: (_, c) => formatCurrencyWithSymbol(c.calculateTotalLeaseCost()),
  },
];

export default function LeaseCompareScreen() {
  const { data, isLoading, isError } = useLeaseSheets();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const sheets = data ?? [];

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const selectedSheets = useMemo(
    () =>
      selectedIds
        .map((id) => sheets.find((s) => s.id === id))
        .filter(Boolean) as VehicleLeaseSheet[],
    [selectedIds, sheets]
  );

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.info.DEFAULT} />
      </ScreenContainer>
    );
  }

  if (isError || sheets.length < 2) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          Not enough estimates
        </Text>
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Create at least two lease estimates to compare them.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Text className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
          Compare Estimates
        </Text>
        <Text className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Select up to {MAX_COMPARE} estimates to compare side by side.
        </Text>

        <View className={`mb-4 gap-2 p-4 ${tw.card}`}>
          {sheets.map((sheet) => {
            const checked = selectedIds.includes(sheet.id);
            const disabled = !checked && selectedIds.length >= MAX_COMPARE;
            return (
              <Pressable
                key={sheet.id}
                onPress={() => !disabled && toggle(sheet.id)}
                className={`flex-row items-center py-2 ${disabled ? 'opacity-40' : ''}`}
              >
                <Checkbox.Icon checked={checked} />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-neutral-900 dark:text-white">
                    {sheet.sheet_name || 'Untitled'}
                  </Text>
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                    {sheet.vehicle_year} {sheet.vehicle_make} {sheet.vehicle_model}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-accent dark:text-accent-light">
                  {formatCurrencyWithSymbol(
                    new LeaseCalculator(sheet).calculateLeasePayment()
                  )}
                  /mo
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedSheets.length < 2 ? (
          <Text className="text-center text-neutral-500 dark:text-neutral-400">
            Select 2 or more estimates above.
          </Text>
        ) : (
          <ComparisonTable sheets={selectedSheets} />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function ComparisonTable({ sheets }: { sheets: VehicleLeaseSheet[] }) {
  const calcs = sheets.map((s) => new LeaseCalculator(s));
  const monthlyPayments = calcs.map((c) => c.calculateLeasePayment());
  const bestIdx = monthlyPayments.indexOf(Math.min(...monthlyPayments));

  return (
    <View className={`overflow-hidden p-0 ${tw.card}`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row border-b border-neutral-200 bg-neutral-50 dark:border-charcoal-700 dark:bg-charcoal-800/60">
            <HeaderCell label="" width={140} />
            {sheets.map((s, i) => (
              <HeaderCell
                key={s.id}
                label={s.sheet_name || 'Untitled'}
                width={140}
                highlight={i === bestIdx}
              />
            ))}
          </View>
          {rows.map((row, ri) => (
            <View
              key={row.label}
              className={`flex-row ${
                ri % 2 === 0 ? '' : 'bg-neutral-50/60 dark:bg-charcoal-800/30'
              }`}
            >
              <LabelCell label={row.label} width={140} />
              {sheets.map((s, i) => (
                <ValueCell
                  key={s.id}
                  value={row.get(s, calcs[i])}
                  width={140}
                  highlight={row.label === 'Monthly Payment' && i === bestIdx}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="border-t border-neutral-200 bg-success/10 p-3 dark:border-charcoal-700 dark:bg-success/20">
        <Text className="text-xs font-semibold text-success-700 dark:text-success-light">
          Lowest monthly payment: {sheets[bestIdx].sheet_name || 'Untitled'} at{' '}
          {formatCurrencyWithSymbol(monthlyPayments[bestIdx])}/mo
        </Text>
      </View>
    </View>
  );
}

function HeaderCell({
  label,
  width,
  highlight,
}: {
  label: string;
  width: number;
  highlight?: boolean;
}) {
  return (
    <View
      style={{ width }}
      className={`border-r border-neutral-200 p-3 dark:border-charcoal-700 ${
        highlight ? 'bg-success/10 dark:bg-success/20' : ''
      }`}
    >
      <Text
        className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300"
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

function LabelCell({ label, width }: { label: string; width: number }) {
  return (
    <View
      style={{ width }}
      className="border-r border-neutral-200 p-3 dark:border-charcoal-700"
    >
      <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
    </View>
  );
}

function ValueCell({
  value,
  width,
  highlight,
}: {
  value: string;
  width: number;
  highlight?: boolean;
}) {
  return (
    <View
      style={{ width }}
      className={`border-r border-neutral-200 p-3 dark:border-charcoal-700 ${
        highlight ? 'bg-success/10 dark:bg-success/20' : ''
      }`}
    >
      <Text
        className={`text-sm ${
          highlight
            ? 'font-bold text-success-700 dark:text-success-light'
            : 'text-neutral-900 dark:text-neutral-200'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
