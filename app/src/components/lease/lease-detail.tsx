import { Link } from 'expo-router';
import React, { useMemo } from 'react';

import { useProfile } from '@/api/auth/use-profile';
import { ActionFooter, Pressable, ScrollView, TabPageHeader, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { DealGradeCard } from '@/components/ui/deal-grade-card';
import { Book } from '@/components/ui/icons';
import { SummaryRow } from '@/components/ui/summary-row';
import { tw } from '@/components/ui/theme';
import { formatCurrencyWithSymbol, formatPercentage, LeaseCalculator } from '@/lib/calculators';
import type { VehicleLeaseSheet } from '@/lib/types/models';

interface LeaseDetailProps {
	sheet: VehicleLeaseSheet;
	onEdit: () => void;
	onDelete: () => void;
	isDeleting: boolean;
}

export function LeaseDetail({ sheet, onEdit, onDelete, isDeleting }: LeaseDetailProps) {
	const summary = useMemo(() => new LeaseCalculator(sheet).getSummary(), [sheet]);
	const { data: user } = useProfile();

	return (
		<View className={`flex-1 ${tw.pageBg}`}>
			<TabPageHeader title="Lease estimate" showBack backLabel="Lease" />
			<ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
				<PaymentHeader payment={summary.leasePayment} term={sheet.lease_term} residual={sheet.residual_percent} />
				<TermsLink />
				<VehicleInfoCard sheet={sheet} />
				<PaymentBreakdownCard summary={summary} />
				<FinancialSummaryCard summary={summary} sheet={sheet} />
				<LeaseDetailsCard sheet={sheet} summary={summary} />
				{user?.is_admin && <DealGradeCard agentSlug="deal-grade-lease" calculatorType="lease" inputs={sheet} />}
				<ContactInfoCard sheet={sheet} />
				{sheet.notes && <NotesCard notes={sheet.notes} />}
			</ScrollView>
			<ActionFooter
				primaryLabel="Edit"
				onPrimary={onEdit}
				secondaryLabel={isDeleting ? 'Deleting…' : 'Delete'}
				onSecondary={onDelete}
				isSecondaryDisabled={isDeleting}
			/>
		</View>
	);
}

function PaymentHeader({ payment, term, residual }: { payment: number; term: number; residual: number }) {
	return (
		<View className="mb-4 overflow-hidden rounded-md border border-primary-dark" style={{ backgroundColor: '#171B27' }}>
			<View className="border-b border-white/10 px-5 py-3">
				<Text className="text-[10px] font-semibold uppercase tracking-eyebrow text-white/60">Monthly payment</Text>
			</View>
			<View className="p-5">
				<Text className="font-mono tracking-tight text-white" style={{ fontSize: 42, lineHeight: 44 }}>
					{formatCurrencyWithSymbol(payment)}
				</Text>
				<Text className="mt-2 font-mono text-xs text-white/60">
					{term} months · {residual}% residual
				</Text>
			</View>
		</View>
	);
}

function VehicleInfoCard({ sheet }: { sheet: VehicleLeaseSheet }) {
	return (
		<View className={`mb-3 p-5 ${tw.card}`}>
			<Text className="mb-2 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				{sheet.sheet_name || 'Untitled estimate'}
			</Text>
			<Text
				className="font-display tracking-tight text-text-primary-light dark:text-text-primary-dark"
				style={{ fontSize: 22, lineHeight: 24 }}
			>
				<Text className="font-mono text-base text-text-muted-light dark:text-text-muted-dark">
					{sheet.vehicle_year}
				</Text>{' '}
				{sheet.vehicle_make}{' '}
				<Text className="italic text-text-muted-light dark:text-text-muted-dark">
					{sheet.vehicle_model}
					{sheet.vehicle_trim ? ` ${sheet.vehicle_trim}` : ''}
				</Text>
			</Text>
			<View className="mt-3 flex-row gap-2">
				<View className="rounded-sm border border-border-light bg-tan-light px-2 py-0.5 dark:border-border-dark dark:bg-charcoal-800">
					<Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
						{sheet.vehicle_type}
					</Text>
				</View>
				<View className="rounded-sm bg-accent/10 px-2 py-0.5">
					<Text className="font-mono text-[10px] uppercase tracking-wider text-accent dark:text-accent-light">
						Lease
					</Text>
				</View>
			</View>
		</View>
	);
}

function PaymentBreakdownCard({ summary }: { summary: ReturnType<LeaseCalculator['getSummary']> }) {
	return (
		<View className={`mb-3 p-5 ${tw.card}`}>
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				Payment breakdown
			</Text>
			<View className="gap-2">
				<SummaryRow label="Principal payment" value={formatCurrencyWithSymbol(summary.monthlyPrincipalPayment)} />
				<SummaryRow label="Interest payment" value={formatCurrencyWithSymbol(summary.residualMonthlyInterestPayment)} />
				<SummaryRow label="Monthly tax" value={formatCurrencyWithSymbol(summary.monthlySalesTax)} />
				<View className="my-2 border-t border-border-light dark:border-border-dark" />
				<SummaryRow label="Monthly payment" value={formatCurrencyWithSymbol(summary.leasePayment)} isBold isHighlight />
			</View>
		</View>
	);
}

function FinancialSummaryCard({
	summary,
	sheet,
}: {
	summary: ReturnType<LeaseCalculator['getSummary']>;
	sheet: VehicleLeaseSheet;
}) {
	return (
		<View className={`mb-3 p-5 ${tw.card}`}>
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				Financial summary
			</Text>
			<View className="gap-3">
				<SummaryRow label="MSRP" value={formatCurrencyWithSymbol(sheet.msrp)} />
				{sheet.dealer_contribution > 0 && (
					<SummaryRow
						label="Dealer contribution"
						value={`−${formatCurrencyWithSymbol(sheet.dealer_contribution)}`}
						isNegative
					/>
				)}
				{sheet.trade_in > 0 && (
					<SummaryRow label="Trade-in" value={`−${formatCurrencyWithSymbol(sheet.trade_in)}`} isNegative />
				)}
				<SummaryRow label="Final dealer price" value={formatCurrencyWithSymbol(summary.finalDealerPrice)} isBold />
				<SummaryRow label="Gross cap cost" value={formatCurrencyWithSymbol(summary.grossCapCost)} />
				<SummaryRow label="Net cap cost" value={formatCurrencyWithSymbol(summary.netCapCost)} />
				<SummaryRow label="Residual amount" value={formatCurrencyWithSymbol(summary.residualAmount)} />
				<View className="my-2 border-t border-border-light dark:border-border-dark" />
				<SummaryRow label="Cash due at signing" value={formatCurrencyWithSymbol(summary.cashDueAtSigning)} isBold />
				<SummaryRow
					label="Total lease cost"
					value={formatCurrencyWithSymbol(summary.totalLeaseCost)}
					isBold
					isHighlight
				/>
			</View>
		</View>
	);
}

function LeaseDetailsCard({
	sheet,
	summary,
}: {
	sheet: VehicleLeaseSheet;
	summary: ReturnType<LeaseCalculator['getSummary']>;
}) {
	return (
		<View className={`mb-3 p-5 ${tw.card}`}>
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				Lease details
			</Text>
			<View className="gap-2">
				<SummaryRow label="Money factor" value={String(sheet.money_factor)} />
				<SummaryRow label="Implied APR" value={formatPercentage(summary.interestRate)} />
				<SummaryRow label="Residual %" value={formatPercentage(sheet.residual_percent)} />
				<SummaryRow label="Term" value={`${sheet.lease_term} months`} />
				<SummaryRow label="Sales tax" value={formatPercentage(sheet.sales_tax_percent)} />
			</View>
		</View>
	);
}

function ContactInfoCard({ sheet }: { sheet: VehicleLeaseSheet }) {
	if (!sheet.dealership_name && !sheet.sales_consultant && !sheet.contact_email) return null;
	return (
		<View className={`mb-3 p-5 ${tw.card}`}>
			<Text className="mb-3 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				Contact information
			</Text>
			{sheet.dealership_name && (
				<Text className="font-display text-base text-text-primary-light dark:text-text-primary-dark">
					{sheet.dealership_name}
				</Text>
			)}
			{sheet.sales_consultant && (
				<Text className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">{sheet.sales_consultant}</Text>
			)}
			{sheet.contact_email && (
				<Text className="mt-1 text-sm text-accent underline dark:text-accent-light">{sheet.contact_email}</Text>
			)}
			{sheet.contact_phone && (
				<Text className="mt-1 font-mono text-sm text-text-muted-light dark:text-text-muted-dark">
					{sheet.contact_phone}
				</Text>
			)}
		</View>
	);
}

function NotesCard({ notes }: { notes: string }) {
	return (
		<View className={`mb-3 p-5 ${tw.card}`}>
			<Text className="mb-2 text-[10px] font-semibold uppercase tracking-eyebrow text-text-muted-light dark:text-text-muted-dark">
				Notes
			</Text>
			<Text className="text-sm leading-5 text-text-muted-light dark:text-text-muted-dark">{notes}</Text>
		</View>
	);
}

function TermsLink() {
	return (
		<Link href="/(app)/learning/leasing" asChild>
			<Pressable className="mb-4 flex-row items-center rounded-md border border-border-light bg-surface-light px-3 py-2.5 active:opacity-80 dark:border-border-dark dark:bg-surface-dark">
				<Book color={colors.text.muted.light} size={14} />
				<Text className="ml-2 text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
					Read the leasing guide
				</Text>
			</Pressable>
		</Link>
	);
}
