import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

import { useDeleteLeaseSheet, useUpdateLeaseSheet } from '@/api/lease/use-lease-mutations';
import { useLeaseSheet } from '@/api/lease/use-lease-sheet';
import { LeaseDetail } from '@/components/lease/lease-detail';
import { LeaseForm } from '@/components/lease/lease-form';
import { Button, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import type { LeaseFormData } from '@/lib/types/models';

export default function LeaseDetailScreen() {
	const { t } = useTranslation();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [isEditing, setIsEditing] = useState(false);

	const {
		data: sheet,
		isLoading,
		isError,
		refetch,
	} = useLeaseSheet({
		variables: { id: id! },
	});

	const { mutate: updateSheet, isPending: isUpdating } = useUpdateLeaseSheet();
	const { mutate: deleteSheet, isPending: isDeleting } = useDeleteLeaseSheet();

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-charcoal-950">
				<ActivityIndicator size="large" color={colors.primary.DEFAULT} />
			</View>
		);
	}

	if (isError || !sheet) {
		return (
			<View className="flex-1 items-center justify-center bg-neutral-50 p-6 dark:bg-charcoal-950">
				<Text className="mb-4 text-center text-lg text-danger-600">Failed to load estimate</Text>
				<Button label="Try Again" onPress={() => refetch()} />
			</View>
		);
	}

	const handleUpdate = (data: LeaseFormData) => {
		updateSheet(
			{ id: sheet.id, data },
			{
				onSuccess: () => {
					showMessage({
						message: t('common.success'),
						description: t('estimate_toast.lease_updated'),
						type: 'success',
					});
					setIsEditing(false);
					refetch();
				},
				onError: error => {
					showMessage({
						message: t('common.error'),
						description: error.message || 'Failed to update estimate',
						type: 'danger',
					});
				},
			}
		);
	};

	const handleDelete = () => {
		Alert.alert(
			'Delete Estimate',
			'Are you sure you want to delete this lease estimate? This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						deleteSheet(
							{ id: sheet.id },
							{
								onSuccess: () => {
									showMessage({
										message: t('common.deleted'),
										description: t('estimate_toast.lease_deleted'),
										type: 'success',
									});
									router.back();
								},
								onError: error => {
									showMessage({
										message: t('common.error'),
										description: error.message || 'Failed to delete estimate',
										type: 'danger',
									});
								},
							}
						);
					},
				},
			]
		);
	};

	if (isEditing) {
		return (
			<LeaseForm
				initialData={sheet}
				onSubmit={handleUpdate}
				isSubmitting={isUpdating}
				submitLabel="Save Changes"
				onCancel={() => setIsEditing(false)}
			/>
		);
	}

	return (
		<LeaseDetail sheet={sheet} onEdit={() => setIsEditing(true)} onDelete={handleDelete} isDeleting={isDeleting} />
	);
}
