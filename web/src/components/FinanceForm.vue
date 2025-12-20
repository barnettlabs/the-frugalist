<script setup lang="ts">
import { RouterLink } from 'vue-router'
import FormField from './FormField.vue'
import BaseButton from './BaseButton.vue'
import { FinanceFormData, FormErrors, vehicleTypeOptions } from '@/types'

interface Props {
  form: FinanceFormData
  errors: FormErrors
  loading: boolean
  title: string
  backUrl: string
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
})

defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 bg-white">
    <form @submit.prevent="$emit('submit')" class="space-y-6">
      <!-- Basic Information -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            v-model="form.sheet_name"
            name="sheet_name"
            label="Estimate Name"
            :error="errors.sheet_name"
          />

          <FormField
            v-model="form.dealership_name"
            name="dealership_name"
            label="Dealership"
            :error="errors.dealership_name"
          />

          <FormField
            v-model="form.vehicle_type"
            name="vehicle_type"
            label="Vehicle Type"
            type="select"
            :options="vehicleTypeOptions"
            :error="errors.vehicle_type"
          />
        </div>
      </div>

      <!-- Contact Information (Edit mode only) -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            v-model="form.sales_consultant"
            name="sales_consultant"
            label="Sales Consultant"
            :error="errors.sales_consultant"
          />

          <FormField
            v-model="form.contact_email"
            name="contact_email"
            label="Contact Email"
            type="email"
            :error="errors.contact_email"
          />

          <FormField
            v-model="form.contact_phone"
            name="contact_phone"
            label="Contact Phone"
            type="tel"
            :error="errors.contact_phone"
          />
        </div>
      </div>

      <!-- Vehicle Information -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            v-model="form.vehicle_year"
            name="vehicle_year"
            label="Year"
            type="number"
            :min="1900"
            :max="2030"
            :error="errors.vehicle_year"
          />

          <FormField
            v-model="form.vehicle_make"
            name="vehicle_make"
            label="Make"
            :error="errors.vehicle_make"
          />

          <FormField
            v-model="form.vehicle_model"
            name="vehicle_model"
            label="Model"
            :error="errors.vehicle_model"
          />

          <FormField
            v-model="form.vehicle_trim"
            name="vehicle_trim"
            label="Trim"
            :error="errors.vehicle_trim"
          />
        </div>
      </div>

      <!-- Pricing Information -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Pricing Information</h3>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            v-model="form.msrp"
            name="msrp"
            label="MSRP"
            type="currency"
            :error="errors.msrp"
          />

          <FormField
            v-model="form.fees"
            name="fees"
            label="Fees"
            type="currency"
            :error="errors.fees"
          />

          <FormField
            v-model="form.discounts"
            name="discounts"
            label="Discounts"
            type="currency"
            :error="errors.discounts"
          />

          <FormField
            v-model="form.rebates"
            name="rebates"
            label="Rebates"
            type="currency"
            :error="errors.rebates"
          />

          <FormField
            v-model="form.down_payment"
            name="down_payment"
            label="Down Payment"
            type="currency"
            :error="errors.down_payment"
          />

          <FormField
            v-model="form.sales_tax_percent"
            name="sales_tax_percent"
            label="Sales Tax Percent"
            type="percentage"
            :error="errors.sales_tax_percent"
          />
        </div>
      </div>

      <!-- Finance Terms -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Finance Terms</h3>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            v-model="form.interest_rate"
            name="interest_rate"
            label="Interest Rate"
            type="percentage"
            :error="errors.interest_rate"
          />

          <FormField
            v-model="form.finance_term"
            name="finance_term"
            label="Finance Term (Months)"
            type="number"
            :min="1"
            :max="120"
            :error="errors.finance_term"
          />

          <FormField
            name="start_date"
            label="Start Date"
            type="date"
            :error="errors.start_date"
            :model-value="form.start_date ? form.start_date.substring(0, 10) : ''"
            @input="
              (event: any) => {
                form.start_date = event.target.value
              }
            "
          />
        </div>
      </div>

      <!-- Notes -->
      <div class="border-t border-gray-200 pt-6">
        <FormField
          v-model="form.notes"
          name="notes"
          label="Notes"
          type="textarea"
          :error="errors.notes"
        />
      </div>

      <!-- Submit Button -->
      <div v-if="!isEdit" class="flex justify-end space-x-3">
        <RouterLink
          :to="backUrl"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </RouterLink>
        <BaseButton type="submit" :disabled="loading" variant="primary">
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ loading ? 'Creating...' : 'Create Finance Estimate' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>
