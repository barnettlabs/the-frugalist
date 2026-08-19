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
			<Pressable className="overflow-hidden rounded-md border border-border-light bg-surface-light active:opacity-90 dark:border-border-dark dark:bg-surface-dark">
				{/* Top metadata strip */}
				<View className="flex-row items-center border-b border-border-light px-4 py-2.5 dark:border-border-dark">
					<View
						className="mr-2 size-1.5 rounded-full"
						style={{ backgroundColor: product.is_active ? '#437A59' : '#857C6B' }}
					/>
					<Text className="flex-1 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
						{product.retailer.name}
					</Text>
					{targetReached ? (
						<View className="rounded-sm bg-signal/15 px-2 py-0.5">
							<Text className="font-mono text-[10px] uppercase tracking-wider text-signal-dark">Target</Text>
						</View>
					) : product.price_drop_percentage > 0 ? (
						<View className="rounded-sm bg-success/15 px-2 py-0.5">
							<Text className="font-mono text-[10px] uppercase tracking-wider text-success">
								−{product.price_drop_percentage.toFixed(0)}%
							</Text>
						</View>
					) : !product.is_active ? (
						<View className="rounded-sm bg-tan-dark/40 px-2 py-0.5">
							<Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
								Paused
							</Text>
						</View>
					) : null}
				</View>

				{/* Body — image anchor + content */}
				<View className="flex-row gap-4 p-4">
					{/* Image */}
					<View className="relative">
						{product.product_image_url ? (
							<Image
								source={{ uri: product.product_image_url }}
								className="size-20 rounded-md border border-border-light bg-tan-light dark:border-border-dark dark:bg-charcoal-800"
								contentFit="contain"
							/>
						) : (
							<View className="size-20 items-center justify-center rounded-md border border-border-light bg-tan-light dark:border-border-dark dark:bg-charcoal-800">
								<Text className="text-2xl">📦</Text>
							</View>
						)}
						{targetReached ? (
							<View className="absolute -right-1.5 -top-1.5 size-5 items-center justify-center rounded-full bg-signal">
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
								<Text className="font-mono text-xs text-text-muted-light line-through dark:text-text-muted-dark">
									{formatCurrencyWithSymbol(product.retail_price)}
								</Text>
							)}
						</View>
					</View>
				</View>

				{/* Target progress */}
				{!targetReached && product.target_price ? (
					<View className="px-4 pb-3">
						<View className="mb-1.5 flex-row items-baseline justify-between">
							<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
								Target {formatCurrencyWithSymbol(product.target_price)}
							</Text>
							<Text className="font-mono text-[10px] text-text-muted-light dark:text-text-muted-dark">
								{Math.max(progress, 0).toFixed(0)}%
							</Text>
						</View>
						<View className="h-[3px] overflow-hidden rounded-full bg-border-light dark:bg-border-dark">
							<View
								className="h-full rounded-full bg-accent"
								style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
							/>
						</View>
					</View>
				) : null}

				{/* Footer */}
				<View className="flex-row items-center justify-between border-t border-border-light px-4 py-2.5 dark:border-border-dark">
					<Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
						SKU {product.sku_upc}
					</Text>
					{product.last_checked_at ? (
						<Text className="font-mono text-[10px] text-text-muted-light dark:text-text-muted-dark">
							{formatRelativeTime(product.last_checked_at)}
						</Text>
					) : null}
				</View>
			</Pressable>
		</Link>
	);
}
