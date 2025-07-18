<template>
    <div class="futuristic-card p-6 bg-white">
        <div v-if="!isEdit" class="flex items-center justify-between mb-6">
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
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                </h3>
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
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Vehicle Information
                </h3>
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
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Pricing Information
                </h3>
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

                    <FormField
                        v-model="form.dealer_rebate"
                        name="dealer_rebate"
                        label="Dealer Rebate"
                        type="currency"
                        :error="errors.dealer_rebate"
                        @input="$emit('calculate')"
                    />

                    <FormField
                        v-model="form.other_incentives"
                        name="other_incentives"
                        label="Other Incentives"
                        type="currency"
                        :error="errors.other_incentives"
                        @input="$emit('calculate')"
                    />

                    <FormField
                        v-model="form.sales_tax_percent"
                        name="sales_tax_percent"
                        label="Sales Tax Percent"
                        type="percentage"
                        :error="errors.sales_tax_percent"
                    />

                    <FormField
                        v-if="!isEdit"
                        v-model="form.doc_fee"
                        name="doc_fee"
                        label="Documentation Fee"
                        type="currency"
                        :error="errors.doc_fee"
                    />

                    <FormField
                        v-if="!isEdit"
                        v-model="form.title_fee"
                        name="title_fee"
                        label="Title Fee"
                        type="currency"
                        :error="errors.title_fee"
                    />

                    <FormField
                        v-if="!isEdit"
                        v-model="form.license_fee"
                        name="license_fee"
                        label="License Fee"
                        type="currency"
                        :error="errors.license_fee"
                    />

                    <FormField
                        v-if="!isEdit"
                        v-model="form.other_fees"
                        name="other_fees"
                        label="Other Fees"
                        type="currency"
                        :error="errors.other_fees"
                    />
                </div>
            </div>

            <!-- Finance Terms -->
            <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Finance Terms
                </h3>
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
                        :error="errors.finance_term || errors.loan_term_months"
                    />

                    <FormField
                        v-if="isEdit"
                        v-model="form.start_date"
                        name="start_date"
                        label="Start Date"
                        type="date"
                        :error="errors.start_date"
                    />

                    <FormField
                        v-if="!isEdit"
                        v-model="form.monthly_payment"
                        name="monthly_payment"
                        label="Monthly Payment"
                        type="currency"
                        :error="errors.monthly_payment"
                    />

                    <FormField
                        v-if="!isEdit"
                        v-model="form.total_interest"
                        name="total_interest"
                        label="Total Interest"
                        type="currency"
                        :error="errors.total_interest"
                    />

                    <FormField
                        v-if="!isEdit"
                        v-model="form.total_cost"
                        name="total_cost"
                        label="Total Cost"
                        type="currency"
                        :error="errors.total_cost"
                    />
                </div>
            </div>

            <!-- Contact Information (Edit mode only) -->
            <div v-if="isEdit" class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Contact Information
                </h3>
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
            <div v-if="!isEdit" class="flex justify-end space-x-3">
                <Link
                    :href="backUrl"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </Link>
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
                    {{ loading ? "Creating..." : "Create Finance Estimate" }}
                </BaseButton>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { Link } from "@inertiajs/vue3";
import FormField from "./FormField.vue";
import BaseButton from "./BaseButton.vue";

defineEmits(["submit", "calculate"]);

defineProps({
    form: {
        type: Object,
        required: true,
    },
    errors: {
        type: Object,
        default: () => ({}),
    },
    loading: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        required: true,
    },
    backUrl: {
        type: String,
        required: true,
    },
    isEdit: {
        type: Boolean,
        default: false,
    },
});

const vehicleTypeOptions = [
    { value: "CAR", label: "Car" },
    { value: "TRUCK", label: "Truck" },
    { value: "SUV", label: "SUV" },
];
</script>
