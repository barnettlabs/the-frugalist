import React from 'react';
import { Text, type TextProps } from 'react-native';
import { cssInterop, useColorScheme } from 'nativewind';

import { logoBlue, logoWhite } from '@/assets/logos';
import { Image } from './image';

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

type LogoImageVariant = 'default' | 'white' | 'auto';
type LogoImageSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type LogoImageProps = {
  variant?: LogoImageVariant;
  size?: LogoImageSize;
  className?: string;
};

const imageSizeStyles: Record<LogoImageSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
  '2xl': 'h-16 w-16',
};

export function LogoImage({ variant = 'default', size = 'lg', className }: LogoImageProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getLogoSource = () => {
    if (variant === 'auto') {
      return isDark ? logoWhite : logoBlue;
    }
    return variant === 'white' ? logoWhite : logoBlue;
  };

  return (
    <Image
      source={getLogoSource()}
      contentFit="contain"
      className={`${imageSizeStyles[size]} ${className || ''}`}
      placeholder={null}
    />
  );
}
