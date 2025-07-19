<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import LeaseForm from '@/Components/LeaseForm.vue'
import EstimateSummary from '@/Components/EstimateSummary.vue'
import { VehicleLeaseSheet, LeaseFormData, FormErrors, User, Profile } from '@/types'
import { parseOrZero } from '@/utils/formatters'
import axios from 'axios'
import { calculateCapitalizedCost } from '@/utils/vehicleCalculations'

interface Props {
    user: User;
    profile: Profile;
    sheet: VehicleLeaseSheet;
}

const props = defineProps<Props>();

const form = ref<LeaseFormData>({
    sheet_name: '',
    dealership_name: '',
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_trim: '',
    msrp: '',
    down_payment: '',
    trade_in: '',
    sales_tax_rate: '',
    doc_fee: '',
    title_fee: '',
    license_fee: '',
    other_fees: '',
    money_factor: '',
    lease_term_months: '',
    monthly_payment: '',
    residual_value: '',
    notes: '',
    capitalized_cost: ''
})

const loading = ref(false)
const errors = ref<FormErrors>({})

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
        form.value.capitalized_cost = calculatedCapitalizedCost.value
        const response = await axios.put(`/api/vehicle-lease-sheets/${props.sheet.id}`, form.value)
        router.visit('/estimates/leasing')
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        } else {
            console.error('Error updating lease sheet:', error)
        }
    } finally {
        loading.value = false
    }
}

const calculatedCapitalizedCost = computed(() => {
    const msrp = parseOrZero(form.value.msrp)

    return calculateCapitalizedCost({
        tradeInValue: form.value.trade_in_value,
        tradeInPayoff: form.value.trade_in_payoff,
        cashRebate: form.value.cash_rebate,
        dealerRebate: form.value.dealer_rebate,
        otherIncentives: form.value.other_incentives
    })
})

const calculateTotals = () => {
    form.value.capitalized_cost = calculatedCapitalizedCost.value
}
</script>

<template>
    <Head title="Edit Lease Estimate" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-16 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <section aria-labelledby="edit-lease-estimate-title">
                            <LeaseForm
                                :form="form"
                                :errors="errors"
                                :loading="loading"
                                title="Edit Lease Estimate"
                                back-url="/estimates/leasing"
                                is-edit
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
