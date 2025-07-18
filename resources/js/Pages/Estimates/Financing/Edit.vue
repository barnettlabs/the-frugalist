<script setup>
import { ref, onMounted, computed } from 'vue'
import { Head, router, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import AmortizationTable from '@/Components/Finance/AmortizationTable.vue'
import PaymentCharts from '@/Components/Finance/PaymentCharts.vue'
import ExtraPayments from '@/Components/Finance/ExtraPayments.vue'
import AdvancedCalculations from '@/Components/Finance/AdvancedCalculations.vue'
import axios from 'axios'

const props = defineProps({
    user: Object,
    profile: Object,
    sheet: Object,
})

// Form matches the database schema
const form = ref({
    sheet_name: '',
    sales_consultant: '',
    dealership_name: '',
    vehicle_type: 'CAR',
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_trim: '',
    msrp: '',
    fees: '',
    discounts: '',
    rebates: '',
    down_payment: '',
    sales_tax_percent: '',
    interest_rate: '',
    finance_term: '',
    start_date: '',
    contact_email: '',
    contact_phone: '',
    extra_payments_json: '',
    notes: ''
})

const loading = ref(false)
const errors = ref({})

onMounted(() => {
    if (props.sheet) {
        // Populate form with existing data
        Object.keys(form.value).forEach(key => {
            if (props.sheet[key] !== undefined && props.sheet[key] !== null) {
                form.value[key] = props.sheet[key]
            }
        })
    }
})

const submitForm = async () => {
    loading.value = true
    errors.value = {}

    try {
        const response = await axios.put(`/api/vehicle-finance-sheets/${props.sheet.id}`, form.value)
        router.visit('/estimates/financing')
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        } else {
            console.error('Error updating finance sheet:', error)
        }
    } finally {
        loading.value = false
    }
}

const vehicleTitle = computed(() => {
    const parts = [form.value.vehicle_year, form.value.vehicle_make, form.value.vehicle_model, form.value.vehicle_trim]
        .filter(part => part && part.trim())
    return parts.length > 0 ? parts.join(' ') : 'Finance Estimate'
})
</script>

