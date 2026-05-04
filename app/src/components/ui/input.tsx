import * as React from 'react';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { I18nManager, StyleSheet, TextInput as NTextInput, View } from 'react-native';
import { tv } from 'tailwind-variants';

import colors from './colors';
import { Text } from './text';

const inputTv = tv({
  slots: {
    container: 'mb-4',
    label:
      'mb-1.5 text-sm font-medium text-text-primary-light dark:text-text-primary-dark',
    input:
      'mt-0 rounded-md border border-border-light bg-surface-light px-4 py-3.5 text-base font-normal leading-5 text-text-primary-light dark:border-border-dark dark:bg-surface-dark dark:text-text-primary-dark',
  },

  variants: {
    focused: {
      true: {
        // Brand navy focus
        input: 'border-accent dark:border-accent-light',
      },
    },
    error: {
      true: {
        input: 'border-danger dark:border-danger',
        label: 'text-danger dark:text-danger',
      },
    },
    disabled: {
      true: {
        input:
          'bg-surface-dark-light text-text-muted-light dark:bg-surface-dark-dark dark:text-text-muted-dark',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
  /** Render help text below the input (above the error if any) */
  helperText?: string;
}

type TRule<T extends FieldValues> =
  | Omit<RegisterOptions<T>, 'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>
  | undefined;

export type RuleType<T extends FieldValues> = { [name in keyof T]: TRule<T> };
export type InputControllerType<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: RuleType<T>;
};

interface ControlledInputProps<T extends FieldValues> extends NInputProps, InputControllerType<T> {}

export const Input = React.forwardRef<NTextInput, NInputProps>((props, ref) => {
  const { label, error, helperText, testID, ...inputProps } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);
  const onBlur = React.useCallback(() => setIsFocussed(false), []);
  const onFocus = React.useCallback(() => setIsFocussed(true), []);

  const styles = React.useMemo(
    () =>
      inputTv({
        error: Boolean(error),
        focused: isFocussed,
        disabled: Boolean(props.disabled),
      }),
    [error, isFocussed, props.disabled]
  );

  return (
    <View className={styles.container()}>
      {label && (
        <Text testID={testID ? `${testID}-label` : undefined} className={styles.label()}>
          {label}
        </Text>
      )}
      <NTextInput
        testID={testID}
        ref={ref}
        placeholderTextColor={colors.text.muted.light}
        className={styles.input()}
        onBlur={onBlur}
        onFocus={onFocus}
        {...inputProps}
        style={StyleSheet.flatten([
          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          { textAlign: I18nManager.isRTL ? 'right' : 'left' },
          inputProps.style,
        ])}
      />
      {helperText && !error && (
        <Text className="mt-1.5 text-xs text-text-muted-light dark:text-text-muted-dark">
          {helperText}
        </Text>
      )}
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="mt-1.5 text-xs text-danger"
        >
          {error}
        </Text>
      )}
    </View>
  );
});

// only used with react-hook-form
export function ControlledInput<T extends FieldValues>(props: ControlledInputProps<T>) {
  const { name, control, rules, ...inputProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  return (
    <Input
      ref={field.ref}
      autoCapitalize="none"
      onChangeText={field.onChange}
      value={(field.value as string) || ''}
      {...inputProps}
      error={fieldState.error?.message}
    />
  );
}
