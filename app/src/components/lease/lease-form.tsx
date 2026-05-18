import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { CurrencyInput, FormSection, PercentageInput } from '@/components/forms';
import { ContactSection, EstimateInfoSection, NotesSection, VehicleInfoSection } from '@/components/shared/form-sections';
import { ActionFooter, ControlledInput, Select, TabPageHeader, Text, View } from '@/components/ui';
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
	headerTitle?: string;
	backLabel?: string;
}

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
	headerTitle = 'New estimate',
	backLabel = 'Cancel',
}: LeaseFormProps) {
	const { control, handleSubmit, setValue } = useForm<LeaseFormData>({
		resolver: zodResolver(leaseSchema),
		defaultValues: initialData,
	});
	const watchedValues = useWatch({ control });
	const summary = useMemo(() => new LeaseCalculator(watchedValues as LeaseFormData).getSummary(), [watchedValues]);

	return (
		<View className={`flex-1 ${tw.pageBg}`}>
			<TabPageHeader title={headerTitle} showBack backLabel={backLabel} onBack={onCancel} />
			<KeyboardAwareScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
				keyboardShouldPersistTaps="handled"
				bottomOffset={120}
			>
				<SummaryCard summary={summary} />
				<EstimateInfoSection control={control} sectionNumber="01" placeholder="My lease estimate" />
				<VehicleInfoSection control={control} watchedValues={watchedValues} setValue={setValue} sectionNumber="02" />
				<PricingSection control={control} />
				<FeesSection control={control} />
				<LeaseTermsSection control={control} watchedValues={watchedValues} setValue={setValue} />
				<ContactSection control={control} sectionNumber="06" />
				<NotesSection control={control} sectionNumber="07" />
			</KeyboardAwareScrollView>
			<ActionFooter
				primaryLabel={isSubmitting ? 'Saving…' : submitLabel}
				onPrimary={handleSubmit(onSubmit)}
				isPrimaryDisabled={isSubmitting}
				onCancel={onCancel}
			/>
		</View>
	);
}

function SummaryCard({ summary }: { summary: ReturnType<LeaseCalculator['getSummary']> }) {
	return (
		<View className="mb-5 rounded-md overflow-hidden border border-primary-dark" style={{ backgroundColor: '#171B27' }}>
			<View className="px-5 py-3 border-b border-white/10">
				<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">At a glance</Text>
			</View>
			<View className="px-5 py-5">
				<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1.5">Monthly</Text>
				<Text className="font-mono tracking-tight text-white" style={{ fontSize: 36, lineHeight: 38 }}>
					{formatCurrencyWithSymbol(summary.leasePayment)}
				</Text>
				<View className="mt-5 pt-4 border-t border-white/10 flex-row justify-between">
					<View>
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1">
							Due at signing
						</Text>
						<Text className="font-mono text-sm text-white">{formatCurrencyWithSymbol(summary.cashDueAtSigning)}</Text>
					</View>
					<View>
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1">Total cost</Text>
						<Text className="font-mono text-sm" style={{ color: '#E6B25A' }}>
							{formatCurrencyWithSymbol(summary.totalLeaseCost)}
						</Text>
					</View>
					<View>
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1">Residual</Text>
						<Text className="font-mono text-sm text-white">{formatCurrencyWithSymbol(summary.residualAmount)}</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

type FormProps = {
	control: Control<LeaseFormData>;
	watchedValues: Partial<LeaseFormData>;
	setValue: UseFormSetValue<LeaseFormData>;
};

function PricingSection({ control }: { control: Control<LeaseFormData> }) {
	return (
		<FormSection number="03" title="Pricing">
			<CurrencyInput control={control} name="msrp" label="MSRP" />
			<CurrencyInput control={control} name="dealer_contribution" label="Dealer Contribution" />
			<CurrencyInput control={control} name="trade_in" label="Trade-In Value" />
		</FormSection>
	);
}

function FeesSection({ control }: { control: Control<LeaseFormData> }) {
	return (
		<FormSection number="04" title="Fees">
			<CurrencyInput control={control} name="doc_fee" label="Doc Fee" />
			<CurrencyInput control={control} name="acquisition_fee" label="Acquisition Fee" />
			<CurrencyInput control={control} name="misc_fees" label="Miscellaneous Fees" />
		</FormSection>
	);
}

function LeaseTermsSection({ control, watchedValues, setValue }: FormProps) {
	return (
		<FormSection number="05" title="Lease terms">
			<CurrencyInput control={control} name="lease_cash" label="Lease Cash / Incentives" />
			<CurrencyInput control={control} name="down_payment" label="Down Payment" />
			<PercentageInput control={control} name="sales_tax_percent" label="Sales Tax" />
			<ControlledInput
				control={control}
				name="money_factor"
				label="Money Factor"
				placeholder="0.00125"
				keyboardType="decimal-pad"
			/>
			<PercentageInput control={control} name="residual_percent" label="Residual Percentage" />
			<Select
				label="Lease Term"
				options={TERM_OPTIONS}
				value={watchedValues.lease_term}
				onSelect={v => setValue('lease_term', v as number)}
			/>
			<ControlledInput control={control} name="start_date" label="Start Date" placeholder="YYYY-MM-DD" />
		</FormSection>
	);
}

