import { BottomSheetFlatList, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { Platform, View } from 'react-native';
import { Pressable } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { tv } from 'tailwind-variants';

import colors from '@/components/ui/colors';
import { CaretDown } from '@/components/ui/icons';

import type { InputControllerType } from './input';
import { Modal, useModal } from './modal';
import { Text } from './text';

const selectTv = tv({
  slots: {
    container: 'mb-3',
    label: 'mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200',
    input:
      'mt-0 flex-row items-center rounded-xl border border-neutral-200 bg-white px-4 py-3.5 dark:border-charcoal-600 dark:bg-charcoal-800',
    inputValue: 'text-base text-neutral-900 dark:text-white',
    inputPlaceholder: 'text-base text-neutral-400 dark:text-neutral-500',
  },
  variants: {
    focused: {
      true: {
        input: 'border-primary-400 dark:border-primary-500',
      },
    },
    error: {
      true: {
        input: 'border-danger-500 dark:border-danger-500',
        label: 'text-danger-600 dark:text-danger-400',
        inputValue: 'text-danger-600',
      },
    },
    disabled: {
      true: {
        input: 'bg-neutral-100 dark:bg-charcoal-700 opacity-60',
      },
    },
  },
  defaultVariants: {
    error: false,
    disabled: false,
  },
});

const List = Platform.OS === 'web' ? FlashList : BottomSheetFlatList;

export type OptionType = {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
};

type OptionsProps = {
  options: OptionType[];
  onSelect: (option: OptionType) => void;
  value?: string | number;
  testID?: string;
  title?: string;
};

function keyExtractor(item: OptionType) {
  return `select-item-${item.value}`;
}

export const Options = React.forwardRef<BottomSheetModal, OptionsProps>(
  ({ options, onSelect, value, testID, title }, ref) => {
    const hasExtendedContent = options.some(o => o.description || o.icon || o.image);
    const itemHeight = hasExtendedContent ? 72 : 56;
    const headerHeight = title ? 56 : 0;
    const height = Math.min(options.length * itemHeight + headerHeight + 40, 400);
    const snapPoints = React.useMemo(() => [height], [height]);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const renderSelectItem = React.useCallback(
      ({ item, index }: { item: OptionType; index: number }) => (
        <Option
          key={`select-item-${item.value}`}
          option={item}
          selected={value === item.value}
          onPress={() => onSelect(item)}
          testID={testID ? `${testID}-item-${item.value}` : undefined}
          isLast={index === options.length - 1}
        />
      ),
      [onSelect, value, testID, options.length]
    );

    const ListHeader = React.useCallback(
      () =>
        title ? (
          <View className="border-b border-neutral-100 px-5 pb-3 pt-1 dark:border-charcoal-700">
            <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-white">
              {title}
            </Text>
          </View>
        ) : null,
      [title]
    );

    return (
      <Modal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: isDark ? colors.charcoal[850] : colors.white,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? colors.charcoal[600] : colors.neutral[300],
          width: 40,
        }}
      >
        <List
          data={options}
          keyExtractor={keyExtractor}
          renderItem={renderSelectItem}
          ListHeaderComponent={ListHeader}
          testID={testID ? `${testID}-modal` : undefined}
          estimatedItemSize={itemHeight}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Modal>
    );
  }
);

type OptionProps = {
  option: OptionType;
  selected?: boolean;
  onPress: () => void;
  testID?: string;
  isLast?: boolean;
};

const Option = React.memo(({ option, selected = false, onPress, testID, isLast }: OptionProps) => {
  const hasExtendedContent = option.description || option.icon || option.image;

  return (
    <Pressable
      className={`mx-3 flex-row items-center rounded-xl px-4 ${hasExtendedContent ? 'py-3' : 'py-3.5'} ${
        selected
          ? 'bg-primary-50 dark:bg-primary-900/30'
          : 'active:bg-neutral-50 dark:active:bg-charcoal-700'
      } ${!isLast ? 'mb-1' : ''}`}
      onPress={onPress}
      testID={testID}
    >
      {(option.icon || option.image) && (
        <View className="mr-3">
          {option.icon ? (
            <View className="size-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-charcoal-700">
              {option.icon}
            </View>
          ) : option.image ? (
            <Image
              source={{ uri: option.image }}
              className="size-10 rounded-lg"
              contentFit="cover"
            />
          ) : null}
        </View>
      )}

      <View className="flex-1">
        <Text
          className={`text-base ${
            selected
              ? 'font-medium text-primary-700 dark:text-primary-300'
              : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {option.label}
        </Text>
        {option.description && (
          <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {option.description}
          </Text>
        )}
      </View>

      {selected && (
        <View className="ml-3 size-6 items-center justify-center rounded-full bg-primary-600 dark:bg-primary-500">
          <Check />
        </View>
      )}
    </Pressable>
  );
});

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
    placeholder = 'Select an option...',
    disabled = false,
    onSelect,
    testID,
    title,
  } = props;
  const modal = useModal();

  const onSelectOption = React.useCallback(
    (option: OptionType) => {
      onSelect?.(option.value);
      modal.dismiss();
    },
    [modal, onSelect]
  );

  const styles = React.useMemo(
    () =>
      selectTv({
        error: Boolean(error),
        disabled,
      }),
    [error, disabled]
  );

  const selectedOption = React.useMemo(
    () => options?.find(t => t.value === value),
    [value, options]
  );

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
          onPress={modal.present}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          {selectedOption?.icon && (
            <View className="mr-3">
              <View className="size-8 items-center justify-center rounded-md bg-neutral-100 dark:bg-charcoal-700">
                {selectedOption.icon}
              </View>
            </View>
          )}
          {selectedOption?.image && (
            <Image
              source={{ uri: selectedOption.image }}
              className="mr-3 size-8 rounded-md"
              contentFit="cover"
            />
          )}
          <View className="flex-1">
            <Text className={isPlaceholder ? styles.inputPlaceholder() : styles.inputValue()}>
              {selectedOption?.label ?? placeholder}
            </Text>
          </View>
          <View className="ml-2 size-8 items-center justify-center rounded-lg">
            <CaretDown color={colors.neutral[400]} />
          </View>
        </Pressable>
        {error && (
          <Text
            testID={`${testID}-error`}
            className="mt-1.5 text-sm text-danger-500 dark:text-danger-400"
          >
            {error}
          </Text>
        )}
      </View>
      <Options
        testID={testID}
        ref={modal.ref}
        options={options}
        onSelect={onSelectOption}
        value={value}
        title={title}
      />
    </>
  );
};

// only used with react-hook-form
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
  return (
    <Select
      onSelect={onSelect}
      value={field.value}
      error={fieldState.error?.message}
      {...selectProps}
    />
  );
}

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
