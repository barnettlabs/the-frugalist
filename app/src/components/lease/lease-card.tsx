import { Link } from 'expo-router';
import React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { formatCurrencyWithSymbol, LeaseCalculator } from '@/lib/calculators';
import type { VehicleLeaseSheet } from '@/lib/types/models';

interface LeaseCardProps {
	sheet: VehicleLeaseSheet;
}

export function LeaseCard({ sheet }: LeaseCardProps) {
	const calculator = new LeaseCalculator(sheet);
	const leasePayment = calculator.calculateLeasePayment();

	return (
		<Link href={`/compute/lease/${sheet.id}?from=lease`} asChild>
			<Pressable className="overflow-hidden rounded-md border border-border-light bg-surface-light active:opacity-90 dark:border-border-dark dark:bg-surface-dark">
				{/* Header strip */}
				<View className="flex-row items-center border-b border-border-light px-4 py-2.5 dark:border-border-dark">
					<Text
						className="flex-1 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark"
						numberOfLines={1}
					>
						{sheet.dealership_name || 'No dealership'}
					</Text>
					<Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
						Lease
					</Text>
				</View>

				{/* Body */}
				<View className="p-4">
					<Text className="mb-1 text-xs text-text-muted-light dark:text-text-muted-dark">
						{sheet.sheet_name || 'Untitled estimate'}
					</Text>
					<View className="flex-row items-baseline">
						<Text className="mr-2 font-mono text-text-muted-light dark:text-text-muted-dark" style={{ fontSize: 14 }}>
							{sheet.vehicle_year}
						</Text>
						<Text
							className="flex-1 font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
							style={{ fontSize: 22, lineHeight: 24 }}
							numberOfLines={1}
						>
							{sheet.vehicle_make}{' '}
							<Text className="italic text-text-muted-light dark:text-text-muted-dark" style={{ fontSize: 22 }}>
								{sheet.vehicle_model}
							</Text>
						</Text>
					</View>

					{/* Monthly hero figure */}
					<View className="mt-5 flex-row items-baseline justify-between">
						<View>
							<Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
								Monthly
							</Text>
							<Text
								className="font-mono tracking-tight text-text-primary-light dark:text-text-primary-dark"
								style={{ fontSize: 30, lineHeight: 32 }}
							>
								{formatCurrencyWithSymbol(leasePayment)}
							</Text>
						</View>
						<View className="items-end">
							<Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
								{sheet.lease_term} mo
							</Text>
							<Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
								{sheet.residual_percent}% res
							</Text>
						</View>
					</View>
				</View>

				{/* Footer */}
				<View className="flex-row justify-between border-t border-border-light px-4 py-3 dark:border-border-dark">
					<Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
						{formatCurrencyWithSymbol(sheet.msrp)} MSRP
					</Text>
					<Text className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">Open ↗</Text>
				</View>
			</Pressable>
		</Link>
	);
}
