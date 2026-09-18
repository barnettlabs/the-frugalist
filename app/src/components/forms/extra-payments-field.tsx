import * as React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { Pressable, TextInput, View } from 'react-native';

import colors from '@/components/ui/colors';
import { Plus } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';

type ExtraPayment = {
	paymentAmount: number;
	startMonth: number;
	endMonth: number;
};

interface ExtraPaymentsFieldProps<T extends FieldValues> {
	name: Path<T>;
	control: Control<T>;
	maxMonths?: number;
}

export function ExtraPaymentsField<T extends FieldValues>({ name, control, maxMonths }: ExtraPaymentsFieldProps<T>) {
	const { field } = useController({ control, name });
	const payments = parsePayments(field.value);

	const update = (next: ExtraPayment[]) => {
		field.onChange(next.length === 0 ? '' : JSON.stringify(next));
	};

	const addRow = () => update([...payments, { paymentAmount: 0, startMonth: 1, endMonth: 1 }]);

	const removeRow = (index: number) => update(payments.filter((_, i) => i !== index));

	const updateRow = (index: number, patch: Partial<ExtraPayment>) =>
		update(payments.map((row, i) => (i === index ? { ...row, ...patch } : row)));

	const total = payments.reduce(
		(sum, p) =>
			sum + Math.max(0, (Number(p.endMonth) || 0) - (Number(p.startMonth) || 0) + 1) * (Number(p.paymentAmount) || 0),
		0
	);

	return (
		<View>
			<View className="mb-3 flex-row items-center justify-between">
				<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
					Extra payment plans
				</Text>
				<Pressable
					onPress={addRow}
					className="flex-row items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 active:opacity-70"
				>
					<Plus color={colors.surface.light} width={12} height={12} />
					<Text className="text-xs font-medium text-surface-light">Add</Text>
				</Pressable>
			</View>

			{payments.length === 0 ? (
				<View className="items-center rounded-md border border-dashed border-border-light p-5 dark:border-border-dark">
					<Text className="font-display text-base italic tracking-tight text-text-primary-light dark:text-text-primary-dark">
						No extra payments yet.
					</Text>
					<Text className="mt-1 text-center text-xs text-text-muted-light dark:text-text-muted-dark">
						Add extras to shorten the loan and shave interest.
					</Text>
				</View>
			) : (
				<View className="gap-3">
					{payments.map((row, index) => (
						<PaymentRow
							key={index}
							row={row}
							maxMonths={maxMonths}
							onChange={patch => updateRow(index, patch)}
							onRemove={() => removeRow(index)}
						/>
					))}

					<View className="flex-row items-center justify-between rounded-md border border-border-light bg-tan-light px-4 py-3 dark:border-border-dark dark:bg-charcoal-800">
						<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
							Total extra
						</Text>
						<Text className="font-mono text-sm text-text-primary-light dark:text-text-primary-dark">
							${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</Text>
					</View>
				</View>
			)}
		</View>
	);
}

function PaymentRow({
	row,
	maxMonths,
	onChange,
	onRemove,
}: {
	row: ExtraPayment;
	maxMonths?: number;
	onChange: (patch: Partial<ExtraPayment>) => void;
	onRemove: () => void;
}) {
	const months = Math.max(0, (row.endMonth || 0) - (row.startMonth || 0) + 1);
	const total = months * (row.paymentAmount || 0);

	return (
		<View className="rounded-md border border-border-light bg-surface-light p-4 dark:border-border-dark dark:bg-surface-dark">
			<View className="flex-row gap-2">
				<View className="flex-[1.4]">
					<Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Amount
					</Text>
					<CompactInput
						value={row.paymentAmount}
						onChangeNumber={n => onChange({ paymentAmount: n })}
						placeholder="0.00"
						prefix="$"
					/>
				</View>
				<View className="flex-1">
					<Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						Start mo.
					</Text>
					<CompactInput
						value={row.startMonth}
						onChangeNumber={n => onChange({ startMonth: clampMonth(n, maxMonths) })}
						integer
						placeholder="1"
					/>
				</View>
				<View className="flex-1">
					<Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						End mo.
					</Text>
					<CompactInput
						value={row.endMonth}
						onChangeNumber={n => onChange({ endMonth: clampMonth(n, maxMonths) })}
						integer
						placeholder="1"
					/>
				</View>
			</View>

			<View className="mt-3 flex-row items-center justify-between">
				<Text className="font-mono text-[11px] text-text-muted-light dark:text-text-muted-dark">
					Months {row.startMonth || 1}–{row.endMonth || row.startMonth || 1} · $
					{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
				</Text>
				<Pressable
					onPress={onRemove}
					className="rounded-md border border-border-light px-2.5 py-1 active:opacity-60 dark:border-border-dark"
				>
					<Text className="text-[11px] font-medium text-danger">Remove</Text>
				</Pressable>
			</View>
		</View>
	);
}

function CompactInput({
	value,
	onChangeNumber,
	placeholder,
	prefix,
	integer,
}: {
	value: number;
	onChangeNumber: (n: number) => void;
	placeholder?: string;
	prefix?: string;
	integer?: boolean;
}) {
	const [text, setText] = React.useState(value ? String(value) : '');

	React.useEffect(() => {
		setText(value ? String(value) : '');
	}, [value]);

	const handleChange = (raw: string) => {
		const cleaned = integer ? raw.replace(/[^0-9]/g, '') : raw.replace(/[^0-9.]/g, '');
		setText(cleaned);
		const n = parseFloat(cleaned);
		onChangeNumber(Number.isFinite(n) ? n : 0);
	};

	return (
		<View className="h-10 flex-row items-center rounded-md border border-border-light bg-surface-light px-3 dark:border-border-dark dark:bg-charcoal-900">
			{prefix ? <Text className="mr-1 text-sm text-text-muted-light dark:text-text-muted-dark">{prefix}</Text> : null}
			<TextInput
				value={text}
				onChangeText={handleChange}
				placeholder={placeholder}
				placeholderTextColor={colors.text.muted.light}
				keyboardType={integer ? 'number-pad' : 'decimal-pad'}
				style={{ flex: 1, fontSize: 14, color: colors.text.primary.light, padding: 0 }}
			/>
		</View>
	);
}

function parsePayments(value: unknown): ExtraPayment[] {
	if (!value || typeof value !== 'string') return [];
	try {
		const parsed = JSON.parse(value);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map(p => ({
				paymentAmount: Number(p?.paymentAmount) || 0,
				startMonth: Number(p?.startMonth) || 1,
				endMonth: Number(p?.endMonth) || 1,
			}))
			.filter(Boolean);
	} catch {
		return [];
	}
}

function clampMonth(n: number, max?: number) {
	const value = Math.max(1, Math.floor(n) || 1);
	return max ? Math.min(value, max) : value;
}
