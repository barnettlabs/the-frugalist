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
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                            min="1900"
                            max="2030"
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
                            v-model="form.selling_price"
                            name="selling_price"
                            label="Selling Price"
                            type="currency"
                            :error="errors.selling_price"
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
                            v-model="form.trade_in_value"
                            name="trade_in_value"
                            label="Trade-in Value"
                            type="currency"
                            :error="errors.trade_in_value"
                            @input="$emit('calculate')"
                        />
                        
                        <FormField
                            v-model="form.trade_in_payoff"
                            name="trade_in_payoff"
                            label="Trade-in Payoff"
                            type="currency"
                            :error="errors.trade_in_payoff"
                            @input="$emit('calculate')"
                        />
                        
                        <FormField
                            v-model="form.cash_rebate"
                            name="cash_rebate"
                            label="Cash Rebate"
                            type="currency"
                            :error="errors.cash_rebate"
                            @input="$emit('calculate')"
                        />
                    </div>
                </div>

                <!-- Finance/Lease Terms -->
                <div class="border-t border-gray-200 pt-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                        {{ estimateType === 'finance' ? 'Finance Terms' : 'Lease Terms' }}
                    </h3>
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <!-- Finance specific fields -->
                        <template v-if="estimateType === 'finance'">
                            <FormField
                                v-model="form.interest_rate"
                                name="interest_rate"
                                label="Interest Rate"
                                type="percentage"
                                :error="errors.interest_rate"
                            />
                            
                            <FormField
                                v-model="form.loan_term_months"
                                name="loan_term_months"
                                label="Loan Term (Months)"
                                type="number"
                                :min="1"
                                :max="120"
                                :error="errors.loan_term_months"
                            />
                        </template>
                        
                        <!-- Lease specific fields -->
                        <template v-else>
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
                                v-model="form.lease_term_months"
                                name="lease_term_months"
                                label="Lease Term (Months)"
                                type="number"
                                :min="1"
                                :max="60"
                                :error="errors.lease_term_months"
                            />
                            
                            <FormField
                                v-model="form.residual_value"
                                name="residual_value"
                                label="Residual Value"
                                type="currency"
                                :error="errors.residual_value"
                            />
                        </template>
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
                        {{ loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Estimate' : 'Create Estimate') }}
                    </BaseButton>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3'
import FormField from './FormField.vue'
import BaseButton from './BaseButton.vue'

defineEmits(['submit', 'calculate'])

defineProps({
    form: {
        type: Object,
        required: true
    },
    errors: {
        type: Object,
        default: () => ({})
    },
    loading: {
        type: Boolean,
        default: false
    },
    estimateType: {
        type: String,
        required: true,
        validator: (value) => ['finance', 'lease'].includes(value)
    },
    title: {
        type: String,
        required: true
    },
    backUrl: {
        type: String,
        required: true
    },
    isEdit: {
        type: Boolean,
        default: false
    }
})
</script>