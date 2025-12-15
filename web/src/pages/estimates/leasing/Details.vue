<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import LeaseForm from '@/components/LeaseForm.vue'
import PaymentAnalysis from '@/components/Lease/PaymentAnalysis.vue'
import BuyoutAnalysis from '@/components/Lease/BuyoutAnalysis.vue'
import AdvancedCalculations from '@/components/Lease/AdvancedCalculations.vue'
import { VehicleType } from '@/types'
import type { LeaseFormData, FormErrors } from '@/types'
import { leaseApi } from '@/api/lease'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const sheetId = computed(() => route.params.id as string)

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
  capitalized_cost: '',
  residual_percent: '',
  money_factor: '',
  lease_term: '',
  down_payment: '',
  acquisition_fee: '',
  disposition_fee: '',
  sales_tax_percent: '',
  annual_mileage: '',
  excess_mileage_rate: '',
  start_date: '',
  contact_email: '',
  contact_phone: '',
  notes: '',
})

const loading = ref(false)
const loadingSheet = ref(false)
const errors = ref<FormErrors>({})

const vehicleTitle = computed(() => {
  const parts = [
    form.value.vehicle_year,
    form.value.vehicle_make,
    form.value.vehicle_model,
    form.value.vehicle_trim,
  ].filter((part) => part && String(part).trim())
  return parts.length > 0 ? parts.join(' ') : 'Lease Estimate'
})

const pageTitle = computed(() => {
  return isEdit.value ? `Edit ${vehicleTitle.value}` : 'Create Lease Estimate'
})

const formTitle = computed(() => {
  return isEdit.value ? 'Edit Lease Estimate' : 'Create Lease Estimate'
})

const loadSheet = async () => {
  if (!isEdit.value) return

  loadingSheet.value = true
  try {
    const sheet = await leaseApi.get(sheetId.value)
    Object.assign(form.value, sheet)
  } catch (error) {
    console.error('Error loading sheet:', error)
    router.push('/estimates/leasing')
  } finally {
    loadingSheet.value = false
  }
}

const submitForm = async () => {
  loading.value = true
  errors.value = {}

  try {
    if (isEdit.value) {
      await leaseApi.update(sheetId.value, form.value)
    } else {
      await leaseApi.create(form.value)
    }
    router.push('/estimates/leasing')
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

onMounted(() => {
  loadSheet()
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <!-- Loading State -->
      <div v-if="loadingSheet" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ formTitle }}</h1>
              <p v-if="isEdit" class="mt-2 text-gray-600">{{ vehicleTitle }}</p>
              <p v-else class="mt-2 text-gray-600">Calculate vehicle leasing options</p>
            </div>
            <div class="flex items-center gap-2">
              <RouterLink to="/estimates/leasing">
                <button class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150">
                  Back to List
                </button>
              </RouterLink>
              <button
                @click="submitForm"
                :disabled="loading"
                class="bg-secondary hover:bg-secondary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <section>
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

            <PaymentAnalysis :data="form" />
            <BuyoutAnalysis :data="form" />
          </div>

          <!-- Right Sidebar -->
          <div>
            <AdvancedCalculations :data="form" />
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
