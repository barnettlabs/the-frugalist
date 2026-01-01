import React from 'react';
import { Text, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';

type LogoVariant = 'primary' | 'white' | 'black' | 'accent';
type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
} & Omit<TextProps, 'children'>;

const variantStyles: Record<LogoVariant, string> = {
  primary: 'text-primary-dark dark:text-charcoal-50',
  white: 'text-white',
  black: 'text-black',
  accent: 'text-accent dark:text-accent-light',
};

const sizeStyles: Record<LogoSize, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function Logo({ variant = 'primary', size = 'md', className, ...props }: LogoProps) {
  return (
    <Text
      className={`font-rubik-medium tracking-tight ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      thefrugalist
    </Text>
  );
}

cssInterop(Logo, { className: 'style' });
