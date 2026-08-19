import '@shopify/flash-list/jestSetup';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import type { RenderOptions } from '@testing-library/react-native';
import { render, userEvent } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Static metrics so components calling useSafeAreaInsets() render synchronously
// in tests instead of waiting on a native measurement that never arrives.
const initialMetrics = {
	frame: { x: 0, y: 0, width: 390, height: 844 },
	insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const createAppWrapper = () => {
	return ({ children }: { children: React.ReactNode }) => (
		<SafeAreaProvider initialMetrics={initialMetrics}>
			<BottomSheetModalProvider>
				<NavigationContainer>{children}</NavigationContainer>
			</BottomSheetModalProvider>
		</SafeAreaProvider>
	);
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
	const Wrapper = createAppWrapper(); // make sure we have a new wrapper for each render
	return render(ui, { wrapper: Wrapper, ...options });
};

// use this if you want to test user events
export const setup = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
	const Wrapper = createAppWrapper();
	return {
		user: userEvent.setup(),
		...render(ui, { wrapper: Wrapper, ...options }),
	};
};

export * from '@testing-library/react-native';
export { customRender as render };
