import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

interface ChevronProps extends SvgProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: number;
}

const rotations = {
  down: 0,
  up: 180,
  right: -90,
  left: 90,
};

export const Chevron = ({
  direction = 'down',
  size = 20,
  color,
  ...props
}: ChevronProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: [{ rotate: `${rotations[direction]}deg` }] }}
    {...props}
  >
    <Path
      d="M6 9l6 6 6-6"
      stroke={color || 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
