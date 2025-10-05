<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, router, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import LeaseForm from '@/Components/LeaseForm.vue'
import PaymentAnalysis from '@/Components/Lease/PaymentAnalysis.vue'
import BuyoutAnalysis from '@/Components/Lease/BuyoutAnalysis.vue'
import AdvancedCalculations from '@/Components/Lease/AdvancedCalculations.vue'
import { LeaseFormData, FormErrors, VehicleType, User, Profile, VehicleLeaseSheet } from '@/types'
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
      notes: '',
    },
    props.sheet || {}
  )
)

const loading = ref(false)
const errors = ref<FormErrors>({})

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

const pageTitle = computed(() => {
  return isEdit.value ? 'Edit Lease Estimate' : 'Create Lease Estimate'
})

const formTitle = computed(() => {
  return isEdit.value ? 'Edit Lease Estimate' : 'Create Lease Estimate'
})

const breadcrumbs = computed(() => [
  {
    name: 'Vehicle Lease Calculator',
    href: '/estimates/leasing',
  },
  {
    name: isEdit.value ? 'Edit Estimate' : 'New Estimate',
    current: true,
  },
])

const vehicleTitle = computed(() => {
  const parts = [
    form.value.vehicle_year,
    form.value.vehicle_make,
    form.value.vehicle_model,
    form.value.vehicle_trim,
  ].filter((part) => part && part.trim())
  return parts.length > 0 ? parts.join(' ') : 'Lease Estimate'
})
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
              <p v-else class="mt-2 text-gray-600">Calculate vehicle leasing options</p>
            </div>
            <div class="flex items-center gap-2">
              <Link href="/estimates/leasing">
                <button
                  class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150"
                >
                  Back to List
                </button>
              </Link>
              <button
                @click="submitForm"
                :disabled="loading"
                class="bg-secondary hover:bg-secondary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 flex items-center space-x-2"
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
              />
            </section>

            <!-- Payment Analysis -->
            <PaymentAnalysis :data="form" />

            <!-- Buyout Analysis -->
            <BuyoutAnalysis :data="form" />
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
