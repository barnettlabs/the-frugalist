import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import type { GradeDealVariables } from '@/api/ai';
import { useGradeDeal } from '@/api/ai';
import type { DealGradeResponse } from '@/api/ai/types';

import { Button } from './button';
import { Text } from './text';

type Props = Pick<GradeDealVariables, 'agentSlug' | 'calculatorType' | 'inputs'>;

const gradeStyle = (grade: string) => {
	if (grade === 'A+' || grade === 'A') return 'bg-success/15 text-success border-success/30';
	if (grade === 'B') return 'bg-accent/15 text-accent border-accent/30';
	if (grade === 'C') return 'bg-signal/15 text-signal border-signal/30';
	return 'bg-danger/15 text-danger border-danger/30';
};

export function DealGradeCard({ agentSlug, calculatorType, inputs }: Props) {
	const [result, setResult] = useState<DealGradeResponse | null>(null);
	const [cached, setCached] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useGradeDeal({
		onSuccess: data => {
			setResult(data.response);
			setCached(data.cached);
			setErrorMessage(null);
		},
		onError: error => {
			const status = error.response?.status;
			const apiMessage = (error.response?.data as { message?: string })?.message;
			setErrorMessage(
				apiMessage ??
					(status === 429 ? 'Daily limit reached for this agent.' : 'Could not grade this deal. Try again in a moment.')
			);
			setResult(null);
		},
	});

	const run = () => mutate({ agentSlug, calculatorType, inputs });

	return (
		<View className="rounded-lg border border-border bg-surface p-4 my-3">
			<Text className="text-base font-semibold text-primary">AI Deal Grade</Text>

			{!result && !errorMessage && !isPending && (
				<Text className="text-sm text-text-muted mt-1">
					Get an AI take on whether this deal is strong, average, or one to walk away from.
				</Text>
			)}

			{isPending && (
				<View className="flex-row items-center gap-2 mt-3">
					<ActivityIndicator size="small" />
					<Text className="text-sm text-text-muted">Grading…</Text>
				</View>
			)}

			{errorMessage && !isPending && (
				<Text className="text-sm text-danger bg-danger/10 rounded p-2 mt-3">{errorMessage}</Text>
			)}

			{result && !isPending && (
				<View className="mt-3">
					<View className="flex-row items-start gap-3">
						<View className={`w-14 h-14 rounded-md border items-center justify-center ${gradeStyle(result.grade)}`}>
							<Text className="text-2xl font-semibold">{result.grade}</Text>
						</View>
						<View className="flex-1">
							<Text className="text-sm text-primary capitalize">{result.rating.replaceAll('_', ' ')}</Text>
							<Text className="text-sm text-text-muted mt-1">{result.summary}</Text>
						</View>
					</View>

					{result.red_flags?.length > 0 && (
						<View className="mt-3">
							<Text className="text-xs uppercase tracking-wider text-text-muted">Watch out</Text>
							{result.red_flags.map((flag, idx) => (
								<Text key={idx} className="text-sm text-text-muted">
									• {flag}
								</Text>
							))}
						</View>
					)}

					{result.tips?.length > 0 && (
						<View className="mt-3">
							<Text className="text-xs uppercase tracking-wider text-text-muted">Tips</Text>
							{result.tips.map((tip, idx) => (
								<Text key={idx} className="text-sm text-text-muted">
									• {tip}
								</Text>
							))}
						</View>
					)}

					{cached && <Text className="text-[10px] text-text-muted mt-2">Cached response — identical inputs.</Text>}
				</View>
			)}

			<Button
				testID="grade-deal-button"
				label={result ? 'Re-grade' : 'Grade this deal'}
				variant="secondary"
				onPress={run}
				disabled={isPending}
			/>
		</View>
	);
}
