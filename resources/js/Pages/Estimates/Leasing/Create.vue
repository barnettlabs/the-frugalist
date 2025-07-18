<script setup>
import { ref, computed } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import LeaseForm from '@/Components/LeaseForm.vue'
import EstimateSummary from '@/Components/EstimateSummary.vue'
import { calculateCapitalizedCost } from '@/utils/vehicleCalculations.js'
import { parseOrZero } from '@/utils/formatters.js'
import axios from 'axios'

const props = defineProps({
    user: Object,
    profile: Object,
})

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
    dealer_contribution: '',
    trade_in: '',
    doc_fee: '',
    acquisition_fee: '',
    misc_fees: '',
    lease_cash: '',
    down_payment: '',
    money_factor: '',
    sales_tax_percent: '',
    residual_percent: '',
    lease_term: '',
    start_date: '',
    contact_email: '',
    contact_phone: '',
    notes: ''
})

const loading = ref(false)
const errors = ref({})

const calculatedCapitalizedCost = computed(() => {
    const msrp = parseOrZero(form.value.msrp)
    const sellingPrice = parseOrZero(form.value.selling_price) || msrp
    
    return calculateCapitalizedCost({
        sellingPrice,
        tradeInValue: form.value.trade_in_value,
        tradeInPayoff: form.value.trade_in_payoff,
        cashRebate: form.value.cash_rebate,
        dealerRebate: form.value.dealer_rebate,
        otherIncentives: form.value.other_incentives
    })
})

const submitForm = async () => {
    loading.value = true
    errors.value = {}

    try {
        form.value.capitalized_cost = calculatedCapitalizedCost.value
        const response = await axios.post('/api/vehicle-lease-sheets', form.value)
        router.visit('/estimates/leasing')
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        } else {
            console.error('Error creating lease sheet:', error)
        }
    } finally {
        loading.value = false
    }
}

const calculateTotals = () => {
    form.value.capitalized_cost = calculatedCapitalizedCost.value
}
</script>

<template>
    <Head title="Create Lease Estimate" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-16 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <section aria-labelledby="create-lease-estimate-title">
                            <LeaseForm
                                :form="form"
                                :errors="errors"
                                :loading="loading"
                                title="Create Lease Estimate"
                                back-url="/estimates/leasing"
                                @submit="submitForm"
                                @calculate="calculateTotals"
                            />
                        </section>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <EstimateSummary
                            estimate-type="lease"
                            :calculated-value="calculatedCapitalizedCost"
                            :monthly-payment="form.monthly_payment"
                        />
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
