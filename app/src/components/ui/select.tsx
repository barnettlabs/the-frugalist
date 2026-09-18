import { Image } from 'expo-image';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { Animated, Dimensions, Easing, FlatList, Modal as RNModal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { tv } from 'tailwind-variants';

import colors from '@/components/ui/colors';
import { CaretDown } from '@/components/ui/icons';

import type { InputControllerType } from './input';
import { Text } from './text';

const selectTv = tv({
	slots: {
		container: 'mb-4',
		label: 'mb-1.5 text-sm font-medium text-text-primary-light dark:text-text-primary-dark',
		input:
			'mt-0 flex-row items-center rounded-md border border-border-light bg-surface-light px-4 py-3.5 dark:border-border-dark dark:bg-surface-dark',
		inputValue: 'text-base text-text-primary-light dark:text-text-primary-dark',
		inputPlaceholder: 'text-base text-text-muted-light dark:text-text-muted-dark',
	},
	variants: {
		focused: {
			true: {
				input: 'border-accent dark:border-accent-light',
			},
		},
		error: {
			true: {
				input: 'border-danger dark:border-danger',
				label: 'text-danger dark:text-danger',
				inputValue: 'text-danger',
			},
		},
		disabled: {
			true: {
				input: 'bg-surface-dark-light opacity-60 dark:bg-surface-dark-dark',
			},
		},
	},
	defaultVariants: {
		error: false,
		disabled: false,
	},
});

export type OptionType = {
	label: string;
	value: string | number;
	description?: string;
	icon?: React.ReactNode;
	image?: string;
};

export interface SelectProps {
	value?: string | number;
	label?: string;
	disabled?: boolean;
	error?: string;
	options?: OptionType[];
	onSelect?: (value: string | number) => void;
	placeholder?: string;
	testID?: string;
	title?: string;
}

interface ControlledSelectProps<T extends FieldValues> extends SelectProps, InputControllerType<T> {}

export const Select = (props: SelectProps) => {
	const {
		label,
		value,
		error,
		options = [],
		placeholder = 'Select an option…',
		disabled = false,
		onSelect,
		testID,
		title,
	} = props;
	const [open, setOpen] = React.useState(false);

	const handleSelect = React.useCallback(
		(option: OptionType) => {
			onSelect?.(option.value);
			setOpen(false);
		},
		[onSelect]
	);

	const styles = React.useMemo(
		() =>
			selectTv({
				error: Boolean(error),
				disabled,
			}),
		[error, disabled]
	);

	const selectedOption = React.useMemo(() => options?.find(t => t.value === value), [value, options]);

	const isPlaceholder = value === undefined || !selectedOption;

	return (
		<>
			<View className={styles.container()}>
				{label && (
					<Text testID={testID ? `${testID}-label` : undefined} className={styles.label()}>
						{label}
					</Text>
				)}
				<Pressable
					className={styles.input()}
					disabled={disabled}
					onPress={() => setOpen(true)}
					testID={testID ? `${testID}-trigger` : undefined}
				>
					{selectedOption?.icon && (
						<View className="mr-3">
							<View className="size-8 items-center justify-center rounded-md bg-tan-light dark:bg-charcoal-800">
								{selectedOption.icon}
							</View>
						</View>
					)}
					{selectedOption?.image && (
						<Image source={{ uri: selectedOption.image }} className="mr-3 size-8 rounded-md" contentFit="cover" />
					)}
					<View className="flex-1">
						<Text className={isPlaceholder ? styles.inputPlaceholder() : styles.inputValue()}>
							{selectedOption?.label ?? placeholder}
						</Text>
					</View>
					<View className="ml-2 size-8 items-center justify-center rounded-md">
						<CaretDown color={colors.text.muted.light} />
					</View>
				</Pressable>
				{error && (
					<Text testID={`${testID}-error`} className="mt-1.5 text-xs text-danger">
						{error}
					</Text>
				)}
			</View>

			<SelectSheet
				visible={open}
				onClose={() => setOpen(false)}
				title={title ?? label}
				options={options}
				value={value}
				onSelect={handleSelect}
				testID={testID}
			/>
		</>
	);
};

export function ControlledSelect<T extends FieldValues>(props: ControlledSelectProps<T>) {
	const { name, control, rules, onSelect: onNSelect, ...selectProps } = props;
	const { field, fieldState } = useController({ control, name, rules });
	const onSelect = React.useCallback(
		(value: string | number) => {
			field.onChange(value);
			onNSelect?.(value);
		},
		[field, onNSelect]
	);
	return <Select onSelect={onSelect} value={field.value} error={fieldState.error?.message} {...selectProps} />;
}

// ---------------------------------------------------------------------------
// SelectSheet — a full-screen RN Modal that slides a sheet up from the bottom.
// Renders above iOS modal navigation bars (unlike @gorhom/bottom-sheet which is
// scoped to its provider).
// ---------------------------------------------------------------------------

type SelectSheetProps = {
	visible: boolean;
	onClose: () => void;
	options: OptionType[];
	value?: string | number;
	onSelect: (option: OptionType) => void;
	title?: string;
	testID?: string;
};

export const SelectSheet: React.FC<SelectSheetProps> = ({
	visible,
	onClose,
	options,
	value,
	onSelect,
	title,
	testID,
}) => {
	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const screenHeight = Dimensions.get('window').height;

	const slideY = React.useRef(new Animated.Value(screenHeight)).current;
	const backdropOpacity = React.useRef(new Animated.Value(0)).current;

	const hasExtended = options.some(o => o.description || o.icon || o.image);
	const itemHeight = hasExtended ? 68 : 56;
	const headerHeight = title ? 60 : 32;
	const minHeight = 320;
	const maxHeight = Math.min(screenHeight * 0.7, 560);
	const naturalHeight = options.length * itemHeight + headerHeight + insets.bottom + 24;
	const sheetHeight = Math.max(minHeight, Math.min(naturalHeight, maxHeight));

	React.useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.timing(backdropOpacity, {
					toValue: 1,
					duration: 220,
					useNativeDriver: true,
				}),
				Animated.timing(slideY, {
					toValue: 0,
					duration: 280,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
			]).start();
		} else {
			slideY.setValue(screenHeight);
			backdropOpacity.setValue(0);
		}
	}, [visible, screenHeight, slideY, backdropOpacity]);

	const handleClose = () => {
		Animated.parallel([
			Animated.timing(backdropOpacity, {
				toValue: 0,
				duration: 180,
				useNativeDriver: true,
			}),
			Animated.timing(slideY, {
				toValue: screenHeight,
				duration: 220,
				easing: Easing.in(Easing.cubic),
				useNativeDriver: true,
			}),
		]).start(() => {
			onClose();
		});
	};

	return (
		<RNModal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
			<View style={{ flex: 1 }}>
				{/* Backdrop */}
				<Animated.View
					style={{
						...StyleAbsoluteFill,
						backgroundColor: 'rgba(15, 18, 28, 0.55)',
						opacity: backdropOpacity,
					}}
				>
					<Pressable style={{ flex: 1 }} onPress={handleClose} />
				</Animated.View>

				{/* Sheet */}
				<Animated.View
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						height: sheetHeight,
						backgroundColor: isDark ? colors.surface.dark : colors.surface.light,
						borderTopLeftRadius: 16,
						borderTopRightRadius: 16,
						transform: [{ translateY: slideY }],
						shadowColor: '#000',
						shadowOffset: { width: 0, height: -2 },
						shadowOpacity: 0.18,
						shadowRadius: 20,
						elevation: 24,
						overflow: 'hidden',
					}}
				>
					{/* Grabber */}
					<View className="items-center pb-2 pt-3">
						<View
							className="h-1 w-12 rounded-full"
							style={{ backgroundColor: isDark ? colors.border.dark : colors.border.light }}
						/>
					</View>

					{/* Header */}
					<View
						className="flex-row items-center justify-between border-b px-5 pb-4 pt-2"
						style={{ borderColor: isDark ? colors.border.dark : colors.border.light }}
					>
						<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
							{title ?? 'Choose'}
						</Text>
						<Pressable onPress={handleClose} hitSlop={12} className="active:opacity-60" accessibilityLabel="close">
							<Text className="text-[11px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
								Done
							</Text>
						</Pressable>
					</View>

					{/* List */}
					<FlatList
						data={options}
						keyExtractor={item => `select-item-${item.value}`}
						contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
						renderItem={({ item }) => (
							<Option
								option={item}
								selected={item.value === value}
								onPress={() => onSelect(item)}
								testID={testID ? `${testID}-item-${item.value}` : undefined}
							/>
						)}
					/>
				</Animated.View>
			</View>
		</RNModal>
	);
};

