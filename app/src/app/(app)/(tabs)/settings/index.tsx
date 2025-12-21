import { Env } from '@env';
// TODO: Uncomment after rebuilding dev client
// import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { Platform, Share } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/api/auth/use-profile';
import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
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
import { Bug, Rate, Share as ShareIcon, Support, User, Website } from '@/components/ui/icons';
import { useAuth, useSelectedTheme } from '@/lib';
import type { ColorSchemeType } from '@/lib';
import { openLinkInBrowser } from '@/lib/utils';

// Developer emails that can access debug features
const DEV_EMAILS = ['jason.barnett@jaytech.io'];

function isDevUser(email: string | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
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

  // Account for floating tab bar
  const bottomPadding = Math.max(insets.bottom, 16) + 80;

  const showDebug = isDevUser(profile?.email);

  const handleShare = async () => {
    try {
      await Share.share({
        message: Platform.select({
          ios: 'Check out Sneaky Salesman - the ultimate car finance & lease calculator!',
          default: 'Check out Sneaky Salesman - the ultimate car finance & lease calculator! https://sneakysalesman.com',
        }),
        url: 'https://sneakysalesman.com',
        title: 'Sneaky Salesman',
      });
    } catch {
      showMessage({
        message: 'Error',
        description: 'Failed to share the app',
        type: 'danger',
      });
    }
  };

  const handleRate = async () => {
    // TODO: Uncomment after rebuilding dev client
    // const storeUrl = Platform.select({
    //   ios: `https://apps.apple.com/app/id${Application.applicationId}`,
    //   android: `https://play.google.com/store/apps/details?id=${Application.applicationId}`,
    //   default: 'https://sneakysalesman.com',
    // });
    const storeUrl = 'https://sneakysalesman.com';
    await openLinkInBrowser(storeUrl);
  };

  const handleContactSupport = async () => {
    const subject = encodeURIComponent('Sneaky Salesman Support Request');
    const body = encodeURIComponent(`\n\n---\nApp Version: ${Env.VERSION}\nPlatform: ${Platform.OS}`);
    const mailUrl = `mailto:jason@tensifi.com?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(mailUrl);
    if (canOpen) {
      await Linking.openURL(mailUrl);
    } else {
      showMessage({
        message: 'Error',
        description: 'Unable to open email client',
        type: 'danger',
      });
    }
  };

  return (
    <ScreenContainer>
      <FocusAwareStatusBar />

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding }}>
        <View className="flex-1 px-4 pt-4">
          {/* Profile Header Card */}
          <ProfileCard profile={profile} isDark={isDark} />

          {/* Account Section */}
          <ItemsContainer title="settings.account">
            <Item text="settings.profile" icon={<User color={iconColor} />} onPress={() => router.push('/settings/profile')} />
          </ItemsContainer>

          {/* Appearance Section */}
          <Text className="pb-2 pt-4 text-lg text-neutral-900 dark:text-white">Appearance</Text>
          <ThemeButtonGroup />

          {/* App Info Section */}
          <ItemsContainer title="settings.app_info">
            <Item text="settings.app_name" value={Env.NAME} />
            <Item text="settings.version" value={Env.VERSION} />
            {/* TODO: Uncomment after rebuilding dev client */}
            {/* <Item text="settings.build" value={Application.nativeBuildVersion || 'N/A'} /> */}
          </ItemsContainer>

          {/* Support Section */}
          <ItemsContainer title="settings.support_us">
            <Item text="settings.share" icon={<ShareIcon color={iconColor} />} onPress={handleShare} />
            <Item text="settings.rate" icon={<Rate color={iconColor} />} onPress={handleRate} />
            <Item text="settings.support" icon={<Support color={iconColor} />} onPress={handleContactSupport} />
          </ItemsContainer>

          {/* Links Section */}
          <ItemsContainer title="settings.links">
            <Item
              text="settings.web_app"
              icon={<Website color={iconColor} />}
              onPress={() => openLinkInBrowser('https://sneakysalesman.com')}
            />
            <Item
              text="settings.company"
              onPress={() => openLinkInBrowser('https://tensifi.com')}
            />
            <Item text="settings.privacy" onPress={() => openLinkInBrowser('https://sneakysalesman.com/privacy')} />
            <Item text="settings.terms" onPress={() => openLinkInBrowser('https://sneakysalesman.com/terms')} />
          </ItemsContainer>

          {/* Debug Section - Only for developers */}
          {showDebug && <DebugSection iconColor={iconColor} />}

          {/* Sign Out Button */}
          <View className="mt-8">
            <Pressable
              onPress={signOut}
              className="flex-row items-center justify-center rounded-xl border border-danger-200 bg-danger-50 px-6 py-4 dark:border-danger-800 dark:bg-danger-900/20"
            >
              <Text className="text-base font-semibold text-danger-600 dark:text-danger-400">
                Sign Out
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ThemeButtonGroup() {
  const { selectedTheme, setSelectedTheme } = useSelectedTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themes: { value: ColorSchemeType; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'Auto', icon: '⚙️' },
  ];

  return (
    <View className="flex-row rounded-xl bg-neutral-200 p-1 dark:bg-neutral-700">
      {themes.map((theme) => {
        const isSelected = selectedTheme === theme.value;
        return (
          <Pressable
            key={theme.value}
            onPress={() => setSelectedTheme(theme.value)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${
              isSelected
                ? 'bg-white shadow-sm dark:bg-neutral-600'
                : ''
            }`}
          >
            <Text className="text-base">{theme.icon}</Text>
            <Text
              className={`text-sm font-medium ${
                isSelected
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {theme.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
      onPress={() => router.push('/settings/profile')}
      className="mb-4 flex-row items-center rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
    >
      {/* Avatar */}
      <View
        className={`size-16 items-center justify-center rounded-full ${isDark ? 'bg-primary-dark' : 'bg-primary/10'}`}
      >
        <Text className={`text-xl font-bold ${isDark ? 'text-primary-tint-5' : 'text-primary-dark'}`}>{initials}</Text>
      </View>

      {/* Info */}
      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
          {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{profile?.email || ''}</Text>
        <Text className="mt-1 text-xs text-primary dark:text-primary-light">View Profile</Text>
      </View>
    </Pressable>
  );
}

function DebugSection({ iconColor }: { iconColor: string }) {
  const [isSending, setIsSending] = useState(false);

  const handleTestNotification = async () => {
    setIsSending(true);
    try {
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
