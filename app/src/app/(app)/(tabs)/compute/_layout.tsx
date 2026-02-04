import { Slot, usePathname, useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const TABS = [
  { key: 'finance', label: 'Finance' },
  { key: 'lease', label: 'Lease' },
];

type ComputeContextType = {
  activeTab: string;
  handleTabChange: (key: string) => void;
  tabs: typeof TABS;
};

export const ComputeContext = createContext<ComputeContextType | null>(null);

export function useComputeTabs() {
  const context = useContext(ComputeContext);
  if (!context) {
    throw new Error('useComputeTabs must be used within ComputeLayout');
  }
  return context;
}

export default function ComputeLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab directly from pathname (no state needed)
  const activeTab = useMemo(() => {
    return pathname.includes('/lease') ? 'lease' : 'finance';
  }, [pathname]);

  const handleTabChange = useCallback(
    (key: string) => {
      router.replace(`/(app)/compute/${key}` as any);
    },
    [router]
  );

  const contextValue = useMemo(
    () => ({ activeTab, handleTabChange, tabs: TABS }),
    [activeTab, handleTabChange]
  );

  return (
    <ComputeContext.Provider value={contextValue}>
      <View style={styles.container}>
        <Slot />
      </View>
    </ComputeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
