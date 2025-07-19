<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Head, router, Link } from "@inertiajs/vue3";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.vue";
import FinanceForm from "@/Components/FinanceForm.vue";
import AmortizationTable from "@/Components/Finance/AmortizationTable.vue";
import PaymentCharts from "@/Components/Finance/PaymentCharts.vue";
import ExtraPayments from "@/Components/Finance/ExtraPayments.vue";
import AdvancedCalculations from "@/Components/Finance/AdvancedCalculations.vue";
import { VehicleFinanceSheet, FinanceFormData, FormErrors, User, Profile } from "@/types";
import axios from "axios";

interface Props {
    user: User;
    profile: Profile;
    sheet: VehicleFinanceSheet;
}

const props = defineProps<Props>();

// Form matches the database schema
const form = ref<FinanceFormData>({
    sheet_name: "",
    sales_consultant: "",
    dealership_name: "",
    vehicle_type: "CAR",
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

onMounted(() => {
    if (props.sheet) {
        // Populate form with existing data
        Object.keys(form.value).forEach((key) => {
            if (props.sheet[key] !== undefined && props.sheet[key] !== null) {
                form.value[key] = props.sheet[key];
            }
        });
    }
});

const submitForm = async () => {
    loading.value = true;
    errors.value = {};

    try {
        const response = await axios.put(
            `/api/vehicle-finance-sheets/${props.sheet.id}`,
            form.value,
        );
        router.visit("/estimates/financing");
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            console.error("Error updating finance sheet:", error);
        }
    } finally {
        loading.value = false;
    }
};

const vehicleTitle = computed(() => {
    const parts = [
        form.value.vehicle_year,
        form.value.vehicle_make,
        form.value.vehicle_model,
        form.value.vehicle_trim,
    ].filter((part) => part && part.trim());
    return parts.length > 0 ? parts.join(" ") : "Finance Estimate";
});
</script>

<template>
    <Head :title="`Edit ${vehicleTitle}`" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-24 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <!-- Hero Header -->
                <div class="mb-8">
                    <div
                        class="glass rounded-2xl p-8 text-gray-900 bg-white/80 relative overflow-hidden"
                    >
                        <div
                            class="absolute inset-0 overflow-hidden pointer-events-none"
                        >
                            <div
                                class="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full"
                            ></div>
                            <div
                                class="absolute bottom-0 -left-4 w-24 h-24 bg-primary/10 rounded-full"
                            ></div>
                        </div>

                        <div class="relative text-center lg:text-left">
                            <div
                                class="flex flex-col lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div
                                    class="flex items-center space-x-6 mb-6 lg:mb-0"
                                >
                                    <div
                                        class="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20"
                                    >
                                        <svg
                                            class="h-12 w-12 text-primary"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                            ></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h1
                                            class="text-4xl font-bold text-gray-900 mb-2"
                                        >
                                            Edit Finance Estimate
                                        </h1>
                                        <p class="text-lg text-gray-600">
                                            {{ vehicleTitle }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex space-x-3">
                                    <Link
                                        href="/estimates/financing"
                                        class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-150"
                                    >
                                        Back to List
                                    </Link>
                                    <button
                                        @click="submitForm"
                                        :disabled="loading"
                                        class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        <svg
                                            v-if="loading"
                                            class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                                        <span>{{
                                            loading
                                                ? "Saving..."
                                                : "Save Changes"
                                        }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8"
                >
                    <!-- Main Form -->
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <section aria-labelledby="edit-finance-estimate-title">
                            <FinanceForm
                                :form="form"
                                :errors="errors"
                                is-edit
                                @submit="submitForm"
                            />
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
