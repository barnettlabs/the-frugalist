import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, ControlledInput, Text, View } from '@/components/ui';
import type { User } from '@/lib/types/models';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: User;
  onSubmit: (data: ProfileFormData) => void;
  isSubmitting: boolean;
}

export function ProfileForm({
  profile,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const { control, handleSubmit } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
    },
  });

  return (
    <View>
      <Text className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
        Profile Information
      </Text>

      <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <ControlledInput
              control={control}
              name="first_name"
              label="First Name"
              placeholder="John"
              autoCapitalize="words"
            />
          </View>
          <View className="flex-1">
            <ControlledInput
              control={control}
              name="last_name"
              label="Last Name"
              placeholder="Doe"
              autoCapitalize="words"
            />
          </View>
        </View>

        <ControlledInput
          control={control}
          name="email"
          label="Email"
          placeholder="john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="mt-4">
          <Button
            label={isSubmitting ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />
        </View>
      </View>

      {/* Email Verification Status */}
      <View className="mt-4 rounded-xl bg-white p-4 dark:bg-neutral-800">
        <Text className="mb-2 font-semibold text-neutral-900 dark:text-white">
          Email Verification
        </Text>
        {profile.email_verified_at ? (
          <View className="flex-row items-center">
            <Text className="text-green-600">✓ Email verified</Text>
          </View>
        ) : (
          <View>
            <Text className="text-yellow-600">Email not verified</Text>
            <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Please check your inbox for the verification email.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
