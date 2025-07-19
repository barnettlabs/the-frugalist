<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Head, router } from "@inertiajs/vue3";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.vue";
import LeaseForm from "@/Components/LeaseForm.vue";
import EstimateSummary from "@/Components/EstimateSummary.vue";
import {
    VehicleLeaseSheet,
    LeaseFormData,
    FormErrors,
    VehicleType,
    User,
    Profile,
} from "@/types";
import axios from "axios";
import { LeaseCalculator } from "@/utils/leaseCalculator";

interface Props {
    user: User;
    profile: Profile;
    sheet: VehicleLeaseSheet;
}

const props = defineProps<Props>();

const form = ref<LeaseFormData>(
    Object.assign(
        {},
        {
            sheet_name: "",
            sales_consultant: "",
            dealership_name: "",
            vehicle_type: VehicleType.CAR,
            vehicle_year: "",
            vehicle_make: "",
            vehicle_model: "",
            vehicle_trim: "",
            msrp: "",
            dealer_contribution: "",
            trade_in: "",
            doc_fee: "",
            acquisition_fee: "",
            misc_fees: "",
            lease_cash: "",
            down_payment: "",
            sales_tax_percent: "",
            money_factor: "",
            residual_percent: "",
            lease_term: "",
            start_date: "",
            contact_email: "",
            contact_phone: "",
            notes: "",
        },
        props.sheet,
    ),
);

const loading = ref(false);
const errors = ref<FormErrors>({});

const submitForm = async () => {
    loading.value = true;
    errors.value = {};

    try {
        const response = await axios.put(
            `/api/vehicle-lease-sheets/${props.sheet.id}`,
            form.value,
        );
        router.visit("/estimates/leasing");
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            console.error("Error updating lease sheet:", error);
        }
    } finally {
        loading.value = false;
    }
};

const calculatedCapitalizedCost = computed(() => {
    const calculator = new LeaseCalculator(form.value);
    return calculator.calculateNetCapCost();
});

const calculateTotals = () => {
    return calculatedCapitalizedCost.value;
};
</script>

<template>
    <Head title="Edit Lease Estimate" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-16 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div
                    class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8"
                >
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
