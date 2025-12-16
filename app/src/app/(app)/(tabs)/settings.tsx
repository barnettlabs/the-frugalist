import { Env } from '@env';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/api/auth/use-profile';
import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  Button,
  colors,
  FocusAwareStatusBar,
  Pressable,
  ScreenContainer,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Bell, Bug, Logout, Rate, Share, Support, User, Website } from '@/components/ui/icons';
import { translate, useAuth } from '@/lib';
import { openLinkInBrowser } from '@/lib/utils';

// Developer emails that can access debug features
const DEV_EMAILS = ['jason.barnett@jaytech.io'];

function isDevUser(email: string | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();

  // Strip out +alias from email (e.g., jason.barnett+test@jaytech.io -> jason.barnett@jaytech.io)
  const baseEmail = normalizedEmail.replace(/\+[^@]*@/, '@');

  return DEV_EMAILS.some(devEmail => baseEmail === devEmail.toLowerCase());
}

export default function Settings() {
  const signOut = useAuth.use.signOut();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const { data: profile } = useProfile();

  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const dangerColor = colors.danger[500];

  // Account for floating tab bar
  const bottomPadding = Math.max(insets.bottom, 16) + 80;

  const showDebug = isDevUser(profile?.email);

  return (
    <ScreenContainer>
      <FocusAwareStatusBar />

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding }}>
        <View className="flex-1 px-4 pt-4">
          {/* Profile Header Card */}
          <ProfileCard profile={profile} isDark={isDark} />

          {/* Account Section */}
          <ItemsContainer title="settings.account">
            <Item text="settings.profile" icon={<User color={iconColor} />} onPress={() => router.push('/profile')} />
          </ItemsContainer>

          {/* Preferences Section */}
          <ItemsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          {/* About Section */}
          <ItemsContainer title="settings.about">
            <Item text="settings.app_name" value={Env.NAME} />
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          {/* Support Section */}
          <ItemsContainer title="settings.support_us">
            <Item text="settings.share" icon={<Share color={iconColor} />} onPress={() => {}} />
            <Item text="settings.rate" icon={<Rate color={iconColor} />} onPress={() => {}} />
            <Item text="settings.support" icon={<Support color={iconColor} />} onPress={() => {}} />
          </ItemsContainer>

          {/* Links Section */}
          <ItemsContainer title="settings.links">
            <Item
              text="settings.website"
              icon={<Website color={iconColor} />}
              onPress={() => openLinkInBrowser('https://sneakysalesman.com')}
            />
            <Item text="settings.privacy" onPress={() => openLinkInBrowser('https://sneakysalesman.com/privacy')} />
            <Item text="settings.terms" onPress={() => openLinkInBrowser('https://sneakysalesman.com/terms')} />
          </ItemsContainer>

          {/* Debug Section - Only for developers */}
          {showDebug && <DebugSection iconColor={iconColor} />}

          {/* Logout Section */}
          <View className="my-8">
            <ItemsContainer>
              <Item text="settings.logout" icon={<Logout color={dangerColor} />} onPress={signOut} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProfileCard({
  profile,
  isDark,
}: {
  profile: { first_name: string; last_name: string; email: string } | undefined;
  isDark: boolean;
}) {
  const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '?';

  return (
    <Pressable
      onPress={() => router.push('/profile')}
      className="mb-4 flex-row items-center rounded-xl bg-white p-4 dark:bg-neutral-800"
    >
      {/* Avatar */}
      <View
        className={`size-16 items-center justify-center rounded-full ${isDark ? 'bg-primary-700' : 'bg-primary-100'}`}
      >
        <Text className={`text-xl font-bold ${isDark ? 'text-primary-200' : 'text-primary-700'}`}>{initials}</Text>
      </View>

      {/* Info */}
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
          {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{profile?.email || ''}</Text>
        <Text className="mt-1 text-xs text-primary-600 dark:text-primary-400">View Profile</Text>
      </View>
    </Pressable>
  );
}

function DebugSection({ iconColor }: { iconColor: string }) {
  const [isSending, setIsSending] = useState(false);

  const handleTestNotification = async () => {
    setIsSending(true);
    try {
      // Simulate a slight delay like a real notification would have
      await new Promise(resolve => setTimeout(resolve, 500));

      showMessage({
        message: 'Test Notification',
        description: 'This is a test notification to verify the notification system is working correctly.',
        type: 'info',
        duration: 4000,
        icon: 'info',
      });

      showMessage({
        message: 'Notification Sent',
        description: 'Local notification triggered successfully',
        type: 'success',
        duration: 2000,
      });
    } catch {
      showMessage({
        message: 'Error',
        description: 'Failed to send test notification',
        type: 'danger',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTestPriceAlert = () => {
    showMessage({
      message: 'Price Drop Alert!',
      description: 'MacBook Pro 14" dropped from $1,999 to $1,799 - 10% off!',
      type: 'success',
      duration: 5000,
    });
  };

  const handleTestError = () => {
    showMessage({
      message: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
      type: 'danger',
      duration: 5000,
    });
  };

  return (
    <>
      <Text className="pb-2 pt-4 text-lg text-neutral-900 dark:text-white">Developer Tools</Text>
      <View className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
        <View className="border-b border-amber-200 p-3 dark:border-amber-800">
          <View className="flex-row items-center">
            <Bug color={colors.warning[600]} />
            <Text className="ml-2 font-medium text-amber-700 dark:text-amber-400">Debug Mode Enabled</Text>
          </View>
          <Text className="mt-1 text-xs text-amber-600 dark:text-amber-500">
            These tools are only visible to developer accounts
          </Text>
        </View>

        {/* Notification Testing */}
        <View className="p-4">
          <Text className="mb-3 font-semibold text-neutral-900 dark:text-white">Notification Testing</Text>

          <View className="gap-2">
            <Button
              label={isSending ? 'Sending...' : 'Test Info Notification'}
              variant="outline"
              onPress={handleTestNotification}
              disabled={isSending}
            />
            <Button label="Test Price Alert" variant="secondary" onPress={handleTestPriceAlert} />
            <Button label="Test Error Notification" variant="destructive" onPress={handleTestError} />
          </View>
        </View>

        {/* Additional Debug Info */}
        <View className="border-t border-amber-200 p-4 dark:border-amber-800">
          <Text className="mb-2 font-semibold text-neutral-900 dark:text-white">Environment Info</Text>
          <View className="gap-1">
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">App: {Env.NAME}</Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">Version: {Env.VERSION}</Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">Bundle ID: {Env.BUNDLE_ID}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
