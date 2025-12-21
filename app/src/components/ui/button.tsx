import React from 'react';
import type { PressableProps, View } from 'react-native';
import { ActivityIndicator, Pressable } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import { Text } from './text';

const button = tv({
  slots: {
    container: 'my-2 flex flex-row items-center justify-center rounded-md px-4',
    // Clean button text with subtle letter-spacing
    label: 'text-sm font-semibold tracking-wide',
    indicator: 'h-6 text-white',
  },

  variants: {
    variant: {
      default: {
        // Primary blue button
        container: 'bg-primary active:bg-primary-dark',
        label: 'text-white',
        indicator: 'text-white',
      },
      secondary: {
        // Secondary green variant
        container: 'bg-secondary active:bg-secondary-dark',
        label: 'text-white',
        indicator: 'text-white',
      },
      outline: {
        // Bordered button with transparent background
        container:
          'border border-primary bg-transparent active:bg-primary/10 dark:border-primary-light dark:active:bg-primary/20',
        label: 'text-primary dark:text-primary-light',
        indicator: 'text-primary dark:text-primary-light',
      },
      'outline-secondary': {
        // Secondary outline
        container:
          'border border-secondary bg-transparent active:bg-secondary/10 dark:border-secondary-light dark:active:bg-secondary/20',
        label: 'text-secondary dark:text-secondary-light',
        indicator: 'text-secondary dark:text-secondary-light',
      },
      destructive: {
        container: 'bg-danger-600 active:bg-danger-700',
        label: 'text-white',
        indicator: 'text-white',
      },
      ghost: {
        container: 'bg-transparent active:bg-charcoal-100 dark:active:bg-charcoal-800',
        label: 'text-charcoal-700 dark:text-charcoal-200',
        indicator: 'text-charcoal-700 dark:text-charcoal-200',
      },
      link: {
        container: 'bg-transparent',
        label: 'text-primary dark:text-primary-light',
        indicator: 'text-primary',
      },
      // Glassy button for dark backgrounds
      glass: {
        container: 'border border-white/20 bg-white/10 backdrop-blur-md active:bg-white/20',
        label: 'text-white',
        indicator: 'text-white',
      },
    },
    size: {
      default: {
        container: 'h-11 px-5',
        label: 'text-sm',
      },
      lg: {
        container: 'h-13 px-8',
        label: 'text-base',
      },
      sm: {
        container: 'h-9 px-4',
        label: 'text-xs',
        indicator: 'h-2',
      },
      icon: { container: 'size-10' },
    },
    disabled: {
      true: {
        container: 'bg-charcoal-200 dark:bg-charcoal-700',
        label: 'text-charcoal-400 dark:text-charcoal-500',
        indicator: 'text-charcoal-400 dark:text-charcoal-500',
      },
    },
    fullWidth: {
      true: {
        container: '',
      },
      false: {
        container: 'self-center',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    disabled: false,
    fullWidth: true,
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof button>;
interface Props extends ButtonVariants, Omit<PressableProps, 'disabled'> {
  label?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button = React.forwardRef<View, Props>(
  (
    {
      label: text,
      loading = false,
      variant = 'default',
      disabled = false,
      size = 'default',
      className = '',
      testID,
      textClassName = '',
      ...props
    },
    ref
  ) => {
    const styles = React.useMemo(
      () =>
        button({
          variant,
          // disabled,
          size,
        }),
      [variant, disabled, size]
    );

    return (
      <Pressable
        disabled={disabled || loading}
        className={styles.container({ className })}
        {...props}
        ref={ref}
        testID={testID}
      >
        {props.children ? (
          props.children
        ) : (
          <>
            {loading ? (
              <ActivityIndicator
                size="small"
                className={styles.indicator()}
                testID={testID ? `${testID}-activity-indicator` : undefined}
              />
            ) : (
              <Text
                testID={testID ? `${testID}-label` : undefined}
                className={styles.label({ className: textClassName })}
              >
                {text}
              </Text>
            )}
          </>
        )}
      </Pressable>
    );
  }
);
