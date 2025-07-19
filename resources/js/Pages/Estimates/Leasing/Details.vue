<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import LeaseForm from '@/Components/LeaseForm.vue'
import EstimateSummary from '@/Components/EstimateSummary.vue'
import { LeaseFormData, FormErrors, VehicleType, User, Profile, VehicleLeaseSheet } from '@/types'
import { LeaseCalculator } from '@/utils/leaseCalculator'
import axios from 'axios'

interface Props {
    user: User
    profile: Profile
    sheet?: VehicleLeaseSheet
}

const props = defineProps<Props>()

const isEdit = computed(() => !!props.sheet)

const form = ref<LeaseFormData>(
    Object.assign(
        {
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
            sales_tax_percent: '',
            money_factor: '',
            residual_percent: '',
            lease_term: '',
            start_date: '',
            contact_email: '',
            contact_phone: '',
            notes: ''
        },
        props.sheet || {}
    )
)

const loading = ref(false)
const errors = ref<FormErrors>({})

const calculatedCapitalizedCost = computed(() => {
    const calculator = new LeaseCalculator(form.value)
    return calculator.calculateNetCapCost()
})

const submitForm = async () => {
    loading.value = true
    errors.value = {}

    try {
        if (isEdit.value) {
            await axios.put(`/api/vehicle-lease-sheets/${props.sheet.id}`, form.value)
        } else {
            await axios.post('/api/vehicle-lease-sheets', form.value)
        }
        router.visit('/estimates/leasing')
    } catch (error: any) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        } else {
            console.error(`Error ${isEdit.value ? 'updating' : 'creating'} lease sheet:`, error)
        }
    } finally {
        loading.value = false
    }
}

const calculateTotals = () => {
    return calculatedCapitalizedCost.value
}

const pageTitle = computed(() => {
    return isEdit.value ? 'Edit Lease Estimate' : 'Create Lease Estimate'
})

const formTitle = computed(() => {
    return isEdit.value ? 'Edit Lease Estimate' : 'Create Lease Estimate'
})
</script>

<template>
    <Head :title="pageTitle" />

    <AuthenticatedLayout :user="props.user" :profile="props.profile">
        <main class="-mt-16 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <section :aria-labelledby="`${isEdit ? 'edit' : 'create'}-lease-estimate-title`">
                            <LeaseForm
                                :form="form"
                                :errors="errors"
                                :loading="loading"
                                :title="formTitle"
                                back-url="/estimates/leasing"
                                :is-edit="isEdit"
                                @submit="submitForm"
                                @calculate="calculateTotals"
                            />
                        </section>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <EstimateSummary
                            estimate-type="lease"
                            :calculated-value="calculatedCapitalizedCost"
                            :monthly-payment="isEdit ? form.monthly_payment : undefined"
                        />
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>