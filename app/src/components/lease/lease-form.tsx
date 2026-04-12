import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import {
  CurrencyInput,
  FormSection,
  PercentageInput,
} from '@/components/forms';
import {
  Button,
  ControlledInput,
  ScrollView,
  Select,
  Text,
  View,
} from '@/components/ui';
import { tw } from '@/components/ui/theme';
import { formatCurrencyWithSymbol, LeaseCalculator } from '@/lib/calculators';
import type { LeaseFormData } from '@/lib/types/models';
import { VehicleType } from '@/lib/types/models';

const leaseSchema = z.object({
  sheet_name: z.string().min(1, 'Name is required'),
  sales_consultant: z.string().nullable().optional(),
  dealership_name: z.string().nullable().optional(),
  vehicle_type: z.nativeEnum(VehicleType),
  vehicle_year: z.string().nullable().optional(),
  vehicle_make: z.string().nullable().optional(),
  vehicle_model: z.string().nullable().optional(),
  vehicle_trim: z.string().nullable().optional(),
  msrp: z.number().min(0),
  dealer_contribution: z.number().min(0),
  trade_in: z.number().min(0),
  doc_fee: z.number().min(0),
  acquisition_fee: z.number().min(0),
  misc_fees: z.number().min(0),
  lease_cash: z.number().min(0),
  down_payment: z.number().min(0),
  sales_tax_percent: z.number().min(0).max(100),
  money_factor: z.number().min(0),
  residual_percent: z.number().min(0).max(100),
  lease_term: z.number().min(1).max(84),
  start_date: z.string(),
  contact_email: z.string().email().nullable().optional().or(z.literal('')),
  contact_phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

interface LeaseFormProps {
  initialData: LeaseFormData;
  onSubmit: (data: LeaseFormData) => void;
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
  { value: 39, label: '39 months' },
  { value: 48, label: '48 months' },
];

export function LeaseForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
  isModal = false,
}: LeaseFormProps) {
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, setValue } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: initialData,
  });
  const watchedValues = useWatch({ control });
  const summary = useMemo(
    () => new LeaseCalculator(watchedValues as LeaseFormData).getSummary(),
    [watchedValues]
  );

  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <View className={`flex-1 ${tw.pageBg}`}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <SummaryCard summary={summary} />
        <EstimateInfoSection control={control} />
        <VehicleInfoSection
          control={control}
          watchedValues={watchedValues}
          setValue={setValue}
        />
        <PricingSection control={control} />
        <FeesSection control={control} />
        <LeaseTermsSection
          control={control}
          watchedValues={watchedValues}
          setValue={setValue}
        />
        <ContactSection control={control} />
        <NotesSection control={control} />
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

