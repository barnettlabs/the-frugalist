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
    <View className="mb-4 rounded-md overflow-hidden border border-primary-dark" style={{ backgroundColor: '#171B27' }}>
      <View className="px-5 py-3 border-b border-white/10">
        <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
          Monthly payment
        </Text>
      </View>
      <View className="px-5 py-5">
        <Text className="font-mono tracking-tight text-white" style={{ fontSize: 42, lineHeight: 44 }}>
          {formatCurrencyWithSymbol(payment)}
        </Text>
        <Text className="font-mono text-xs text-white/60 mt-2">
          {term} months · {rate}% APR
        </Text>
      </View>
    </View>
  );
}

function VehicleInfoCard({ sheet }: { sheet: VehicleFinanceSheet }) {
  return (
    <View className={`mb-3 p-5 ${tw.card}`}>
      <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-2">
        {sheet.sheet_name || 'Untitled estimate'}
      </Text>
      <Text
        className="font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
        style={{ fontSize: 22, lineHeight: 24 }}
      >
        <Text className="font-mono text-base text-text-muted-light dark:text-text-muted-dark">
          {sheet.vehicle_year}
        </Text>
        {' '}
        {sheet.vehicle_make}{' '}
        <Text className="italic text-text-muted-light dark:text-text-muted-dark">
          {sheet.vehicle_model}
          {sheet.vehicle_trim ? ` ${sheet.vehicle_trim}` : ''}
        </Text>
      </Text>
      <View className="mt-3 self-start rounded-sm bg-tan-light dark:bg-charcoal-800 px-2 py-0.5 border border-border-light dark:border-border-dark">
        <Text className="text-[10px] font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
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
    <View className={`mb-3 p-5 ${tw.card}`}>
      <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-4">
        Financial summary
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
        <View className="my-2 border-t border-border-light dark:border-border-dark" />
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
    <View className={`mb-3 p-5 ${tw.card}`}>
      <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-4">
        Amortization
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
    <View className={`mb-3 p-5 ${tw.card}`}>
      <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-3">
        Contact information
      </Text>
      {sheet.dealership_name && (
        <Text className="font-display text-base text-text-primary-light dark:text-text-primary-dark">
          {sheet.dealership_name}
        </Text>
      )}
      {sheet.sales_consultant && (
        <Text className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">
          {sheet.sales_consultant}
        </Text>
      )}
      {sheet.contact_email && (
        <Text className="text-sm text-accent dark:text-accent-light mt-1 underline">
          {sheet.contact_email}
        </Text>
      )}
      {sheet.contact_phone && (
        <Text className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1 font-mono">
          {sheet.contact_phone}
        </Text>
      )}
    </View>
  );
}

function NotesCard({ notes }: { notes: string }) {
  return (
    <View className={`mb-3 p-5 ${tw.card}`}>
      <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-2">
        Notes
      </Text>
      <Text className="text-sm text-text-muted-light dark:text-text-muted-dark leading-5">{notes}</Text>
    </View>
  );
}

function TermsLink() {
  return (
    <Link href="/(app)/learning/financing" asChild>
      <Pressable className="mb-4 flex-row items-center rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark px-3 py-2.5 active:opacity-80">
        <Book color={colors.text.muted.light} size={14} />
        <Text className="ml-2 text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
          Read the financing guide
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
      className="border-t border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark px-4 py-4 flex-row gap-3"
      style={{ paddingBottom: bottomPadding }}
    >
      <View className="flex-1">
        <Button
          label={isDeleting ? 'Deleting…' : 'Delete'}
          variant="destructive"
          onPress={onDelete}
          disabled={isDeleting}
        />
      </View>
      <View className="flex-1">
        <Button label="Edit" onPress={onEdit} />
      </View>
    </View>
  );
}
