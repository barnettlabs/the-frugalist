// Import  global CSS file
import '../../global.css';

import {
	Fraunces_400Regular,
	Fraunces_500Medium,
	Fraunces_500Medium_Italic,
	Fraunces_600SemiBold,
	Fraunces_600SemiBold_Italic,
} from '@expo-google-fonts/fraunces';
import {
	JetBrainsMono_400Regular,
	JetBrainsMono_500Medium,
	JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider, KeyboardToolbar } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
	initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
	duration: 500,
	fade: true,
});

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		// Editorial display serif (Fraunces)
		Fraunces_400Regular,
		Fraunces_500Medium,
		Fraunces_500Medium_Italic,
		Fraunces_600SemiBold,
		Fraunces_600SemiBold_Italic,
		// Tabular monospace (JetBrains Mono)
		JetBrainsMono_400Regular,
		JetBrainsMono_500Medium,
		JetBrainsMono_600SemiBold,
	});

	// Don't block on fonts — the platform serif/mono fallbacks render fine
	// while the bundled fonts hydrate. Splash hides on (app) layout once auth
	// resolves, so showing the splash a beat longer until fonts load is OK.
	if (!fontsLoaded) return null;

	return (
		<Providers>
			<Stack>
				<Stack.Screen name="(app)" options={{ headerShown: false }} />
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				<Stack.Screen name="onboarding" options={{ headerShown: false }} />
				<Stack.Screen name="login" options={{ headerShown: false }} />
			</Stack>
			<KeyboardToolbar />
		</Providers>
	);
}

function Providers({ children }: { children: React.ReactNode }) {
	const theme = useThemeConfig();
	return (
		<GestureHandlerRootView style={styles.container} className={theme.dark ? `dark` : undefined}>
			<KeyboardProvider>
				<ThemeProvider value={theme}>
					<APIProvider>
						<BottomSheetModalProvider>
							{children}
							<FlashMessage position="top" />
						</BottomSheetModalProvider>
					</APIProvider>
				</ThemeProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
