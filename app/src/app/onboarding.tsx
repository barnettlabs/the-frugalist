import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Pressable, Text, View } from '@/components/ui';
import { Bell, Calculator, Eye } from '@/components/ui/icons';
import { LogoImage } from '@/components/ui/logo';
import { useIsFirstTime } from '@/lib/hooks';
import { useNotifications } from '@/lib/notifications/use-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  id: string;
  title: string;
  description: string;
  icon: 'logo' | 'calculator' | 'eye' | 'bell';
  features?: string[];
};

const slides: Slide[] = [
  {
    id: 'welcome',
    title: 'Welcome to\nTheFrugalist',
    description: 'Your personal finance companion for smarter car buying and deal hunting.',
    icon: 'logo',
    features: [
      'Calculate car payments',
      'Track product prices',
      'Get notified of deals',
    ],
  },
  {
    id: 'calculators',
    title: 'Car Payment\nCalculators',
    description: 'Make informed decisions with our finance and lease calculators.',
    icon: 'calculator',
    features: [
      'Compare financing options',
      'Estimate monthly payments',
      'Understand total costs',
      'See amortization schedules',
    ],
  },
  {
    id: 'tracker',
    title: 'Price Drop\nAlerts',
    description: 'Track products and get notified when prices drop to your target.',
    icon: 'eye',
    features: [
      'Track any product by SKU/UPC',
      'Set your target price',
      'Monitor multiple retailers',
      'View price history',
    ],
  },
  {
    id: 'notifications',
    title: 'Stay\nNotified',
    description: 'Enable notifications to never miss a price drop or deal.',
    icon: 'bell',
    features: [
      'Instant price drop alerts',
      'Target price notifications',
      'Back in stock alerts',
    ],
  },
];

function SlideIcon({ icon, isDark }: { icon: Slide['icon']; isDark: boolean }) {
  const iconColor = isDark ? '#5A7DAB' : '#235892';
  const size = 64;

  switch (icon) {
    case 'logo':
      return <LogoImage variant="auto" size="2xl" />;
    case 'calculator':
      return <Calculator color={iconColor} size={size} />;
    case 'eye':
      return <Eye color={iconColor} size={size} />;
    case 'bell':
      return <Bell color={iconColor} size={size} />;
    default:
      return null;
  }
}

export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { register: registerNotifications, isLoading: isRegisteringNotifications } = useNotifications();

  const handleComplete = () => {
    setIsFirstTime(false);
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleEnableNotifications = async () => {
    await registerNotifications();
    handleComplete();
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderSlide: ListRenderItem<Slide> = ({ item, index }) => {
    const isLastSlide = index === slides.length - 1;

    return (
      <View
        style={{ width: SCREEN_WIDTH }}
        className="flex-1 items-center justify-center px-8"
      >
        {/* Icon */}
        <View className="mb-8 size-32 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-light/10">
          <SlideIcon icon={item.icon} isDark={isDark} />
        </View>

        {/* Title */}
        <Text className="mb-4 text-center text-4xl font-bold text-neutral-900 dark:text-white">
          {item.title}
        </Text>

        {/* Description */}
        <Text className="mb-8 text-center text-lg text-neutral-600 dark:text-neutral-400">
          {item.description}
        </Text>

        {/* Features */}
        {item.features && (
          <View className="w-full max-w-xs">
            {item.features.map((feature, i) => (
              <View key={i} className="mb-3 flex-row items-center">
                <View className="mr-3 size-2 rounded-full bg-primary dark:bg-primary-light" />
                <Text className="text-base text-neutral-700 dark:text-neutral-300">
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notification-specific button */}
        {isLastSlide && (
          <View className="mt-8 w-full max-w-xs">
            <Button
              label={isRegisteringNotifications ? 'Enabling...' : 'Enable Notifications'}
              onPress={handleEnableNotifications}
              disabled={isRegisteringNotifications}
            />
            <Pressable onPress={handleComplete} className="mt-4 py-2">
              <Text className="text-center text-base text-neutral-500 dark:text-neutral-400">
                Maybe Later
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      {/* Header with Skip button */}
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="flex-row items-center justify-end px-6"
      >
        {!isLastSlide && (
          <Pressable onPress={handleSkip} className="py-2">
            <Text className="text-base font-medium text-primary dark:text-primary-light">
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom section */}
      <View
        style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 16 : 32 }}
        className="px-8"
      >
        {/* Pagination dots */}
        <View className="mb-6 flex-row items-center justify-center">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 rounded-full ${
                index === currentIndex
                  ? 'w-6 bg-primary dark:bg-primary-light'
                  : 'w-2 bg-neutral-300 dark:bg-charcoal-600'
              }`}
            />
          ))}
        </View>

        {/* Next/Get Started button - hidden on notifications slide */}
        {!isLastSlide && (
          <Button
            label={currentIndex === slides.length - 2 ? 'Continue' : 'Next'}
            onPress={handleNext}
          />
        )}
      </View>
    </View>
  );
}
