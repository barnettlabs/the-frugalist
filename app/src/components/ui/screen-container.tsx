import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { tw } from './theme';

interface ScreenContainerProps extends ViewProps {
	children: React.ReactNode;
	withDots?: boolean;
}

export function ScreenContainer({ children, withDots = true, className, style, ...props }: ScreenContainerProps) {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	// Warm dot pattern matching the web's editorial parchment surface.
	// Light: navy at low opacity over parchment. Dark: signal-light over deep ink.
	const dotColor = isDark ? 'rgba(230, 178, 90, 0.10)' : 'rgba(35, 88, 146, 0.08)';

	return (
		<View className={`flex-1 ${tw.pageBg} ${className ?? ''}`} style={style} {...props}>
			{withDots && (
				<View style={StyleSheet.absoluteFill} pointerEvents="none">
					<Svg width="100%" height="100%">
						<Defs>
							<Pattern id="dotPattern" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
								<Circle cx="1.5" cy="1.5" r="1" fill={dotColor} />
							</Pattern>
						</Defs>
						<Rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
					</Svg>
				</View>
			)}
			{children}
		</View>
	);
}
