<script setup>
import { ref, onMounted } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import axios from 'axios'

const props = defineProps({
    user: Object,
    profile: Object,
})

const form = ref({
    sheet_name: '',
    dealership_name: '',
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_trim: '',
    msrp: '',
    selling_price: '',
    down_payment: '',
    trade_in_value: '',
    trade_in_payoff: '',
    cash_rebate: '',
    dealer_rebate: '',
    other_incentives: '',
    sales_tax_rate: '',
    doc_fee: '',
    title_fee: '',
    license_fee: '',
    other_fees: '',
    interest_rate: '',
    loan_term_months: '',
    monthly_payment: '',
    total_interest: '',
    total_cost: '',
    notes: ''
})

const loading = ref(false)
const errors = ref({})

const submitForm = async () => {
    loading.value = true
    errors.value = {}

    try {
        const response = await axios.post('/api/vehicle-finance-sheets', form.value)
        router.visit('/estimates/financing')
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        } else {
            console.error('Error creating finance sheet:', error)
        }
    } finally {
        loading.value = false
    }
}

const calculateTotals = () => {
    // Basic calculations - you can enhance this
    const msrp = parseFloat(form.value.msrp) || 0
    const sellingPrice = parseFloat(form.value.selling_price) || msrp
    const downPayment = parseFloat(form.value.down_payment) || 0
    const tradeInValue = parseFloat(form.value.trade_in_value) || 0
    const tradeInPayoff = parseFloat(form.value.trade_in_payoff) || 0
    const cashRebate = parseFloat(form.value.cash_rebate) || 0
    const dealerRebate = parseFloat(form.value.dealer_rebate) || 0
    const otherIncentives = parseFloat(form.value.other_incentives) || 0

    const netTradeIn = tradeInValue - tradeInPayoff
    const totalRebates = cashRebate + dealerRebate + otherIncentives
    const amountFinanced = sellingPrice - downPayment - netTradeIn - totalRebates

    form.value.amount_financed = amountFinanced.toFixed(2)
}
</script>

