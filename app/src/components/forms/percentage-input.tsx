import * as React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { I18nManager, StyleSheet, TextInput as NTextInput, View } from 'react-native';
import { tv } from 'tailwind-variants';

import colors from '@/components/ui/colors';
import { Text } from '@/components/ui/text';
import { parseOrZero } from '@/lib/calculators/formatters';

const inputTv = tv({
	slots: {
		container: 'mb-2',
		label: 'text-grey-100 mb-1 text-lg dark:text-neutral-100',
		inputContainer:
			'mt-0 flex-row items-center rounded-xl border-[0.5px] border-neutral-300 bg-neutral-100 dark:border-charcoal-700 dark:bg-charcoal-800',
		input: 'flex-1 py-3 pl-4 font-inter text-base font-medium leading-5 dark:text-white',
		suffix: 'pl-2 pr-4 text-base font-medium text-neutral-500 dark:text-neutral-400',
	},
	variants: {
		focused: {
			true: {
				inputContainer: 'border-neutral-400 dark:border-neutral-300',
			},
		},
		error: {
			true: {
				inputContainer: 'border-danger-600',
				label: 'text-danger-600 dark:text-danger-600',
			},
		},
	},
});

interface PercentageInputProps<T extends FieldValues> {
	name: Path<T>;
	control: Control<T>;
	label?: string;
	placeholder?: string;
	testID?: string;
	decimals?: number;
}

export function PercentageInput<T extends FieldValues>({
	name,
	control,
	label,
	placeholder = '0.00',
	testID,
	decimals = 2,
}: PercentageInputProps<T>) {
	const { field, fieldState } = useController({ control, name });
	const [isFocused, setIsFocused] = React.useState(false);
	const [displayValue, setDisplayValue] = React.useState('');

	// Format initial value
	const initialValue = React.useRef(field.value);
	const initialDecimals = React.useRef(decimals);
	React.useEffect(() => {
		const numValue = parseOrZero(initialValue.current);
		if (numValue > 0) {
			setDisplayValue(numValue.toFixed(initialDecimals.current));
		}
	}, []);

	const handleFocus = () => {
		setIsFocused(true);
		const numValue = parseOrZero(field.value);
		setDisplayValue(numValue > 0 ? numValue.toString() : '');
	};

	const handleBlur = () => {
		setIsFocused(false);
		const numValue = parseOrZero(displayValue);
		field.onChange(numValue);
		setDisplayValue(numValue > 0 ? numValue.toFixed(decimals) : '');
		field.onBlur();
	};

	const handleChangeText = (text: string) => {
		// Allow only numbers and decimal point
		const cleaned = text.replace(/[^0-9.]/g, '');
		const parts = cleaned.split('.');
		const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
		setDisplayValue(formatted);
		field.onChange(parseOrZero(formatted));
	};

	const styles = inputTv({
		error: Boolean(fieldState.error),
		focused: isFocused,
	});

	return (
		<View className={styles.container()}>
			{label && (
				<Text testID={testID ? `${testID}-label` : undefined} className={styles.label()}>
					{label}
				</Text>
			)}
			<View className={styles.inputContainer()}>
				<NTextInput
					testID={testID}
					ref={field.ref}
					value={displayValue}
					onChangeText={handleChangeText}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={placeholder}
					placeholderTextColor={colors.neutral[400]}
					keyboardType="decimal-pad"
					className={styles.input()}
					style={StyleSheet.flatten([
						{ writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
						{ textAlign: I18nManager.isRTL ? 'right' : 'left' },
					])}
				/>
				<Text className={styles.suffix()}>%</Text>
			</View>
			{fieldState.error && (
				<Text className="text-sm text-danger-400 dark:text-danger-600">{fieldState.error.message}</Text>
			)}
		</View>
	);
}
