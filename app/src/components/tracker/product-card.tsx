import { Link } from 'expo-router';
import React from 'react';

import { Image, Pressable, Text, View } from '@/components/ui';
import { formatCurrencyWithSymbol, formatRelativeTime } from '@/lib/calculators';
import type { PriceTrackerItem } from '@/lib/types/models';

interface ProductCardProps {
	product: PriceTrackerItem['tracked_product'];
}

export function ProductCard({ product }: ProductCardProps) {
	const targetReached = product.current_price <= product.target_price;
	const progress =
		((product.retail_price - product.current_price) / (product.retail_price - product.target_price)) * 100;

	return (
		<Link href={`/watch/${product.id}?from=watch`} asChild>
			<Pressable className="rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark overflow-hidden active:opacity-90">
				{/* Top metadata strip */}
				<View className="flex-row items-center px-4 py-2.5 border-b border-border-light dark:border-border-dark">
					<View
						className="w-1.5 h-1.5 rounded-full mr-2"
						style={{ backgroundColor: product.is_active ? '#437A59' : '#857C6B' }}
					/>
					<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark flex-1">
						{product.retailer.name}
					</Text>
					{targetReached ? (
						<View className="rounded-sm bg-signal/15 px-2 py-0.5">
							<Text className="text-[10px] font-mono uppercase tracking-wider text-signal-dark">Target</Text>
						</View>
					) : product.price_drop_percentage > 0 ? (
						<View className="rounded-sm bg-success/15 px-2 py-0.5">
							<Text className="text-[10px] font-mono uppercase tracking-wider text-success">
								−{product.price_drop_percentage.toFixed(0)}%
							</Text>
						</View>
					) : !product.is_active ? (
						<View className="rounded-sm bg-tan-dark/40 px-2 py-0.5">
							<Text className="text-[10px] font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
								Paused
							</Text>
						</View>
					) : null}
				</View>

				{/* Body — image anchor + content */}
				<View className="flex-row p-4 gap-4">
					{/* Image */}
					<View className="relative">
						{product.product_image_url ? (
							<Image
								source={{ uri: product.product_image_url }}
								className="size-20 rounded-md bg-tan-light dark:bg-charcoal-800 border border-border-light dark:border-border-dark"
								contentFit="contain"
							/>
						) : (
							<View className="size-20 items-center justify-center rounded-md bg-tan-light dark:bg-charcoal-800 border border-border-light dark:border-border-dark">
								<Text className="text-2xl">📦</Text>
							</View>
						)}
						{targetReached ? (
							<View className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-signal items-center justify-center">
								<Text className="text-[10px] font-bold text-white">↗</Text>
							</View>
						) : null}
					</View>

					{/* Content */}
					<View className="flex-1">
						<Text
							className="font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
							style={{ fontSize: 16, lineHeight: 20 }}
							numberOfLines={2}
						>
							{product.product_name || 'Pending lookup…'}
						</Text>

						<View className="mt-2 flex-row items-baseline gap-2">
							<Text
								className="font-mono tracking-tight text-text-primary-light dark:text-text-primary-dark"
								style={{ fontSize: 22, lineHeight: 24 }}
							>
								{formatCurrencyWithSymbol(product.current_price)}
							</Text>
							{product.current_price < product.retail_price && (
								<Text className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark line-through">
									{formatCurrencyWithSymbol(product.retail_price)}
								</Text>
							)}
						</View>
					</View>
				</View>

				{/* Target progress */}
				{!targetReached && product.target_price ? (
					<View className="px-4 pb-3">
						<View className="flex-row items-baseline justify-between mb-1.5">
							<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark">
								Target {formatCurrencyWithSymbol(product.target_price)}
							</Text>
							<Text className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark">
								{Math.max(progress, 0).toFixed(0)}%
							</Text>
						</View>
						<View className="h-[3px] rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
							<View
								className="h-full rounded-full bg-accent"
								style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
							/>
						</View>
					</View>
				) : null}

				{/* Footer */}
				<View className="flex-row items-center justify-between px-4 py-2.5 border-t border-border-light dark:border-border-dark">
					<Text className="text-[10px] font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
						SKU {product.sku_upc}
					</Text>
					{product.last_checked_at ? (
						<Text className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark">
							{formatRelativeTime(product.last_checked_at)}
						</Text>
					) : null}
				</View>
			</Pressable>
		</Link>
	);
}
