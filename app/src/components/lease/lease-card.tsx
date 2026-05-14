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
			<Pressable className="rounded-md border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark overflow-hidden active:opacity-90">
				{/* Header strip */}
				<View className="px-4 py-2.5 border-b border-border-light dark:border-border-dark flex-row items-center">
					<Text
						className="flex-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark"
						numberOfLines={1}
					>
						{sheet.dealership_name || 'No dealership'}
					</Text>
					<Text className="text-[10px] font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
						Lease
					</Text>
				</View>

				{/* Body */}
				<View className="p-4">
					<Text className="text-xs text-text-muted-light dark:text-text-muted-dark mb-1">
						{sheet.sheet_name || 'Untitled estimate'}
					</Text>
					<View className="flex-row items-baseline">
						<Text className="font-mono text-text-muted-light dark:text-text-muted-dark mr-2" style={{ fontSize: 14 }}>
							{sheet.vehicle_year}
						</Text>
						<Text
							className="font-display tracking-tight text-text-primary-light dark:text-text-primary-dark flex-1"
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
					<View className="flex-row items-baseline justify-between mt-5">
						<View>
							<Text className="text-[10px] font-semibold tracking-[0.18em] uppercase text-text-muted-light dark:text-text-muted-dark mb-1.5">
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
				<View className="px-4 py-3 border-t border-border-light dark:border-border-dark flex-row justify-between">
					<Text className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
						{formatCurrencyWithSymbol(sheet.msrp)} MSRP
					</Text>
					<Text className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">Open ↗</Text>
				</View>
			</Pressable>
		</Link>
	);
}
