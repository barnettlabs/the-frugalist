import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export type PushTokenResult = { success: true; token: string } | { success: false; error: string };

/**
 * Request notification permissions and get the Expo push token.
 * Returns the push token if successful, or an error message.
 */
export async function registerForPushNotifications(): Promise<PushTokenResult> {
	// Must be a physical device
	if (!Device.isDevice) {
		return {
			success: false,
			error: 'Push notifications require a physical device',
		};
	}

	// Check existing permission status
	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	// Request permission if not already granted
	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		return {
			success: false,
			error: 'Permission to receive push notifications was denied',
		};
	}

	// Get the project ID for Expo push notifications
	const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

	if (!projectId) {
		return {
			success: false,
			error: 'Project ID not found. Make sure EAS is configured.',
		};
	}

	try {
		const pushTokenData = await Notifications.getExpoPushTokenAsync({
			projectId,
		});
		return {
			success: true,
			token: pushTokenData.data,
		};
	} catch (error) {
		return {
			success: false,
			error: `Failed to get push token: ${error}`,
		};
	}
}

/**
 * Setup Android notification channel (required for Android 8+)
 */
export async function setupNotificationChannel(): Promise<void> {
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', {
			name: 'Default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#235892',
		});

		await Notifications.setNotificationChannelAsync('price-alerts', {
			name: 'Price Alerts',
			description: 'Notifications for price drops and target prices',
			importance: Notifications.AndroidImportance.HIGH,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#F2A541',
		});
	}
}

/**
 * Get the device type for registration
 */
export function getDeviceType(): 'ios' | 'android' | 'web' {
	if (Platform.OS === 'ios') return 'ios';
	if (Platform.OS === 'android') return 'android';
	return 'web';
}

/**
 * Get a display name for the current device
 */
export function getDeviceName(): string {
	const deviceName = Device.deviceName;
	const modelName = Device.modelName;

	if (deviceName) {
		return deviceName;
	}

	if (modelName) {
		return `${modelName} (${Platform.OS})`;
	}

	return `${Platform.OS} device`;
}

export { Notifications };
