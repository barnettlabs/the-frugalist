import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { CurrencyInput } from '@/components/forms';
import { ActionFooter, ControlledInput, FormSection, Select, TabPageHeader, Text, View } from '@/components/ui';
import { tw } from '@/components/ui/theme';

const trackerSchema = z.object({
	sku_upc: z.string().min(1, 'SKU/UPC is required'),
	retailer_id: z.number().min(1, 'Please select a retailer'),
	target_price: z.number().min(0.01, 'Target price must be greater than 0'),
});

type TrackerFormData = z.infer<typeof trackerSchema>;

interface TrackerFormProps {
	onSubmit: (data: TrackerFormData) => void;
	isSubmitting: boolean;
	onCancel?: () => void;
}

const RETAILER_OPTIONS = [{ value: 1, label: 'Best Buy' }];

export function TrackerForm({ onSubmit, isSubmitting, onCancel }: TrackerFormProps) {
	const { control, handleSubmit, setValue, watch } = useForm<TrackerFormData>({
		resolver: zodResolver(trackerSchema),
		defaultValues: {
			sku_upc: '',
			retailer_id: 0,
			target_price: 0,
		},
	});

	const retailerId = watch('retailer_id');

	return (
		<View className={`flex-1 ${tw.pageBg}`}>
			<TabPageHeader title="Track new" showBack backLabel="Cancel" />
			<KeyboardAwareScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
				keyboardShouldPersistTaps="handled"
				bottomOffset={120}
			>
				{/* Editorial title */}
				<View className="mb-5">
					<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Watch · New tracker
					</Text>
					<Text
						className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
						style={{ fontSize: 30, lineHeight: 32 }}
					>
						Track a new product.
					</Text>
					<Text className="mt-3 text-sm leading-5 text-text-muted-light dark:text-text-muted-dark">
						Pick a retailer, drop in a SKU, set a target. We’ll do the watching.
					</Text>
				</View>

				{/* Section 01 — Retailer */}
				<FormSection number="01" title="Select store">
					<Select
						label="Retailer"
						options={RETAILER_OPTIONS}
						value={retailerId}
						onSelect={value => setValue('retailer_id', value as number)}
					/>
				</FormSection>

				{/* Section 02 — Identifier */}
				<FormSection number="02" title="Product identifier">
					<ControlledInput control={control} name="sku_upc" label="SKU / UPC" placeholder="Enter product SKU or UPC" />
				</FormSection>

				{/* Section 03 — Target */}
				<FormSection
					number="03"
					title="Target price"
					helper="You’ll receive a notification when the price drops to or below your target."
				>
					<CurrencyInput control={control} name="target_price" label="Target price" placeholder="0.00" />
				</FormSection>

				{/* Tips */}
				<View className="mt-3 rounded-md border border-border-light bg-tan-light p-4 dark:border-border-dark dark:bg-charcoal-800">
					<Text className="mb-2 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Tip · Finding SKU
					</Text>
					<Text className="text-sm leading-5 text-text-muted-light dark:text-text-muted-dark">
						On Best Buy, look for the SKU on the product page (usually under the product title).
					</Text>
				</View>
			</KeyboardAwareScrollView>

			<ActionFooter
				primaryLabel={isSubmitting ? 'Tracking…' : 'Start tracking'}
				onPrimary={handleSubmit(onSubmit)}
				isPrimaryDisabled={isSubmitting}
				onCancel={onCancel}
			/>
		</View>
	);
}