<template>
    <Head title="Create Finance Estimate" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-16 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <section aria-labelledby="create-finance-estimate-title">
                            <div class="overflow-hidden rounded-lg bg-white shadow">
                                <div class="px-4 py-5 sm:p-6">
                                    <div class="flex items-center justify-between mb-6">
                                        <h2 class="text-lg font-medium text-gray-900">Create Finance Estimate</h2>
                                        <Link
                                            href="/estimates/financing"
                                            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Back to Estimates
                                        </Link>
                                    </div>

                                    <form @submit.prevent="submitForm" class="space-y-6">
                                        <!-- Basic Information -->
                                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label for="sheet_name" class="block text-sm font-medium text-gray-700">Estimate Name</label>
                                                <input
                                                    id="sheet_name"
                                                    v-model="form.sheet_name"
                                                    type="text"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    :class="{ 'border-red-500': errors.sheet_name }"
                                                />
                                                <p v-if="errors.sheet_name" class="mt-1 text-sm text-red-600">{{ errors.sheet_name[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="dealership_name" class="block text-sm font-medium text-gray-700">Dealership</label>
                                                <input
                                                    id="dealership_name"
                                                    v-model="form.dealership_name"
                                                    type="text"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    :class="{ 'border-red-500': errors.dealership_name }"
                                                />
                                                <p v-if="errors.dealership_name" class="mt-1 text-sm text-red-600">{{ errors.dealership_name[0] }}</p>
                                            </div>
                                        </div>

                                        <!-- Vehicle Information -->
                                        <div class="border-t border-gray-200 pt-6">
                                            <h3 class="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <label for="vehicle_year" class="block text-sm font-medium text-gray-700">Year</label>
                                                    <input
                                                        id="vehicle_year"
                                                        v-model="form.vehicle_year"
                                                        type="number"
                                                        min="1900"
                                                        max="2030"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.vehicle_year }"
                                                    />
                                                    <p v-if="errors.vehicle_year" class="mt-1 text-sm text-red-600">{{ errors.vehicle_year[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="vehicle_make" class="block text-sm font-medium text-gray-700">Make</label>
                                                    <input
                                                        id="vehicle_make"
                                                        v-model="form.vehicle_make"
                                                        type="text"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.vehicle_make }"
                                                    />
                                                    <p v-if="errors.vehicle_make" class="mt-1 text-sm text-red-600">{{ errors.vehicle_make[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="vehicle_model" class="block text-sm font-medium text-gray-700">Model</label>
                                                    <input
                                                        id="vehicle_model"
                                                        v-model="form.vehicle_model"
                                                        type="text"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.vehicle_model }"
                                                    />
                                                    <p v-if="errors.vehicle_model" class="mt-1 text-sm text-red-600">{{ errors.vehicle_model[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="vehicle_trim" class="block text-sm font-medium text-gray-700">Trim</label>
                                                    <input
                                                        id="vehicle_trim"
                                                        v-model="form.vehicle_trim"
                                                        type="text"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.vehicle_trim }"
                                                    />
                                                    <p v-if="errors.vehicle_trim" class="mt-1 text-sm text-red-600">{{ errors.vehicle_trim[0] }}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Pricing Information -->
                                        <div class="border-t border-gray-200 pt-6">
                                            <h3 class="text-lg font-medium text-gray-900 mb-4">Pricing Information</h3>
                                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <label for="msrp" class="block text-sm font-medium text-gray-700">MSRP</label>
                                                    <input
                                                        id="msrp"
                                                        v-model="form.msrp"
                                                        type="number"
                                                        step="0.01"
                                                        @input="calculateTotals"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.msrp }"
                                                    />
                                                    <p v-if="errors.msrp" class="mt-1 text-sm text-red-600">{{ errors.msrp[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="selling_price" class="block text-sm font-medium text-gray-700">Selling Price</label>
                                                    <input
                                                        id="selling_price"
                                                        v-model="form.selling_price"
                                                        type="number"
                                                        step="0.01"
                                                        @input="calculateTotals"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.selling_price }"
                                                    />
                                                    <p v-if="errors.selling_price" class="mt-1 text-sm text-red-600">{{ errors.selling_price[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="down_payment" class="block text-sm font-medium text-gray-700">Down Payment</label>
                                                    <input
                                                        id="down_payment"
                                                        v-model="form.down_payment"
                                                        type="number"
                                                        step="0.01"
                                                        @input="calculateTotals"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.down_payment }"
                                                    />
                                                    <p v-if="errors.down_payment" class="mt-1 text-sm text-red-600">{{ errors.down_payment[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="trade_in_value" class="block text-sm font-medium text-gray-700">Trade-in Value</label>
                                                    <input
                                                        id="trade_in_value"
                                                        v-model="form.trade_in_value"
                                                        type="number"
                                                        step="0.01"
                                                        @input="calculateTotals"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.trade_in_value }"
                                                    />
                                                    <p v-if="errors.trade_in_value" class="mt-1 text-sm text-red-600">{{ errors.trade_in_value[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="trade_in_payoff" class="block text-sm font-medium text-gray-700">Trade-in Payoff</label>
                                                    <input
                                                        id="trade_in_payoff"
                                                        v-model="form.trade_in_payoff"
                                                        type="number"
                                                        step="0.01"
                                                        @input="calculateTotals"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.trade_in_payoff }"
                                                    />
                                                    <p v-if="errors.trade_in_payoff" class="mt-1 text-sm text-red-600">{{ errors.trade_in_payoff[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="cash_rebate" class="block text-sm font-medium text-gray-700">Cash Rebate</label>
                                                    <input
                                                        id="cash_rebate"
                                                        v-model="form.cash_rebate"
                                                        type="number"
                                                        step="0.01"
                                                        @input="calculateTotals"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.cash_rebate }"
                                                    />
                                                    <p v-if="errors.cash_rebate" class="mt-1 text-sm text-red-600">{{ errors.cash_rebate[0] }}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Finance Terms -->
                                        <div class="border-t border-gray-200 pt-6">
                                            <h3 class="text-lg font-medium text-gray-900 mb-4">Finance Terms</h3>
                                            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <label for="interest_rate" class="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                                                    <input
                                                        id="interest_rate"
                                                        v-model="form.interest_rate"
                                                        type="number"
                                                        step="0.01"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.interest_rate }"
                                                    />
                                                    <p v-if="errors.interest_rate" class="mt-1 text-sm text-red-600">{{ errors.interest_rate[0] }}</p>
                                                </div>

                                                <div>
                                                    <label for="loan_term_months" class="block text-sm font-medium text-gray-700">Loan Term (Months)</label>
                                                    <input
                                                        id="loan_term_months"
                                                        v-model="form.loan_term_months"
                                                        type="number"
                                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        :class="{ 'border-red-500': errors.loan_term_months }"
                                                    />
                                                    <p v-if="errors.loan_term_months" class="mt-1 text-sm text-red-600">{{ errors.loan_term_months[0] }}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Notes -->
                                        <div class="border-t border-gray-200 pt-6">
                                            <div>
                                                <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
                                                <textarea
                                                    id="notes"
                                                    v-model="form.notes"
                                                    rows="4"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    :class="{ 'border-red-500': errors.notes }"
                                                ></textarea>
                                                <p v-if="errors.notes" class="mt-1 text-sm text-red-600">{{ errors.notes[0] }}</p>
                                            </div>
                                        </div>

                                        <!-- Submit Button -->
                                        <div class="flex justify-end space-x-3">
                                            <Link
                                                href="/estimates/financing"
                                                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                :disabled="loading"
                                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            >
                                                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {{ loading ? 'Creating...' : 'Create Estimate' }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <!-- Summary Card -->
                        <div class="overflow-hidden rounded-lg bg-white shadow">
                            <div class="px-4 py-5 sm:p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Summary</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Amount Financed:</span>
                                        <span class="text-sm font-medium">${{ form.amount_financed || '0.00' }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Monthly Payment:</span>
                                        <span class="text-sm font-medium">${{ form.monthly_payment || '0.00' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