function SummaryCard({
  summary,
}: {
  summary: ReturnType<LeaseCalculator['getSummary']>;
}) {
  return (
    <View className="mb-6 rounded-xl bg-secondary p-4">
      <Text className="mb-2 text-white opacity-80">Monthly Payment</Text>
      <Text className="text-3xl font-bold text-white">
        {formatCurrencyWithSymbol(summary.leasePayment)}
      </Text>
      <View className="mt-3 flex-row justify-between">
        <View>
          <Text className="text-xs text-white opacity-60">Due at Signing</Text>
          <Text className="text-white">
            {formatCurrencyWithSymbol(summary.cashDueAtSigning)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-white opacity-60">Total Cost</Text>
          <Text className="text-white">
            {formatCurrencyWithSymbol(summary.totalLeaseCost)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-white opacity-60">Residual</Text>
          <Text className="text-white">
            {formatCurrencyWithSymbol(summary.residualAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function EstimateInfoSection({ control }: { control: Control<LeaseFormData> }) {
  return (
    <FormSection title="Estimate Info">
      <ControlledInput
        control={control}
        name="sheet_name"
        label="Estimate Name"
        placeholder="My Lease Estimate"
      />
    </FormSection>
  );
}

type FormProps = {
  control: Control<LeaseFormData>;
  watchedValues: Partial<LeaseFormData>;
  setValue: UseFormSetValue<LeaseFormData>;
};

function VehicleInfoSection({ control, watchedValues, setValue }: FormProps) {
  return (
    <FormSection title="Vehicle Information">
      <Select
        label="Vehicle Type"
        options={VEHICLE_TYPE_OPTIONS}
        value={watchedValues.vehicle_type}
        onSelect={(v) => setValue('vehicle_type', v as VehicleType)}
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
          <ControlledInput
            control={control}
            name="vehicle_make"
            label="Make"
            placeholder="Toyota"
          />
        </View>
      </View>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <ControlledInput
            control={control}
            name="vehicle_model"
            label="Model"
            placeholder="Camry"
          />
        </View>
        <View className="flex-1">
          <ControlledInput
            control={control}
            name="vehicle_trim"
            label="Trim"
            placeholder="XLE"
          />
        </View>
      </View>
    </FormSection>
  );
}

function PricingSection({ control }: { control: Control<LeaseFormData> }) {
  return (
    <FormSection title="Pricing">
      <CurrencyInput control={control} name="msrp" label="MSRP" />
      <CurrencyInput
        control={control}
        name="dealer_contribution"
        label="Dealer Contribution"
      />
      <CurrencyInput control={control} name="trade_in" label="Trade-In Value" />
    </FormSection>
  );
}

function FeesSection({ control }: { control: Control<LeaseFormData> }) {
  return (
    <FormSection title="Fees">
      <CurrencyInput control={control} name="doc_fee" label="Doc Fee" />
      <CurrencyInput
        control={control}
        name="acquisition_fee"
        label="Acquisition Fee"
      />
      <CurrencyInput
        control={control}
        name="misc_fees"
        label="Miscellaneous Fees"
      />
    </FormSection>
  );
}

function LeaseTermsSection({ control, watchedValues, setValue }: FormProps) {
  return (
    <FormSection title="Lease Terms">
      <CurrencyInput
        control={control}
        name="lease_cash"
        label="Lease Cash / Incentives"
      />
      <CurrencyInput
        control={control}
        name="down_payment"
        label="Down Payment"
      />
      <PercentageInput
        control={control}
        name="sales_tax_percent"
        label="Sales Tax"
      />
      <ControlledInput
        control={control}
        name="money_factor"
        label="Money Factor"
        placeholder="0.00125"
        keyboardType="decimal-pad"
      />
      <PercentageInput
        control={control}
        name="residual_percent"
        label="Residual Percentage"
      />
      <Select
        label="Lease Term"
        options={TERM_OPTIONS}
        value={watchedValues.lease_term}
        onSelect={(v) => setValue('lease_term', v as number)}
      />
      <ControlledInput
        control={control}
        name="start_date"
        label="Start Date"
        placeholder="YYYY-MM-DD"
      />
    </FormSection>
  );
}

function ContactSection({ control }: { control: Control<LeaseFormData> }) {
  return (
    <FormSection title="Contact Information" collapsible defaultCollapsed>
      <ControlledInput
        control={control}
        name="sales_consultant"
        label="Sales Consultant"
        placeholder="John Smith"
      />
      <ControlledInput
        control={control}
        name="dealership_name"
        label="Dealership"
        placeholder="ABC Motors"
      />
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

function NotesSection({ control }: { control: Control<LeaseFormData> }) {
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
      className={tw.footerBar}
      style={{ paddingBottom: bottomPadding }}
    >
      <View className="flex-row gap-3">
        {onCancel && (
          <View className="flex-1">
            <Button label="Cancel" variant="outline" onPress={onCancel} />
          </View>
        )}
        <View className="flex-1">
          <Button
            label={isSubmitting ? 'Saving...' : submitLabel}
            onPress={onSubmit}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </View>
  );
}
