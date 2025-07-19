<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import LeaseForm from '@/Components/LeaseForm.vue'
import EstimateSummary from '@/Components/EstimateSummary.vue'
import { LeaseFormData, FormErrors, VehicleType, User, Profile } from '@/types'
import { parseOrZero } from '@/utils/formatters'
import axios from 'axios'

interface Props {
    user: User;
    profile: Profile;
}

const props = defineProps<Props>();

const form = ref<LeaseFormData>({
    sheet_name: '',
    sales_consultant: '',
    dealership_name: '',
    vehicle_type: VehicleType.CAR,
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
const errors = ref<FormErrors>({})

const calculatedCapitalizedCost = computed(() => {
    const msrp = parseOrZero(form.value.msrp)
    const dealerContribution = parseOrZero(form.value.dealer_contribution)
    const tradeIn = parseOrZero(form.value.trade_in)
    const leaseCash = parseOrZero(form.value.lease_cash)
    const downPayment = parseOrZero(form.value.down_payment)
    
    // Calculate capitalized cost based on new schema
    const adjustedCapCost = msrp + dealerContribution - tradeIn - leaseCash - downPayment
    return Math.max(0, adjustedCapCost)
})

const submitForm = async () => {
    loading.value = true
    errors.value = {}

    try {
        await axios.post('/api/vehicle-lease-sheets', form.value)
        router.visit('/estimates/leasing')
    } catch (error: any) {
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
    // This function can be used if needed later
    return calculatedCapitalizedCost.value
}
</script>

<template>
    <Head title="Create Lease Estimate" />

    <AuthenticatedLayout :user="props.user" :profile="props.profile">
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
