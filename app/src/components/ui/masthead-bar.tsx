import * as React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface MastheadBarProps {
  /** Left slot text (defaults to app version label) */
  left?: React.ReactNode;
  /** Center tagline (defaults to "A field guide to what things should cost") */
  center?: string;
  /** Right slot — usually a count or a link */
  right?: React.ReactNode;
  /** Hide center text on narrow screens */
  hideCenterOnNarrow?: boolean;
}

/**
 * Editorial masthead bar — three sections separated by hairline rules.
 * Mirrors the web component. Center is absolute-positioned for true horizontal centering.
 */
export function MastheadBar({
  left = 'v 1.0.0',
  center = 'A field guide to what things should cost',
  right,
  hideCenterOnNarrow = false,
}: MastheadBarProps) {
  return (
    <View className="px-4 sm:px-6 lg:px-8">
      <View className="relative flex-row items-center justify-between border-y border-border-strong-light dark:border-border-strong-dark py-2 min-h-[2.25rem]">
        {/* Left */}
        <View className="z-10">
          {typeof left === 'string' ? (
            <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark font-mono">
              {left}
            </Text>
          ) : (
            left
          )}
        </View>

        {/* Center — absolutely positioned for true horizontal centering */}
        <View
          className={`absolute left-0 right-0 items-center ${hideCenterOnNarrow ? 'hidden sm:flex' : 'flex'}`}
          pointerEvents="none"
        >
          <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark text-center">
            {center}
          </Text>
        </View>

        {/* Right */}
        <View className="z-10">
          {typeof right === 'string' ? (
            <Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
              {right}
            </Text>
          ) : (
            right ?? null
          )}
        </View>
      </View>
    </View>
  );
}
