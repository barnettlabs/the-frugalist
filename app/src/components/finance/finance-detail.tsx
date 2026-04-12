import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Book } from '@/components/ui/icons';
import { SummaryRow } from '@/components/ui/summary-row';
import { tw } from '@/components/ui/theme';
import { FinanceCalculator, formatCurrencyWithSymbol } from '@/lib/calculators';
import type { VehicleFinanceSheet } from '@/lib/types/models';

interface FinanceDetailProps {
  sheet: VehicleFinanceSheet;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function FinanceDetail({
  sheet,
  onEdit,
  onDelete,
  isDeleting,
}: FinanceDetailProps) {
  const insets = useSafeAreaInsets();
  const summary = useMemo(
    () => new FinanceCalculator(sheet).getSummary(),
    [sheet]
  );

  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <View className={`flex-1 ${tw.pageBg}`}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <PaymentHeader
          payment={summary.monthlyPayment}
          term={sheet.finance_term}
          rate={sheet.interest_rate}
        />
        <TermsLink />
        <VehicleInfoCard sheet={sheet} />
        <FinancialSummaryCard summary={summary} sheet={sheet} />
        {summary.amortization && (
          <AmortizationCard amortization={summary.amortization} />
        )}
        <ContactInfoCard sheet={sheet} />
        {sheet.notes && <NotesCard notes={sheet.notes} />}
        <View className="h-20" />
      </ScrollView>
      <ActionBar
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
        bottomPadding={bottomPadding}
      />
    </View>
  );
}

function PaymentHeader({
  payment,
  term,
  rate,
}: {
  payment: number;
  term: number;
  rate: number;
}) {
  return (
    <View className="mb-4 rounded-xl bg-accent p-4">
      <Text className="text-white opacity-80">Monthly Payment</Text>
      <Text className="text-4xl font-bold text-white">
        {formatCurrencyWithSymbol(payment)}
      </Text>
      <Text className="text-white opacity-70">
        for {term} months @ {rate}% APR
      </Text>
    </View>
  );
}

function VehicleInfoCard({ sheet }: { sheet: VehicleFinanceSheet }) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        {sheet.sheet_name || 'Untitled Estimate'}
      </Text>
      <Text className="text-neutral-600 dark:text-neutral-400">
        {sheet.vehicle_year} {sheet.vehicle_make} {sheet.vehicle_model}
        {sheet.vehicle_trim ? ` ${sheet.vehicle_trim}` : ''}
      </Text>
      <View className="mt-2 self-start rounded-full bg-neutral-100 px-3 py-1 dark:bg-charcoal-700">
        <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          {sheet.vehicle_type}
        </Text>
      </View>
    </View>
  );
}

function FinancialSummaryCard({
  summary,
  sheet,
}: {
  summary: ReturnType<FinanceCalculator['getSummary']>;
  sheet: VehicleFinanceSheet;
}) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        Financial Summary
      </Text>
      <View className="gap-3">
        <SummaryRow label="MSRP" value={formatCurrencyWithSymbol(sheet.msrp)} />
        {sheet.discounts > 0 && (
          <SummaryRow
            label="Discounts"
            value={`-${formatCurrencyWithSymbol(sheet.discounts)}`}
            isNegative
          />
        )}
        {sheet.rebates > 0 && (
          <SummaryRow
            label="Rebates"
            value={`-${formatCurrencyWithSymbol(sheet.rebates)}`}
            isNegative
          />
        )}
        <SummaryRow
          label="Purchase Price"
          value={formatCurrencyWithSymbol(summary.purchasePrice)}
          isBold
        />
        {sheet.fees > 0 && (
          <SummaryRow
            label="Fees"
            value={formatCurrencyWithSymbol(sheet.fees)}
          />
        )}
        <SummaryRow
          label="Sales Tax"
          value={formatCurrencyWithSymbol(summary.salesTaxAmount)}
        />
        {sheet.down_payment > 0 && (
          <SummaryRow
            label="Down Payment"
            value={`-${formatCurrencyWithSymbol(sheet.down_payment)}`}
            isNegative
          />
        )}
        <View className="my-2 border-t border-neutral-200 dark:border-charcoal-700" />
        <SummaryRow
          label="Loan Amount"
          value={formatCurrencyWithSymbol(summary.loanAmount)}
          isBold
        />
        <SummaryRow
          label="Total Interest"
          value={formatCurrencyWithSymbol(summary.interestAmount)}
        />
        <SummaryRow
          label="Total Payments"
          value={formatCurrencyWithSymbol(summary.paymentsTotal)}
        />
        <SummaryRow
          label="Grand Total"
          value={formatCurrencyWithSymbol(summary.grandTotal)}
          isBold
          isHighlight
        />
      </View>
    </View>
  );
}

type AmortizationType = NonNullable<
  ReturnType<FinanceCalculator['getSummary']>['amortization']
>;

function AmortizationCard({
  amortization,
}: {
  amortization: AmortizationType;
}) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        Amortization Summary
      </Text>
      <View className="gap-2">
        <SummaryRow
          label="Payments"
          value={`${amortization.monthsPaid} months`}
        />
        {amortization.monthsSaved > 0 && (
          <SummaryRow
            label="Months Saved"
            value={`${amortization.monthsSaved} months`}
            isHighlight
          />
        )}
        <SummaryRow
          label="Total Principal"
          value={formatCurrencyWithSymbol(amortization.totalPrincipal)}
        />
        <SummaryRow
          label="Total Interest"
          value={formatCurrencyWithSymbol(amortization.totalInterest)}
        />
      </View>
    </View>
  );
}

function ContactInfoCard({ sheet }: { sheet: VehicleFinanceSheet }) {
  if (!sheet.dealership_name && !sheet.sales_consultant && !sheet.contact_email)
    return null;
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        Contact Information
      </Text>
      {sheet.dealership_name && (
        <Text className="text-neutral-600 dark:text-neutral-400">
          {sheet.dealership_name}
        </Text>
      )}
      {sheet.sales_consultant && (
        <Text className="text-neutral-600 dark:text-neutral-400">
          {sheet.sales_consultant}
        </Text>
      )}
      {sheet.contact_email && (
        <Text className="text-accent dark:text-accent-light">{sheet.contact_email}</Text>
      )}
      {sheet.contact_phone && (
        <Text className="text-neutral-600 dark:text-neutral-400">
          {sheet.contact_phone}
        </Text>
      )}
    </View>
  );
}

function NotesCard({ notes }: { notes: string }) {
  return (
    <View className={`mb-4 p-4 ${tw.card}`}>
      <Text className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
        Notes
      </Text>
      <Text className="text-neutral-600 dark:text-neutral-400">{notes}</Text>
    </View>
  );
}

function TermsLink() {
  return (
    <Link href="/(app)/learning/financing" asChild>
      <Pressable className="mb-4 flex-row items-center rounded-xl bg-accent/10 px-3.5 py-2.5 dark:bg-accent/20">
        <View className="mr-2.5">
          <Book color={colors.accent.DEFAULT} size={16} />
        </View>
        <Text className="text-sm font-semibold text-accent dark:text-accent-light">
          Learn Financing Terms
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
