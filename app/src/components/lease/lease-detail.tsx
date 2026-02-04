import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Book } from '@/components/ui/icons';
import { SummaryRow } from '@/components/ui/summary-row';
import { tw } from '@/components/ui/theme';
import { formatCurrencyWithSymbol, formatPercentage, LeaseCalculator } from '@/lib/calculators';
import type { VehicleLeaseSheet } from '@/lib/types/models';

interface LeaseDetailProps {
  sheet: VehicleLeaseSheet;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function LeaseDetail({ sheet, onEdit, onDelete, isDeleting }: LeaseDetailProps) {
  const insets = useSafeAreaInsets();
  const summary = useMemo(() => new LeaseCalculator(sheet).getSummary(), [sheet]);

  // Account for floating tab bar (64px height + 16px margin + safe area)
  const bottomPadding = Math.max(insets.bottom, 16) + 80;

  return (
    <View className={`flex-1 ${tw.pageBg}`}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <PaymentHeader payment={summary.leasePayment} term={sheet.lease_term} residual={sheet.residual_percent} />
        <TermsLink />
        <VehicleInfoCard sheet={sheet} />
        <PaymentBreakdownCard summary={summary} />
        <FinancialSummaryCard summary={summary} sheet={sheet} />
        <LeaseDetailsCard sheet={sheet} summary={summary} />
        <ContactInfoCard sheet={sheet} />
        {sheet.notes && <NotesCard notes={sheet.notes} />}
        <View className="h-20" />
      </ScrollView>
      <ActionBar onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} bottomPadding={bottomPadding} />
    </View>
  );
}

function PaymentHeader({ payment, term, residual }: { payment: number; term: number; residual: number }) {
  return (
    <View className="mb-4 rounded-xl bg-secondary p-4">
      <Text className="text-white opacity-80">Monthly Payment</Text>
      <Text className="text-4xl font-bold text-white">{formatCurrencyWithSymbol(payment)}</Text>
      <Text className="text-white opacity-70">
        for {term} months • {residual}% residual
      </Text>
    </View>
  );
}

function VehicleInfoCard({ sheet }: { sheet: VehicleLeaseSheet }) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        {sheet.sheet_name || 'Untitled Estimate'}
      </Text>
      <Text className="text-neutral-600 dark:text-neutral-400">
        {sheet.vehicle_year} {sheet.vehicle_make} {sheet.vehicle_model}
        {sheet.vehicle_trim ? ` ${sheet.vehicle_trim}` : ''}
      </Text>
      <View className="mt-2 flex-row gap-2">
        <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-charcoal-700">
          <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{sheet.vehicle_type}</Text>
        </View>
        <View className="rounded-full bg-secondary/10 px-3 py-1 dark:bg-secondary/20">
          <Text className="text-xs font-medium text-secondary dark:text-secondary-light">LEASE</Text>
        </View>
      </View>
    </View>
  );
}

function PaymentBreakdownCard({ summary }: { summary: ReturnType<LeaseCalculator['getSummary']> }) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Payment Breakdown</Text>
      <View className="gap-2">
        <SummaryRow label="Principal Payment" value={formatCurrencyWithSymbol(summary.monthlyPrincipalPayment)} />
        <SummaryRow label="Interest Payment" value={formatCurrencyWithSymbol(summary.residualMonthlyInterestPayment)} />
        <SummaryRow label="Monthly Tax" value={formatCurrencyWithSymbol(summary.monthlySalesTax)} />
        <View className="my-2 border-t border-neutral-200 dark:border-charcoal-700" />
        <SummaryRow label="Monthly Payment" value={formatCurrencyWithSymbol(summary.leasePayment)} isBold isHighlight />
      </View>
    </View>
  );
}

