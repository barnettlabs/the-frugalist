<script setup lang="ts">
import { ref, computed } from "vue";
import { Head, Link, router } from "@inertiajs/vue3";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.vue";
import FinanceForm from "@/Components/FinanceForm.vue";
import EstimateSummary from "@/Components/EstimateSummary.vue";
import { FinanceFormData, FormErrors, VehicleType } from "@/types";
import { parseOrZero } from "@/utils/formatters";
import axios from "axios";
import { calculateAmountFinanced } from "@/utils/vehicleCalculations";

const props = defineProps({
    user: Object,
    profile: Object,
});

const form = ref<FinanceFormData>({
    sheet_name: "",
    sales_consultant: "",
    dealership_name: "",
    vehicle_type: VehicleType.CAR,
    vehicle_year: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_trim: "",
    msrp: "",
    fees: "",
    discounts: "",
    rebates: "",
    down_payment: "",
    sales_tax_percent: "",
    interest_rate: "",
    finance_term: "",
    start_date: "",
    contact_email: "",
    contact_phone: "",
    extra_payments_json: "",
    notes: "",
});

const loading = ref(false);
const errors = ref<FormErrors>({});

const calculatedAmountFinanced = computed(() => {
    const msrp = parseOrZero(form.value.msrp);
    const sellingPrice = parseOrZero(form.value.selling_price) || msrp;

    return calculateAmountFinanced({
        sellingPrice,
        downPayment: form.value.down_payment,
        tradeInValue: form.value.trade_in_value,
        tradeInPayoff: form.value.trade_in_payoff,
        cashRebate: form.value.cash_rebate,
        dealerRebate: form.value.dealer_rebate,
        otherIncentives: form.value.other_incentives,
    });
});

const submitForm = async () => {
    loading.value = true;
    errors.value = {};

    try {
        form.value.amount_financed = calculatedAmountFinanced.value;
        const response = await axios.post(
            "/api/vehicle-finance-sheets",
            form.value,
        );
        router.visit("/estimates/financing");
    } catch (error: any) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            console.error("Error creating finance sheet:", error);
        }
    } finally {
        loading.value = false;
    }
};

const calculateTotals = () => {
    form.value.amount_financed = calculatedAmountFinanced.value;
};
</script>

<template>
    <Head title="Create Finance Estimate" />

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
                                            Create Finance Estimate
                                        </h1>
                                        <p class="text-lg text-gray-600">
                                            Calculate vehicle financing options
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
                                        <span>{{ loading ? 'Creating...' : 'Create Estimate' }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <!-- Main Form -->
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <section aria-labelledby="create-finance-estimate-title">
                            <FinanceForm
                                :form="form"
                                :errors="errors"
                                :loading="loading"
                                title="Create Finance Estimate"
                                back-url="/estimates/financing"
                                @submit="submitForm"
                                @calculate="calculateTotals"
                            />
                        </section>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <EstimateSummary
                            estimate-type="finance"
                            :calculated-value="calculatedAmountFinanced"
                            :monthly-payment="form.monthly_payment"
                        />
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
