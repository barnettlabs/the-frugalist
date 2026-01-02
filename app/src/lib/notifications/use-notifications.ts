import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/lib';

import { useRegisterDevice } from '@/api/devices';

import {
  getDeviceName,
  getDeviceType,
  registerForPushNotifications,
  setupNotificationChannel,
} from './index';

export type NotificationState = {
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
};

/**
 * Hook to manage push notification registration and handling.
 * Automatically registers for push notifications when the user is authenticated.
 */
export function useNotifications() {
  const { status } = useAuth();
  const registerDevice = useRegisterDevice();

  const [state, setState] = useState<NotificationState>({
    isRegistered: false,
    isLoading: false,
    error: null,
    token: null,
  });

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const hasRegistered = useRef(false);

  const register = useCallback(async () => {
    if (state.isLoading || hasRegistered.current) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Setup notification channels for Android
      await setupNotificationChannel();

      // Request permission and get push token
      const result = await registerForPushNotifications();

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error,
        }));
        return;
      }

      // Register the device token with the API
      await registerDevice.mutateAsync({
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
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  }, [state.isLoading, registerDevice]);

  // Auto-register when user is authenticated
  useEffect(() => {
    if (status === 'signIn' && !hasRegistered.current) {
      register();
    }
  }, [status, register]);

  // Setup notification listeners
  useEffect(() => {
    // Listener for when a notification is received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

    // Listener for when a user taps on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);

        // Handle navigation based on notification type
        if (data.type === 'price_alert' && data.tracked_product_id) {
          // TODO: Navigate to the tracked product details
          // router.push(`/tracker/${data.tracked_product_id}`);
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
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
