import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { CurrencyInput, ExtraPaymentsField, FormSection, PercentageInput } from '@/components/forms';
import { ContactSection, EstimateInfoSection, NotesSection, VehicleInfoSection } from '@/components/shared/form-sections';
import { ActionFooter, ControlledInput, Select, TabPageHeader, Text, View } from '@/components/ui';
import { tw } from '@/components/ui/theme';
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
	/** Header title (defaults to "Finance estimate") */
	headerTitle?: string;
	/** Back-button label in the inline header */
	backLabel?: string;
}

const TERM_OPTIONS = [
	{ value: 24, label: '24 months' },
	{ value: 36, label: '36 months' },
	{ value: 48, label: '48 months' },
	{ value: 60, label: '60 months' },
	{ value: 72, label: '72 months' },
	{ value: 84, label: '84 months' },
];

export function FinanceForm({
	initialData,
	onSubmit,
	isSubmitting,
	submitLabel,
	onCancel,
	headerTitle = 'New estimate',
	backLabel = 'Cancel',
}: FinanceFormProps) {
	const { control, handleSubmit, setValue } = useForm<FinanceFormData>({
		resolver: zodResolver(financeSchema),
		defaultValues: initialData,
	});
	const watchedValues = useWatch({ control });
	const summary = useMemo(() => new FinanceCalculator(watchedValues as FinanceFormData).getSummary(), [watchedValues]);

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
				<EstimateInfoSection control={control} sectionNumber="01" placeholder="My car estimate" />
				<VehicleInfoSection control={control} watchedValues={watchedValues} setValue={setValue} sectionNumber="02" />
				<PricingSection control={control} />
				<FinancingSection control={control} watchedValues={watchedValues} setValue={setValue} />
				<ContactSection control={control} sectionNumber="05" />
				<NotesSection control={control} sectionNumber="06" />
				<AdvancedSection control={control} watchedValues={watchedValues} />
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

function SummaryCard({ summary }: { summary: ReturnType<FinanceCalculator['getSummary']> }) {
	return (
		<View className="mb-5 rounded-md overflow-hidden border border-primary-dark bg-primary">
			<View className="px-5 py-3 border-b border-white/10">
				<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">At a glance</Text>
			</View>
			<View className="px-5 py-5">
				<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1.5">Monthly</Text>
				<Text className="font-mono tracking-tight text-white" style={{ fontSize: 36, lineHeight: 38 }}>
					{formatCurrencyWithSymbol(summary.monthlyPayment)}
				</Text>
				<View className="mt-5 pt-4 border-t border-white/10 flex-row justify-between">
					<View>
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1">Financed</Text>
						<Text className="font-mono text-sm text-white">{formatCurrencyWithSymbol(summary.loanAmount)}</Text>
					</View>
					<View>
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1">Interest</Text>
						<Text className="font-mono text-sm text-signal-light">
							{formatCurrencyWithSymbol(summary.interestAmount)}
						</Text>
					</View>
					<View>
						<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-1">Total</Text>
						<Text className="font-mono text-sm text-white">{formatCurrencyWithSymbol(summary.grandTotal)}</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

type FormProps = {
	control: Control<FinanceFormData>;
	watchedValues: Partial<FinanceFormData>;
	setValue: UseFormSetValue<FinanceFormData>;
};

function PricingSection({ control }: { control: Control<FinanceFormData> }) {
	return (
		<FormSection number="03" title="Pricing">
			<CurrencyInput control={control} name="msrp" label="MSRP" />
			<CurrencyInput control={control} name="fees" label="Fees" />
			<CurrencyInput control={control} name="discounts" label="Discounts" />
			<CurrencyInput control={control} name="rebates" label="Rebates" />
		</FormSection>
	);
}

function FinancingSection({ control, watchedValues, setValue }: FormProps) {
	return (
		<FormSection number="04" title="Finance terms">
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

function AdvancedSection({
	control,
	watchedValues,
}: {
	control: Control<FinanceFormData>;
	watchedValues: Partial<FinanceFormData>;
}) {
	return (
		<FormSection
			number="07"
			title="Advanced"
			helper="Schedule extra payments to shorten the loan and shave interest."
			collapsible
			defaultCollapsed
		>
			<ExtraPaymentsField
				control={control}
				name="extra_payments_json"
				maxMonths={watchedValues.finance_term as number | undefined}
			/>
		</FormSection>
	);
}
