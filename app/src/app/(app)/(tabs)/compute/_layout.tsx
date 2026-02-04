import { Slot, usePathname, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/components/ui/colors';
import { SegmentTabs } from '@/components/ui/segment-tabs';

const TABS = [
  { key: 'finance', label: 'Finance' },
  { key: 'lease', label: 'Lease' },
];

export default function ComputeLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/lease')) return 'lease';
    return 'finance';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    router.replace(`/(app)/compute/${key}` as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.charcoal[950] : colors.neutral[50],
          paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        },
      ]}
    >
      <SegmentTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
