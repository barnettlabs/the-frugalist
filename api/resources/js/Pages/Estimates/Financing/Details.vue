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
    <main class="py-12 flex-1">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ formTitle }}</h1>
              <p v-if="isEdit" class="mt-2 text-gray-600">{{ vehicleTitle }}</p>
              <p v-else class="mt-2 text-gray-600">Calculate vehicle financing options</p>
            </div>
            <div class="flex items-center gap-2">
              <Link href="/estimates/financing">
                <button
                  class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150"
                >
                  Back to List
                </button>
              </Link>
              <button
                @click="submitForm"
                :disabled="loading"
                class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg
                  v-if="loading"
                  class="animate-spin h-5 w-5 text-white"
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
                <span v-if="isEdit">{{ loading ? 'Saving...' : 'Save Changes' }}</span>
                <span v-else>{{ loading ? 'Creating...' : 'Create Estimate' }}</span>
              </button>
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