const StyleAbsoluteFill = {
	position: 'absolute' as const,
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
};

type OptionProps = {
	option: OptionType;
	selected?: boolean;
	onPress: () => void;
	testID?: string;
};

const Option = React.memo(({ option, selected = false, onPress, testID }: OptionProps) => {
	const hasExtended = option.description || option.icon || option.image;
	return (
		<Pressable
			onPress={onPress}
			testID={testID}
			className={`mx-3 my-0.5 flex-row items-center rounded-md px-4 ${hasExtended ? 'py-3' : 'py-3.5'} ${
				selected ? 'bg-tan-light dark:bg-charcoal-800' : 'active:bg-tan-light dark:active:bg-charcoal-800'
			}`}
		>
			{(option.icon || option.image) && (
				<View className="mr-3">
					{option.icon ? (
						<View className="size-10 items-center justify-center rounded-md bg-tan-light dark:bg-charcoal-800">
							{option.icon}
						</View>
					) : option.image ? (
						<Image source={{ uri: option.image }} className="size-10 rounded-md" contentFit="cover" />
					) : null}
				</View>
			)}

			<View className="flex-1">
				<Text
					className={`text-base ${
						selected
							? 'font-semibold text-text-primary-light dark:text-text-primary-dark'
							: 'text-text-primary-light dark:text-text-primary-dark'
					}`}
				>
					{option.label}
				</Text>
				{option.description && (
					<Text className="mt-0.5 text-sm text-text-muted-light dark:text-text-muted-dark">{option.description}</Text>
				)}
			</View>

			{selected && (
				<View className="ml-3 size-6 items-center justify-center rounded-full bg-primary dark:bg-text-primary-dark">
					<Check />
				</View>
			)}
		</Pressable>
	);
});
Option.displayName = 'SelectOption';

const Check = ({ ...props }: SvgProps) => (
	<Svg width={14} height={14} fill="none" viewBox="0 0 24 24" {...props}>
		<Path
			d="m20.256 6.75-10.5 10.5L4.506 12"
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
			stroke="white"
		/>
	</Svg>
);

// Backwards-compat exports — older code expects `Options` to exist.
export const Options = SelectSheet;
