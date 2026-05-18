import React from 'react';
import type { Control, FieldValues, Path, UseFormSetValue } from 'react-hook-form';

import { FormSection } from '@/components/forms';
import { ControlledInput, Select, View } from '@/components/ui';
import { VehicleType } from '@/lib/types/models';

const VEHICLE_TYPE_OPTIONS = [
	{ value: VehicleType.CAR, label: 'Car' },
	{ value: VehicleType.TRUCK, label: 'Truck' },
	{ value: VehicleType.SUV, label: 'SUV' },
];

type WithSheetName = { sheet_name: string } & FieldValues;
type WithVehicleInfo = {
	vehicle_type: VehicleType;
	vehicle_year?: string | null;
	vehicle_make?: string | null;
	vehicle_model?: string | null;
	vehicle_trim?: string | null;
} & FieldValues;
type WithContactInfo = {
	sales_consultant?: string | null;
	dealership_name?: string | null;
	contact_email?: string | null;
	contact_phone?: string | null;
} & FieldValues;
type WithNotes = { notes?: string | null } & FieldValues;

export function EstimateInfoSection<T extends WithSheetName>({
	control,
	sectionNumber,
	placeholder,
}: {
	control: Control<T>;
	sectionNumber: string;
	placeholder: string;
}) {
	return (
		<FormSection number={sectionNumber} title="Estimate info">
			<ControlledInput
				control={control}
				name={'sheet_name' as Path<T>}
				label="Estimate name"
				placeholder={placeholder}
			/>
		</FormSection>
	);
}

export function VehicleInfoSection<T extends WithVehicleInfo>({
	control,
	watchedValues,
	setValue,
	sectionNumber,
}: {
	control: Control<T>;
	watchedValues: Partial<T>;
	setValue: UseFormSetValue<T>;
	sectionNumber: string;
}) {
	return (
		<FormSection number={sectionNumber} title="Vehicle information">
			<Select
				label="Vehicle Type"
				options={VEHICLE_TYPE_OPTIONS}
				value={(watchedValues as any).vehicle_type}
				onSelect={v => setValue('vehicle_type' as Path<T>, v as any)}
			/>
			<View className="mt-2 flex-row gap-2">
				<View className="flex-1">
					<ControlledInput
						control={control}
						name={'vehicle_year' as Path<T>}
						label="Year"
						placeholder="2024"
						keyboardType="number-pad"
					/>
				</View>
				<View className="flex-1">
					<ControlledInput control={control} name={'vehicle_make' as Path<T>} label="Make" placeholder="Toyota" />
				</View>
			</View>
			<View className="flex-row gap-2">
				<View className="flex-1">
					<ControlledInput control={control} name={'vehicle_model' as Path<T>} label="Model" placeholder="Camry" />
				</View>
				<View className="flex-1">
					<ControlledInput control={control} name={'vehicle_trim' as Path<T>} label="Trim" placeholder="XLE" />
				</View>
			</View>
		</FormSection>
	);
}

export function ContactSection<T extends WithContactInfo>({
	control,
	sectionNumber,
}: {
	control: Control<T>;
	sectionNumber: string;
}) {
	return (
		<FormSection number={sectionNumber} title="Contact information" collapsible defaultCollapsed>
			<ControlledInput
				control={control}
				name={'sales_consultant' as Path<T>}
				label="Sales Consultant"
				placeholder="John Smith"
			/>
			<ControlledInput
				control={control}
				name={'dealership_name' as Path<T>}
				label="Dealership"
				placeholder="ABC Motors"
			/>
			<ControlledInput
				control={control}
				name={'contact_email' as Path<T>}
				label="Email"
				placeholder="john@dealer.com"
				keyboardType="email-address"
				autoCapitalize="none"
			/>
			<ControlledInput
				control={control}
				name={'contact_phone' as Path<T>}
				label="Phone"
				placeholder="(555) 123-4567"
				keyboardType="phone-pad"
			/>
		</FormSection>
	);
}

export function NotesSection<T extends WithNotes>({
	control,
	sectionNumber,
}: {
	control: Control<T>;
	sectionNumber: string;
}) {
	return (
		<FormSection number={sectionNumber} title="Notes" collapsible defaultCollapsed>
			<ControlledInput
				control={control}
				name={'notes' as Path<T>}
				label="Notes"
				placeholder="Additional notes..."
				multiline
				numberOfLines={4}
			/>
		</FormSection>
	);
}
