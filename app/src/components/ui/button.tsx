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
        // Primary ink button (editorial palette)
        container: 'bg-primary active:bg-primary-light',
        label: 'text-surface-light',
        indicator: 'text-surface-light',
      },
      secondary: {
        // Secondary uses brand navy (renamed from teal)
        container: 'bg-accent active:bg-accent-dark',
        label: 'text-surface-light',
        indicator: 'text-surface-light',
      },
      signal: {
        // Marigold signal accent (savings, success moments)
        container: 'bg-signal active:bg-signal-dark',
        label: 'text-surface-light',
        indicator: 'text-surface-light',
      },
      outline: {
        container:
          'border border-primary bg-transparent active:bg-primary/5 dark:border-text-primary-dark dark:active:bg-text-primary-dark/10',
        label: 'text-primary dark:text-text-primary-dark',
        indicator: 'text-primary dark:text-text-primary-dark',
      },
      'outline-secondary': {
        container:
          'border border-accent bg-transparent active:bg-accent/10 dark:border-accent-light dark:active:bg-accent-light/10',
        label: 'text-accent dark:text-accent-light',
        indicator: 'text-accent dark:text-accent-light',
      },
      destructive: {
        container: 'bg-danger active:bg-danger-700',
        label: 'text-surface-light',
        indicator: 'text-surface-light',
      },
      ghost: {
        container: 'bg-transparent active:bg-tan-light dark:active:bg-charcoal-800',
        label: 'text-text-muted-light dark:text-text-muted-dark',
        indicator: 'text-text-muted-light dark:text-text-muted-dark',
      },
      link: {
        container: 'bg-transparent',
        label: 'text-primary dark:text-text-primary-dark underline',
        indicator: 'text-primary',
      },
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
        container: 'bg-tan dark:bg-charcoal-700',
        label: 'text-text-muted-light dark:text-text-muted-dark',
        indicator: 'text-text-muted-light dark:text-text-muted-dark',
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
