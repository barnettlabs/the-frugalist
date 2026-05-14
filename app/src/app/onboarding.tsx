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
	Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MastheadBar, ScreenContainer, Text, View } from '@/components/ui';
import { Bell, Calculator, Eye } from '@/components/ui/icons';
import { LogoImage } from '@/components/ui/logo';
import { getThemeColors } from '@/components/ui/theme';
import { useIsFirstTime } from '@/lib/hooks';
import { useNotifications } from '@/lib/notifications/use-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
	id: string;
	number: string;
	eyebrow: string;
	title: string;
	italic: string;
	description: string;
	icon: 'logo' | 'calculator' | 'eye' | 'bell';
	proofs: string[];
};

const slides: Slide[] = [
	{
		id: 'welcome',
		number: '00',
		eyebrow: 'A field guide',
		title: 'Spend with',
		italic: 'intent.',
		description:
			'TheFrugalist is a calm tool for noisy markets. Track prices that move, run the numbers, learn the playbook.',
		icon: 'logo',
		proofs: ['Track prices', 'Run financing', 'Read the lease'],
	},
	{
		id: 'calculators',
		number: '01',
		eyebrow: 'Compute',
		title: 'Run',
		italic: 'the math.',
		description: 'Financing and leasing rendered in plain numbers: APR, money factor, residual, true monthly cost.',
		icon: 'calculator',
		proofs: ['Amortization', 'Money factor to APR', 'Side-by-side comparisons'],
	},
	{
		id: 'tracker',
		number: '02',
		eyebrow: 'Watch',
		title: 'Track',
		italic: 'movement.',
		description: 'Drop-by-drop price history. Alerts only when motion makes the moment worth your attention.',
		icon: 'eye',
		proofs: ['Price history', 'In-stock alerts', 'Return-window refunds'],
	},
	{
		id: 'notifications',
		number: '03',
		eyebrow: 'Stay informed',
		title: 'Hear',
		italic: 'the signal.',
		description: 'Enable notifications to catch every drop the moment it happens. We only ping when motion matters.',
		icon: 'bell',
		proofs: ['Price-drop alerts', 'Target-price alerts', 'Back-in-stock alerts'],
	},
];

function SlideIcon({ icon, color }: { icon: Slide['icon']; color: string }) {
	const size = 48;
	switch (icon) {
		case 'logo':
			return <LogoImage variant="auto" size="2xl" />;
		case 'calculator':
			return <Calculator color={color} size={size} />;
		case 'eye':
			return <Eye color={color} size={size} />;
		case 'bell':
			return <Bell color={color} size={size} />;
		default:
			return null;
	}
}

export default function Onboarding() {
	const [, setIsFirstTime] = useIsFirstTime();
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const insets = useSafeAreaInsets();
	const isDark = colorScheme === 'dark';
	const theme = getThemeColors(isDark);

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

	const handleSkip = () => handleComplete();

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
			<View style={{ width: SCREEN_WIDTH }} className="flex-1 px-8 py-4">
				{/* Number + eyebrow */}
				<View className="flex-row items-center mb-8">
					<Text className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark mr-3">
						№ {item.number}
					</Text>
					<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
						{item.eyebrow}
					</Text>
				</View>

				{/* Icon */}
				<View className="mb-8 self-start w-16 h-16 items-center justify-center rounded-md bg-primary dark:bg-text-primary-dark">
					<SlideIcon icon={item.icon} color={theme.surface} />
				</View>

				{/* Title */}
				<Text
					className="font-display tracking-tightest text-text-primary-light dark:text-text-primary-dark"
					style={{ fontSize: 48, lineHeight: 50 }}
				>
					{item.title}
				</Text>
				<Text
					className="font-display italic tracking-tightest"
					style={{ fontSize: 48, lineHeight: 50, color: theme.accentDark }}
				>
					{item.italic}
				</Text>

				{/* Description */}
				<Text className="mt-6 text-base leading-6 text-text-muted-light dark:text-text-muted-dark">
					{item.description}
				</Text>

				{/* Proof points */}
				<View className="mt-8 gap-2">
					{item.proofs.map((proof, i) => (
						<View key={i} className="flex-row items-center gap-3">
							<View className="w-3 h-px bg-accent dark:bg-accent-light" />
							<Text className="font-mono text-sm text-text-primary-light dark:text-text-primary-dark">{proof}</Text>
						</View>
					))}
				</View>

				{/* Last-slide CTA */}
				{isLastSlide ? (
					<View className="mt-10 gap-3">
						<Pressable
							onPress={handleEnableNotifications}
							disabled={isRegisteringNotifications}
							className="rounded-md bg-primary px-5 py-3.5 items-center active:opacity-80"
							style={{ opacity: isRegisteringNotifications ? 0.6 : 1 }}
						>
							<Text className="text-sm font-medium text-surface-light">
								{isRegisteringNotifications ? 'Enabling…' : 'Enable notifications'}
							</Text>
						</Pressable>
						<Pressable onPress={handleComplete} className="py-2 items-center">
							<Text className="text-sm text-text-muted-light dark:text-text-muted-dark">Maybe later</Text>
						</Pressable>
					</View>
				) : null}
			</View>
		);
	};

	const isLastSlide = currentIndex === slides.length - 1;

	return (
		<ScreenContainer>
			{/* Top bar */}
			<View style={{ paddingTop: insets.top + 12 }}>
				<MastheadBar
					left="Onboarding"
					center="A field guide to what things should cost"
					right={
						!isLastSlide ? (
							<Pressable onPress={handleSkip} className="py-1">
								<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
									Skip
								</Text>
							</Pressable>
						) : null
					}
				/>
			</View>

			{/* Slides */}
			<FlatList
				ref={flatListRef}
				data={slides}
				renderItem={renderSlide}
				keyExtractor={item => item.id}
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

			{/* Bottom strip — pagination + CTA */}
			<View
				style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 16 : 32 }}
				className="px-8 pt-4 border-t border-border-light dark:border-border-dark"
			>
				{/* Pagination */}
				<View className="mb-5 flex-row items-center justify-center gap-1.5">
					{slides.map((_, index) => (
						<View
							key={index}
							className={`h-1 rounded-full ${
								index === currentIndex
									? 'w-8 bg-primary dark:bg-text-primary-dark'
									: 'w-3 bg-border-light dark:bg-border-dark'
							}`}
						/>
					))}
				</View>

				{!isLastSlide ? (
					<Pressable onPress={handleNext} className="rounded-md bg-primary px-5 py-3.5 items-center active:opacity-80">
						<Text className="text-sm font-medium text-surface-light">
							{currentIndex === slides.length - 2 ? 'Continue' : 'Next'}
						</Text>
					</Pressable>
				) : null}
			</View>
		</ScreenContainer>
	);
}
