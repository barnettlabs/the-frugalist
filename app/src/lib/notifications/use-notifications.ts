import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useRegisterDevice } from '@/api/devices';

import { getDeviceName, getDeviceType, registerForPushNotifications, setupNotificationChannel } from './index';

export type NotificationState = {
	isRegistered: boolean;
	isLoading: boolean;
	error: string | null;
	token: string | null;
};

/**
 * Hook to manage push notification registration and handling.
 * Call `register()` explicitly when you want to request notification permissions
 * (e.g., when user enables a feature that needs notifications).
 */
export function useNotifications() {
	const registerDeviceMutation = useRegisterDevice();
	const registerDeviceRef = useRef(registerDeviceMutation);
	registerDeviceRef.current = registerDeviceMutation;

	const [state, setState] = useState<NotificationState>({
		isRegistered: false,
		isLoading: false,
		error: null,
		token: null,
	});

	const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
	const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);
	const hasRegistered = useRef(false);

	const register = useCallback(async () => {
		if (hasRegistered.current) return;

		setState(prev => {
			if (prev.isLoading) return prev;
			return { ...prev, isLoading: true, error: null };
		});

		try {
			// Setup notification channels for Android
			await setupNotificationChannel();

			// Request permission and get push token
			const result = await registerForPushNotifications();

			if (!result.success) {
				setState(prev => ({
					...prev,
					isLoading: false,
					error: result.error,
				}));
				return;
			}

			// Register the device token with the API
			await registerDeviceRef.current.mutateAsync({
				push_token: result.token,
				device_type: getDeviceType(),
				device_name: getDeviceName(),
			});

			hasRegistered.current = true;
			setState({
				isRegistered: true,
				isLoading: false,
				error: null,
				token: result.token,
			});
		} catch (error) {
			setState(prev => ({
				...prev,
				isLoading: false,
				error: error instanceof Error ? error.message : 'Registration failed',
			}));
		}
	}, []);

	// Setup notification listeners
	useEffect(() => {
		// Listener for when a notification is received while app is foregrounded
		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
			console.log('Notification received:', notification);
		});

		// Listener for when a user taps on a notification
		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			const data = response.notification.request.content.data;
			console.log('Notification tapped:', data);

			// Handle navigation based on notification type
			if (data.type === 'price_alert' && data.tracked_product_id) {
				router.push(`/watch/${data.tracked_product_id}?from=notification`);
			}
		});

		return () => {
			if (notificationListener.current) {
				Notifications.removeNotificationSubscription(notificationListener.current);
			}
			if (responseListener.current) {
				Notifications.removeNotificationSubscription(responseListener.current);
			}
		};
	}, []);

	return {
		...state,
		register,
	};
}
