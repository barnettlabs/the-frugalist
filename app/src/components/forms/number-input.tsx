import * as React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import {
  I18nManager,
  StyleSheet,
  TextInput as NTextInput,
  View,
} from 'react-native';
import { tv } from 'tailwind-variants';

import colors from '@/components/ui/colors';
import { Text } from '@/components/ui/text';
import { parseOrZero } from '@/lib/calculators/formatters';

const inputTv = tv({
  slots: {
    container: 'mb-2',
    label: 'text-grey-100 mb-1 text-lg dark:text-neutral-100',
    input:
      'mt-0 rounded-xl border-[0.5px] border-neutral-300 bg-neutral-100 px-4 py-3 font-inter text-base font-medium leading-5 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-white',
  },
  variants: {
    focused: {
      true: {
        input: 'border-neutral-400 dark:border-neutral-300',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600 dark:text-danger-600',
      },
    },
  },
});

interface NumberInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  testID?: string;
  suffix?: string;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
}

export function NumberInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = '0',
  testID,
  suffix,
  min,
  max,
  allowDecimals = false,
}: NumberInputProps<T>) {
  const { field, fieldState } = useController({ control, name });
  const [isFocused, setIsFocused] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState('');

  // Format initial value
  const initialValue = React.useRef(field.value);
  React.useEffect(() => {
    const numValue = parseOrZero(initialValue.current);
    if (numValue > 0) {
      setDisplayValue(numValue.toString());
    }
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    let numValue = parseOrZero(displayValue);

    // Apply min/max constraints
    if (min !== undefined && numValue < min) numValue = min;
    if (max !== undefined && numValue > max) numValue = max;

    field.onChange(numValue);
    setDisplayValue(numValue > 0 ? numValue.toString() : '');
    field.onBlur();
  };

  const handleChangeText = (text: string) => {
    // Allow only numbers and optionally decimal point
    const pattern = allowDecimals ? /[^0-9.]/g : /[^0-9]/g;
    const cleaned = text.replace(pattern, '');

    if (allowDecimals) {
      const parts = cleaned.split('.');
      const formatted =
        parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
      setDisplayValue(formatted);
      field.onChange(parseOrZero(formatted));
    } else {
      setDisplayValue(cleaned);
      field.onChange(parseInt(cleaned) || 0);
    }
  };

  const styles = inputTv({
    error: Boolean(fieldState.error),
    focused: isFocused,
  });

  return (
    <View className={styles.container()}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
        >
          {label}
          {suffix && (
            <Text className="text-neutral-500 dark:text-neutral-400">
              {' '}
              ({suffix})
            </Text>
          )}
        </Text>
      )}
      <NTextInput
        testID={testID}
        ref={field.ref}
        value={displayValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
        className={styles.input()}
        style={StyleSheet.flatten([
          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          { textAlign: I18nManager.isRTL ? 'right' : 'left' },
        ])}
      />
      {fieldState.error && (
        <Text className="text-sm text-danger-400 dark:text-danger-600">
          {fieldState.error.message}
        </Text>
      )}
    </View>
  );
}
