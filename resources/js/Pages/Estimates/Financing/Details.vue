<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, router, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import FinanceForm from '@/Components/FinanceForm.vue'
import AmortizationTable from '@/Components/Finance/AmortizationTable.vue'
import PaymentCharts from '@/Components/Finance/PaymentCharts.vue'
import ExtraPayments from '@/Components/Finance/ExtraPayments.vue'
import AdvancedCalculations from '@/Components/Finance/AdvancedCalculations.vue'
import {
  FinanceFormData,
  FormErrors,
  VehicleType,
  User,
  Profile,
  VehicleFinanceSheet,
} from '@/types'
import axios from 'axios'

interface Props {
  user: User
  profile: Profile
  sheet?: VehicleFinanceSheet
}

const props = defineProps<Props>()

const isEdit = computed(() => !!props.sheet)

const form = ref<FinanceFormData>(
  Object.assign(
    {},
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
      notes: '',
    },
    props.sheet
  )
)

const loading = ref(false)
const errors = ref<FormErrors>({})

const vehicleTitle = computed(() => {
  const parts = [
    form.value.vehicle_year,
    form.value.vehicle_make,
    form.value.vehicle_model,
    form.value.vehicle_trim,
  ].filter((part) => part && part.trim())
  return parts.length > 0 ? parts.join(' ') : 'Finance Estimate'
})

const pageTitle = computed(() => {
  return isEdit.value ? `Edit ${vehicleTitle.value}` : 'Create Finance Estimate'
})

const formTitle = computed(() => {
  return isEdit.value ? 'Edit Finance Estimate' : 'Create Finance Estimate'
})

const breadcrumbs = computed(() => [
  {
    name: 'Vehicle Finance Calculator',
    href: '/estimates/financing',
  },
  {
    name: isEdit.value ? 'Edit Estimate' : 'New Estimate',
    current: true,
  },
])

const submitForm = async () => {
  loading.value = true
  errors.value = {}

  try {
    if (isEdit.value) {
      await axios.put(`/api/vehicle-finance-sheets/${props.sheet.id}`, form.value)
    } else {
      await axios.post('/api/vehicle-finance-sheets', form.value)
    }
    router.visit('/estimates/financing')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      console.error(`Error ${isEdit.value ? 'updating' : 'creating'} finance sheet:`, error)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Head :title="pageTitle" />

  <AuthenticatedLayout :user="props.user" :profile="props.profile" :breadcrumbs="breadcrumbs">
    <main class="-mt-24 pb-8 flex-1">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <!-- Compact Header -->
        <div class="mb-6 lg:mb-12">
          <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    class="h-6 w-6 text-primary"
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
                <div class="flex-1 min-w-0">
                  <h1 class="text-xl font-bold text-gray-900">{{ formTitle }}</h1>
                  <p v-if="isEdit" class="text-xs text-gray-600 mt-0.5">{{ vehicleTitle }}</p>
                  <p v-else class="text-xs text-gray-600 mt-0.5">Calculate vehicle financing options</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <Link href="/estimates/financing">
                  <button
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Back
                  </button>
                </Link>
                <button
                  @click="submitForm"
                  :disabled="loading"
                  class="bg-primary hover:bg-primary-shade-1 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <svg
                    v-if="loading"
                    class="animate-spin h-4 w-4 text-white"
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
                  <span v-if="isEdit">{{ loading ? 'Saving...' : 'Save' }}</span>
                  <span v-else>{{ loading ? 'Creating...' : 'Create' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          <!-- Main Form -->
          <div class="grid grid-cols-1 gap-4 lg:col-span-2">
            <section :aria-labelledby="`${isEdit ? 'edit' : 'create'}-finance-estimate-title`">
              <FinanceForm
                :form="form"
                :errors="errors"
                :loading="loading"
                :title="formTitle"
                back-url="/estimates/financing"
                :is-edit="isEdit"
                @submit="submitForm"
              />
            </section>

            <ExtraPayments v-model="form.extra_payments_json" :data="form" />
            <AmortizationTable :data="form" />
            <PaymentCharts :data="form" />
          </div>

          <!-- Right Sidebar -->
          <div>
            <AdvancedCalculations :data="form" />
          </div>
        </div>
      </div>
    </main>
  </AuthenticatedLayout>
</template>