<template>
    <Head :title="`Edit ${vehicleTitle}`" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-24 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <!-- Hero Header -->
                <div class="mb-8">
                    <div class="glass rounded-2xl p-8 text-gray-900 bg-white/80 relative overflow-hidden">
                        <div class="absolute inset-0 overflow-hidden pointer-events-none">
                            <div class="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full"></div>
                            <div class="absolute bottom-0 -left-4 w-24 h-24 bg-primary/10 rounded-full"></div>
                        </div>

                        <div class="relative text-center lg:text-left">
                            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div class="flex items-center space-x-6 mb-6 lg:mb-0">
                                    <div class="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20">
                                        <svg class="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 class="text-4xl font-bold text-gray-900 mb-2">
                                            Edit Finance Estimate
                                        </h1>
                                        <p class="text-lg text-gray-600">
                                            {{ vehicleTitle }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex space-x-3">
                                    <Link href="/estimates/financing" 
                                          class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-150">
                                        Back to List
                                    </Link>
                                    <button
                                        @click="submitForm"
                                        :disabled="loading"
                                        class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{{ loading ? 'Saving...' : 'Save Changes' }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <!-- Main Form -->
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <section aria-labelledby="edit-finance-estimate-title">
                            <div class="futuristic-card p-6">
                                <form @submit.prevent="submitForm" class="space-y-6">
                                    <!-- Basic Information -->
                                    <div>
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label for="sheet_name" class="block text-sm font-medium text-gray-700">Sheet Name</label>
                                                <input
                                                    id="sheet_name"
                                                    v-model="form.sheet_name"
                                                    type="text"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.sheet_name }"
                                                />
                                                <p v-if="errors.sheet_name" class="mt-1 text-sm text-red-600">{{ errors.sheet_name[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="sales_consultant" class="block text-sm font-medium text-gray-700">Sales Consultant</label>
                                                <input
                                                    id="sales_consultant"
                                                    v-model="form.sales_consultant"
                                                    type="text"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.sales_consultant }"
                                                />
                                                <p v-if="errors.sales_consultant" class="mt-1 text-sm text-red-600">{{ errors.sales_consultant[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="dealership_name" class="block text-sm font-medium text-gray-700">Dealership</label>
                                                <input
                                                    id="dealership_name"
                                                    v-model="form.dealership_name"
                                                    type="text"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.dealership_name }"
                                                />
                                                <p v-if="errors.dealership_name" class="mt-1 text-sm text-red-600">{{ errors.dealership_name[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="vehicle_type" class="block text-sm font-medium text-gray-700">Vehicle Type</label>
                                                <select
                                                    id="vehicle_type"
                                                    v-model="form.vehicle_type"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.vehicle_type }"
                                                >
                                                    <option value="CAR">Car</option>
                                                    <option value="TRUCK">Truck</option>
                                                    <option value="SUV">SUV</option>
                                                </select>
                                                <p v-if="errors.vehicle_type" class="mt-1 text-sm text-red-600">{{ errors.vehicle_type[0] }}</p>
                                            </div>
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
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
                                                <div class="relative">
                                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        id="msrp"
                                                        v-model="form.msrp"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        class="pl-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        :class="{ 'border-red-500': errors.msrp }"
                                                    />
                                                </div>
                                                <p v-if="errors.msrp" class="mt-1 text-sm text-red-600">{{ errors.msrp[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="fees" class="block text-sm font-medium text-gray-700">Fees</label>
                                                <div class="relative">
                                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        id="fees"
                                                        v-model="form.fees"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        class="pl-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        :class="{ 'border-red-500': errors.fees }"
                                                    />
                                                </div>
                                                <p v-if="errors.fees" class="mt-1 text-sm text-red-600">{{ errors.fees[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="discounts" class="block text-sm font-medium text-gray-700">Discounts</label>
                                                <div class="relative">
                                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        id="discounts"
                                                        v-model="form.discounts"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        class="pl-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        :class="{ 'border-red-500': errors.discounts }"
                                                    />
                                                </div>
                                                <p v-if="errors.discounts" class="mt-1 text-sm text-red-600">{{ errors.discounts[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="rebates" class="block text-sm font-medium text-gray-700">Rebates</label>
                                                <div class="relative">
                                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        id="rebates"
                                                        v-model="form.rebates"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        class="pl-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        :class="{ 'border-red-500': errors.rebates }"
                                                    />
                                                </div>
                                                <p v-if="errors.rebates" class="mt-1 text-sm text-red-600">{{ errors.rebates[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="down_payment" class="block text-sm font-medium text-gray-700">Down Payment</label>
                                                <div class="relative">
                                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        id="down_payment"
                                                        v-model="form.down_payment"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        class="pl-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        :class="{ 'border-red-500': errors.down_payment }"
                                                    />
                                                </div>
                                                <p v-if="errors.down_payment" class="mt-1 text-sm text-red-600">{{ errors.down_payment[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="sales_tax_percent" class="block text-sm font-medium text-gray-700">Sales Tax (%)</label>
                                                <div class="relative">
                                                    <input
                                                        id="sales_tax_percent"
                                                        v-model="form.sales_tax_percent"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        class="pr-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        :class="{ 'border-red-500': errors.sales_tax_percent }"
                                                    />
                                                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                                                </div>
                                                <p v-if="errors.sales_tax_percent" class="mt-1 text-sm text-red-600">{{ errors.sales_tax_percent[0] }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Finance Terms -->
                                    <div class="border-t border-gray-200 pt-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Finance Terms</h3>
                                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label for="interest_rate" class="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                                                <div class="relative">
                                                    <input
                                                        id="interest_rate"
                                                        v-model="form.interest_rate"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        class="pr-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                        :class="{ 'border-red-500': errors.interest_rate }"
                                                    />
                                                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                                                </div>
                                                <p v-if="errors.interest_rate" class="mt-1 text-sm text-red-600">{{ errors.interest_rate[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="finance_term" class="block text-sm font-medium text-gray-700">Finance Term (Months)</label>
                                                <input
                                                    id="finance_term"
                                                    v-model="form.finance_term"
                                                    type="number"
                                                    min="1"
                                                    max="120"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.finance_term }"
                                                />
                                                <p v-if="errors.finance_term" class="mt-1 text-sm text-red-600">{{ errors.finance_term[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
                                                <input
                                                    id="start_date"
                                                    v-model="form.start_date"
                                                    type="date"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.start_date }"
                                                />
                                                <p v-if="errors.start_date" class="mt-1 text-sm text-red-600">{{ errors.start_date[0] }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Contact Information -->
                                    <div class="border-t border-gray-200 pt-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label for="contact_email" class="block text-sm font-medium text-gray-700">Contact Email</label>
                                                <input
                                                    id="contact_email"
                                                    v-model="form.contact_email"
                                                    type="email"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.contact_email }"
                                                />
                                                <p v-if="errors.contact_email" class="mt-1 text-sm text-red-600">{{ errors.contact_email[0] }}</p>
                                            </div>

                                            <div>
                                                <label for="contact_phone" class="block text-sm font-medium text-gray-700">Contact Phone</label>
                                                <input
                                                    id="contact_phone"
                                                    v-model="form.contact_phone"
                                                    type="tel"
                                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                    :class="{ 'border-red-500': errors.contact_phone }"
                                                />
                                                <p v-if="errors.contact_phone" class="mt-1 text-sm text-red-600">{{ errors.contact_phone[0] }}</p>
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
                                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                                :class="{ 'border-red-500': errors.notes }"
                                            ></textarea>
                                            <p v-if="errors.notes" class="mt-1 text-sm text-red-600">{{ errors.notes[0] }}</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </section>

                        <!-- Extra Payments -->
                        <ExtraPayments 
                            v-model="form.extra_payments_json" 
                            :data="form" 
                        />

                        <!-- Amortization Table -->
                        <AmortizationTable :data="form" />

                        <!-- Payment Charts -->
                        <PaymentCharts :data="form" />
                    </div>

                    <!-- Right Sidebar -->
                    <div class="space-y-6">
                        <!-- Advanced Calculations -->
                        <AdvancedCalculations :data="form" />
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
