import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { CurrencyInput, ExtraPaymentsField, FormSection, PercentageInput } from '@/components/forms';
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
				<EstimateInfoSection control={control} />
				<VehicleInfoSection control={control} watchedValues={watchedValues} setValue={setValue} />
				<PricingSection control={control} />
				<FinancingSection control={control} watchedValues={watchedValues} setValue={setValue} />
				<ContactSection control={control} />
				<NotesSection control={control} />
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
		<View className="mb-5 rounded-md overflow-hidden border border-primary-dark" style={{ backgroundColor: '#171B27' }}>
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
						<Text className="font-mono text-sm" style={{ color: '#E6B25A' }}>
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

function EstimateInfoSection({ control }: { control: Control<FinanceFormData> }) {
	return (
		<FormSection number="01" title="Estimate info">
			<ControlledInput control={control} name="sheet_name" label="Estimate name" placeholder="My car estimate" />
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
		<FormSection number="02" title="Vehicle information">
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

function ContactSection({ control }: { control: Control<FinanceFormData> }) {
	return (
		<FormSection number="05" title="Contact information" collapsible defaultCollapsed>
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
		<FormSection number="06" title="Notes" collapsible defaultCollapsed>
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
