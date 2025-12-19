import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { CurrencyInput, FormSection, PercentageInput } from '@/components/forms';
import { Button, ControlledInput, ScrollView, Select, Text, View } from '@/components/ui';
import { FinanceCalculator, formatCurrencyWithSymbol } from '@/lib/calculators';
import type { FinanceFormData } from '@/lib/types/models';
import { VehicleType } from '@/lib/types/models';

const financeSchema = z.object({
  sheet_name: z.string().min(1, 'Name is required'),
  sales_consultant: z.string().nullable().optional(),
  dealership_name: z.string().nullable().optional(),
  vehicle_type: z.nativeEnum(VehicleType),
  vehicle_year: z.string().nullable().optional(),
  vehicle_make: z.string().nullable().optional(),
  vehicle_model: z.string().nullable().optional(),
  vehicle_trim: z.string().nullable().optional(),
  msrp: z.number().min(0),
  fees: z.number().min(0),
  discounts: z.number().min(0),
  rebates: z.number().min(0),
  down_payment: z.number().min(0),
  sales_tax_percent: z.number().min(0).max(100),
  interest_rate: z.number().min(0).max(100),
  finance_term: z.number().min(1).max(120),
  start_date: z.string(),
  contact_email: z.string().email().nullable().optional().or(z.literal('')),
  contact_phone: z.string().nullable().optional(),
  extra_payments_json: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

interface FinanceFormProps {
  initialData: FinanceFormData;
  onSubmit: (data: FinanceFormData) => void;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
  isModal?: boolean;
}

const VEHICLE_TYPE_OPTIONS = [
  { value: VehicleType.CAR, label: 'Car' },
  { value: VehicleType.TRUCK, label: 'Truck' },
  { value: VehicleType.SUV, label: 'SUV' },
];

const TERM_OPTIONS = [
  { value: 24, label: '24 months' },
  { value: 36, label: '36 months' },
  { value: 48, label: '48 months' },
  { value: 60, label: '60 months' },
  { value: 72, label: '72 months' },
  { value: 84, label: '84 months' },
];

export function FinanceForm({ initialData, onSubmit, isSubmitting, submitLabel, onCancel, isModal = false }: FinanceFormProps) {
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, setValue, formState } = useForm<FinanceFormData>({
    resolver: zodResolver(financeSchema),
    defaultValues: initialData,
  });
  const watchedValues = useWatch({ control });
  const summary = useMemo(() => new FinanceCalculator(watchedValues as FinanceFormData).getSummary(), [watchedValues]);

  // Account for floating tab bar (64px height + 16px margin + safe area) when not in modal
  const bottomPadding = isModal ? Math.max(insets.bottom, 16) : Math.max(insets.bottom, 16) + 80;

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <SummaryCard summary={summary} />
        <EstimateInfoSection control={control} />
        <VehicleInfoSection control={control} watchedValues={watchedValues} setValue={setValue} />
        <PricingSection control={control} />
        <FinancingSection control={control} watchedValues={watchedValues} setValue={setValue} />
        <ContactSection control={control} />
        <NotesSection control={control} />
        <AdvancedSection control={control} />
        <View className="h-20" />
      </ScrollView>
      <ActionBar
        onSubmit={handleSubmit(onSubmit)}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        bottomPadding={bottomPadding}
      />
    </View>
  );
}

