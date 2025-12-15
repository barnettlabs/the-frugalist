import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CurrencyInput } from '@/components/forms';
import {
  Button,
  ControlledInput,
  ScrollView,
  Select,
  Text,
  View,
} from '@/components/ui';

const trackerSchema = z.object({
  sku_upc: z.string().min(1, 'SKU/UPC is required'),
  retailer_id: z.number().min(1, 'Please select a retailer'),
  target_price: z.number().min(0.01, 'Target price must be greater than 0'),
});

type TrackerFormData = z.infer<typeof trackerSchema>;

interface TrackerFormProps {
  onSubmit: (data: TrackerFormData) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

const RETAILER_OPTIONS = [
  { value: 1, label: 'Best Buy' },
  { value: 2, label: 'Home Depot' },
  { value: 3, label: "Lowe's" },
  { value: 4, label: 'Amazon' },
  { value: 5, label: 'Walmart' },
  { value: 6, label: 'Target' },
];

export function TrackerForm({ onSubmit, isSubmitting, onCancel }: TrackerFormProps) {
  const { control, handleSubmit, setValue, watch } = useForm<TrackerFormData>({
    resolver: zodResolver(trackerSchema),
    defaultValues: {
      sku_upc: '',
      retailer_id: 0,
      target_price: 0,
    },
  });

  const retailerId = watch('retailer_id');

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Instructions */}
        <View className="mb-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <Text className="font-semibold text-blue-700 dark:text-blue-300">
            How to Track a Product
          </Text>
          <Text className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            1. Enter the product{"'"}s SKU or UPC number{'\n'}
            2. Select the retailer{'\n'}
            3. Set your target price{'\n'}
            4. We{"'"}ll notify you when the price drops!
          </Text>
        </View>

        {/* Form */}
        <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
          <Select
            label="Retailer"
            options={RETAILER_OPTIONS}
            value={retailerId}
            onSelect={(value) => setValue('retailer_id', value as number)}
          />

          <View className="mt-4">
            <ControlledInput
              control={control}
              name="sku_upc"
              label="SKU / UPC"
              placeholder="Enter product SKU or UPC"
            />
          </View>

          <View className="mt-4">
            <CurrencyInput
              control={control}
              name="target_price"
              label="Target Price"
              placeholder="0.00"
            />
          </View>

          <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            You{"'"}ll receive a notification when the price drops to or below
            your target price.
          </Text>
        </View>

        {/* Tips */}
        <View className="mt-6 rounded-xl bg-neutral-200 p-4 dark:bg-neutral-700">
          <Text className="font-medium text-neutral-700 dark:text-neutral-300">
            Tips for finding SKU/UPC:
          </Text>
          <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            • Best Buy: Look for SKU on the product page{'\n'}• Home Depot: Look
            for Internet # or Store SKU{'\n'}• Amazon: Use the ASIN from the
            product URL{'\n'}• Check the product barcode for UPC numbers
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <View className="flex-row gap-3">
          {onCancel && (
            <View className="flex-1">
              <Button label="Cancel" variant="outline" onPress={onCancel} />
            </View>
          )}
          <View className="flex-1">
            <Button
              label={isSubmitting ? 'Tracking...' : 'Start Tracking'}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