function FinancialSummaryCard({
  summary,
  sheet,
}: {
  summary: ReturnType<LeaseCalculator['getSummary']>;
  sheet: VehicleLeaseSheet;
}) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Financial Summary</Text>
      <View className="gap-3">
        <SummaryRow label="MSRP" value={formatCurrencyWithSymbol(sheet.msrp)} />
        {sheet.dealer_contribution > 0 && (
          <SummaryRow
            label="Dealer Contribution"
            value={`-${formatCurrencyWithSymbol(sheet.dealer_contribution)}`}
            isNegative
          />
        )}
        {sheet.trade_in > 0 && (
          <SummaryRow label="Trade-In" value={`-${formatCurrencyWithSymbol(sheet.trade_in)}`} isNegative />
        )}
        <SummaryRow label="Final Dealer Price" value={formatCurrencyWithSymbol(summary.finalDealerPrice)} isBold />
        <SummaryRow label="Gross Cap Cost" value={formatCurrencyWithSymbol(summary.grossCapCost)} />
        <SummaryRow label="Net Cap Cost" value={formatCurrencyWithSymbol(summary.netCapCost)} />
        <SummaryRow label="Residual Amount" value={formatCurrencyWithSymbol(summary.residualAmount)} />
        <View className="my-2 border-t border-neutral-200 dark:border-charcoal-700" />
        <SummaryRow label="Cash Due at Signing" value={formatCurrencyWithSymbol(summary.cashDueAtSigning)} isBold />
        <SummaryRow
          label="Total Lease Cost"
          value={formatCurrencyWithSymbol(summary.totalLeaseCost)}
          isBold
          isHighlight
        />
      </View>
    </View>
  );
}

function LeaseDetailsCard({
  sheet,
  summary,
}: {
  sheet: VehicleLeaseSheet;
  summary: ReturnType<LeaseCalculator['getSummary']>;
}) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Lease Details</Text>
      <View className="gap-2">
        <SummaryRow label="Money Factor" value={String(sheet.money_factor)} />
        <SummaryRow label="Implied APR" value={formatPercentage(summary.interestRate)} />
        <SummaryRow label="Residual %" value={formatPercentage(sheet.residual_percent)} />
        <SummaryRow label="Term" value={`${sheet.lease_term} months`} />
        <SummaryRow label="Sales Tax" value={formatPercentage(sheet.sales_tax_percent)} />
      </View>
    </View>
  );
}

function ContactInfoCard({ sheet }: { sheet: VehicleLeaseSheet }) {
  if (!sheet.dealership_name && !sheet.sales_consultant && !sheet.contact_email) return null;
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Contact Information</Text>
      {sheet.dealership_name && <Text className="text-neutral-600 dark:text-neutral-400">{sheet.dealership_name}</Text>}
      {sheet.sales_consultant && (
        <Text className="text-neutral-600 dark:text-neutral-400">{sheet.sales_consultant}</Text>
      )}
      {sheet.contact_email && <Text className="text-secondary dark:text-secondary-light">{sheet.contact_email}</Text>}
      {sheet.contact_phone && <Text className="text-neutral-600 dark:text-neutral-400">{sheet.contact_phone}</Text>}
    </View>
  );
}

function NotesCard({ notes }: { notes: string }) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Notes</Text>
      <Text className="text-neutral-600 dark:text-neutral-400">{notes}</Text>
    </View>
  );
}

function TermsLink() {
  return (
    <Link href="/(app)/learning/leasing" asChild>
      <Pressable className="mb-4 flex-row items-center rounded-xl bg-secondary/10 px-3.5 py-2.5 dark:bg-secondary/20">
        <View className="mr-2.5">
          <Book color={colors.secondary.DEFAULT} size={16} />
        </View>
        <Text className="text-sm font-semibold text-secondary dark:text-secondary-light">
          Learn Leasing Terms
        </Text>
      </Pressable>
    </Link>
  );
}

function ActionBar({
  onEdit,
  onDelete,
  isDeleting,
  bottomPadding,
}: {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  bottomPadding: number;
}) {
  return (
    <View
      className={tw.footerBar}
      style={{ paddingBottom: bottomPadding }}
    >
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label={isDeleting ? 'Deleting...' : 'Delete'}
            variant="destructive"
            onPress={onDelete}
            disabled={isDeleting}
          />
        </View>
        <View className="flex-1">
          <Button label="Edit" onPress={onEdit} />
        </View>
      </View>
    </View>
  );
}
