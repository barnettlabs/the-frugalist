<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import FormField from './FormField.vue'
import BaseButton from './BaseButton.vue'
import { LeaseFormData, FormErrors, vehicleTypeOptions } from '@/types'

interface Props {
    form: LeaseFormData;
    errors: FormErrors;
    loading: boolean;
    title: string;
    backUrl: string;
    isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isEdit: false,
});

defineEmits<{
    submit: [];
    calculate: [];
}>();
</script>

<template>
    <div class="overflow-hidden rounded-lg bg-white shadow">
        <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-medium text-gray-900">
                    {{ title }}
                </h2>
                <Link
                    :href="backUrl"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back to Estimates
                </Link>
            </div>

            <form @submit.prevent="$emit('submit')" class="space-y-6">
                <!-- Basic Information -->
                <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                            v-model="form.sheet_name"
                            name="sheet_name"
                            label="Estimate Name"
                            :error="errors.sheet_name"
                        />

                        <FormField
                            v-model="form.sales_consultant"
                            name="sales_consultant"
                            label="Sales Consultant"
                            :error="errors.sales_consultant"
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
                            @input="$emit('calculate')"
                        />
                        
                        <FormField
                            v-model="form.dealer_contribution"
                            name="dealer_contribution"
                            label="Dealer Contribution"
                            type="currency"
                            :error="errors.dealer_contribution"
                            @input="$emit('calculate')"
                        />
                        
                        <FormField
                            v-model="form.trade_in"
                            name="trade_in"
                            label="Trade-in Value"
                            type="currency"
                            :error="errors.trade_in"
                            @input="$emit('calculate')"
                        />
                        
                        <FormField
                            v-model="form.doc_fee"
                            name="doc_fee"
                            label="Documentation Fee"
                            type="currency"
                            :error="errors.doc_fee"
                        />
                        
                        <FormField
                            v-model="form.acquisition_fee"
                            name="acquisition_fee"
                            label="Acquisition Fee"
                            type="currency"
                            :error="errors.acquisition_fee"
                        />
                        
                        <FormField
                            v-model="form.misc_fees"
                            name="misc_fees"
                            label="Miscellaneous Fees"
                            type="currency"
                            :error="errors.misc_fees"
                        />
                        
                        <FormField
                            v-model="form.lease_cash"
                            name="lease_cash"
                            label="Lease Cash"
                            type="currency"
                            :error="errors.lease_cash"
                            @input="$emit('calculate')"
                        />
                        
                        <FormField
                            v-model="form.down_payment"
                            name="down_payment"
                            label="Down Payment"
                            type="currency"
                            :error="errors.down_payment"
                            @input="$emit('calculate')"
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

                <!-- Lease Terms -->
                <div class="border-t border-gray-200 pt-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Lease Terms</h3>
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                            v-model="form.money_factor"
                            name="money_factor"
                            label="Money Factor"
                            type="number"
                            step="0.0001"
                            :min="0"
                            :max="1"
                            :error="errors.money_factor"
                        />
                        
                        <FormField
                            v-model="form.residual_percent"
                            name="residual_percent"
                            label="Residual Percent"
                            type="percentage"
                            :error="errors.residual_percent"
                        />
                        
                        <FormField
                            v-model="form.lease_term"
                            name="lease_term"
                            label="Lease Term (Months)"
                            type="number"
                            :min="1"
                            :max="60"
                            :error="errors.lease_term"
                        />
                        
                        <FormField
                            v-if="isEdit"
                            v-model="form.start_date"
                            name="start_date"
                            label="Start Date"
                            type="date"
                            :error="errors.start_date"
                        />
                    </div>
                </div>

                <!-- Contact Information (Edit mode only) -->
                <div v-if="isEdit" class="border-t border-gray-200 pt-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                <div class="flex justify-end space-x-3">
                    <Link
                        :href="backUrl"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </Link>
                    <BaseButton
                        type="submit"
                        :disabled="loading"
                        variant="primary"
                    >
                        <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Lease Estimate' : 'Create Lease Estimate') }}
                    </BaseButton>
                </div>
            </form>
        </div>
    </div>
</template>