function SummaryCard({ summary }: { summary: ReturnType<FinanceCalculator['getSummary']> }) {
  return (
    <View className="mb-6 rounded-xl bg-primary-600 p-4">
      <Text className="mb-2 text-white opacity-80">Monthly Payment</Text>
      <Text className="text-3xl font-bold text-white">{formatCurrencyWithSymbol(summary.monthlyPayment)}</Text>
      <View className="mt-3 flex-row justify-between">
        <View>
          <Text className="text-xs text-white opacity-60">Loan Amount</Text>
          <Text className="text-white">{formatCurrencyWithSymbol(summary.loanAmount)}</Text>
        </View>
        <View>
          <Text className="text-xs text-white opacity-60">Total Interest</Text>
          <Text className="text-white">{formatCurrencyWithSymbol(summary.interestAmount)}</Text>
        </View>
        <View>
          <Text className="text-xs text-white opacity-60">Grand Total</Text>
          <Text className="text-white">{formatCurrencyWithSymbol(summary.grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

function EstimateInfoSection({ control }: { control: Control<FinanceFormData> }) {
  return (
    <FormSection title="Estimate Info">
      <ControlledInput control={control} name="sheet_name" label="Estimate Name" placeholder="My Car Estimate" />
    </FormSection>
  );
}

type FormProps = {
  control: Control<FinanceFormData>;
  watchedValues: Partial<FinanceFormData>;
  setValue: UseFormSetValue<FinanceFormData>;
};

function VehicleInfoSection({ control, watchedValues, setValue }: FormProps) {
  return (
    <FormSection title="Vehicle Information">
      <Select
        label="Vehicle Type"
        options={VEHICLE_TYPE_OPTIONS}
        value={watchedValues.vehicle_type}
        onSelect={v => setValue('vehicle_type', v as VehicleType)}
      />
      <View className="mt-2 flex-row gap-2">
        <View className="flex-1">
          <ControlledInput
            control={control}
            name="vehicle_year"
            label="Year"
            placeholder="2024"
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-1">
          <ControlledInput control={control} name="vehicle_make" label="Make" placeholder="Toyota" />
        </View>
      </View>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <ControlledInput control={control} name="vehicle_model" label="Model" placeholder="Camry" />
        </View>
        <View className="flex-1">
          <ControlledInput control={control} name="vehicle_trim" label="Trim" placeholder="XLE" />
        </View>
      </View>
    </FormSection>
  );
}

function PricingSection({ control }: { control: Control<FinanceFormData> }) {
  return (
    <FormSection title="Pricing">
      <CurrencyInput control={control} name="msrp" label="MSRP" />
      <CurrencyInput control={control} name="fees" label="Fees" />
      <CurrencyInput control={control} name="discounts" label="Discounts" />
      <CurrencyInput control={control} name="rebates" label="Rebates" />
    </FormSection>
  );
}

function FinancingSection({ control, watchedValues, setValue }: FormProps) {
  return (
    <FormSection title="Financing">
      <CurrencyInput control={control} name="down_payment" label="Down Payment" />
      <PercentageInput control={control} name="sales_tax_percent" label="Sales Tax" />
      <PercentageInput control={control} name="interest_rate" label="Interest Rate (APR)" />
      <Select
        label="Loan Term"
        options={TERM_OPTIONS}
        value={watchedValues.finance_term}
        onSelect={v => setValue('finance_term', v as number)}
      />
      <ControlledInput control={control} name="start_date" label="Start Date" placeholder="YYYY-MM-DD" />
    </FormSection>
  );
}

function ContactSection({ control }: { control: Control<FinanceFormData> }) {
  return (
    <FormSection title="Contact Information" collapsible defaultCollapsed>
      <ControlledInput control={control} name="sales_consultant" label="Sales Consultant" placeholder="John Smith" />
      <ControlledInput control={control} name="dealership_name" label="Dealership" placeholder="ABC Motors" />
      <ControlledInput
        control={control}
        name="contact_email"
        label="Email"
        placeholder="john@dealer.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <ControlledInput
        control={control}
        name="contact_phone"
        label="Phone"
        placeholder="(555) 123-4567"
        keyboardType="phone-pad"
      />
    </FormSection>
  );
}

function NotesSection({ control }: { control: Control<FinanceFormData> }) {
  return (
    <FormSection title="Notes" collapsible defaultCollapsed>
      <ControlledInput
        control={control}
        name="notes"
        label="Notes"
        placeholder="Additional notes..."
        multiline
        numberOfLines={4}
      />
    </FormSection>
  );
}

function AdvancedSection({ control }: { control: Control<FinanceFormData> }) {
  return (
    <FormSection title="Advanced" collapsible defaultCollapsed>
      <ControlledInput
        control={control}
        name="extra_payments_json"
        label="Extra Payments (JSON)"
        placeholder='[{"startMonth": 1, "endMonth": 12, "paymentAmount": 100}]'
        multiline
        numberOfLines={3}
      />
    </FormSection>
  );
}

function ActionBar({
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  bottomPadding,
}: {
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  bottomPadding: number;
}) {
  return (
    <View
      className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
      style={{ paddingBottom: bottomPadding }}
    >
      <View className="flex-row gap-3">
        {onCancel && (
          <View className="flex-1">
            <Button label="Cancel" variant="outline" onPress={onCancel} />
          </View>
        )}
        <View className="flex-1">
          <Button label={isSubmitting ? 'Saving...' : submitLabel} onPress={onSubmit} disabled={isSubmitting} />
        </View>
      </View>
    </View>
  );
}
