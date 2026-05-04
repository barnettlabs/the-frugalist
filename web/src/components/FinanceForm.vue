<script setup lang="ts">
import { RouterLink } from 'vue-router'
import FormField from './FormField.vue'
import Spinner from './Spinner.vue'
import { CalculatorIcon } from '@heroicons/vue/24/outline'
import { FinanceFormData, FormErrors, vehicleTypeOptions } from '@/types'

interface Props {
  form: FinanceFormData
  errors: FormErrors
  loading: boolean
  title: string
  backUrl: string
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
})

defineEmits<{
  submit: []
}>()
</script>

<template>
  <form @submit.prevent="$emit('submit')" class="space-y-4">
    <!-- 01 · Basic Information -->
    <section class="card overflow-hidden">
      <div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
        <span class="numeral text-xs text-text-muted">№ 01</span>
        <h3 class="font-display text-xl text-primary tracking-tight">Basic information</h3>
      </div>
      <div class="p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            v-model="form.sheet_name"
            name="sheet_name"
            label="Estimate name"
            :error="errors.sheet_name"
          />
          <FormField
            v-model="form.dealership_name"
            name="dealership_name"
            label="Dealership"
            :error="errors.dealership_name"
          />
          <FormField
            v-model="form.vehicle_type"
            name="vehicle_type"
            label="Vehicle type"
            type="select"
            :options="vehicleTypeOptions"
            :error="errors.vehicle_type"
          />
        </div>
      </div>
    </section>

    <!-- 02 · Contact Information -->
    <section class="card overflow-hidden">
      <div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
        <span class="numeral text-xs text-text-muted">№ 02</span>
        <h3 class="font-display text-xl text-primary tracking-tight">Contact information</h3>
      </div>
      <div class="p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            v-model="form.sales_consultant"
            name="sales_consultant"
            label="Sales consultant"
            :error="errors.sales_consultant"
          />
          <FormField
            v-model="form.contact_email"
            name="contact_email"
            label="Contact email"
            type="email"
            :error="errors.contact_email"
          />
          <FormField
            v-model="form.contact_phone"
            name="contact_phone"
            label="Contact phone"
            type="tel"
            :error="errors.contact_phone"
          />
        </div>
      </div>
    </section>

    <!-- 03 · Vehicle Information -->
    <section class="card overflow-hidden">
      <div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
        <span class="numeral text-xs text-text-muted">№ 03</span>
        <h3 class="font-display text-xl text-primary tracking-tight">Vehicle information</h3>
      </div>
      <div class="p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            v-model="form.vehicle_year"
            name="vehicle_year"
            label="Year"
            type="number"
            :min="1900"
            :max="2030"
            :error="errors.vehicle_year"
          />
          <FormField
            v-model="form.vehicle_make"
            name="vehicle_make"
            label="Make"
            :error="errors.vehicle_make"
          />
          <FormField
            v-model="form.vehicle_model"
            name="vehicle_model"
            label="Model"
            :error="errors.vehicle_model"
          />
          <FormField
            v-model="form.vehicle_trim"
            name="vehicle_trim"
            label="Trim"
            :error="errors.vehicle_trim"
          />
        </div>
      </div>
    </section>

    <!-- 04 · Pricing -->
    <section class="card overflow-hidden">
      <div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
        <span class="numeral text-xs text-text-muted">№ 04</span>
        <h3 class="font-display text-xl text-primary tracking-tight">Pricing</h3>
      </div>
      <div class="p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            v-model="form.msrp"
            name="msrp"
            label="MSRP"
            type="currency"
            :error="errors.msrp"
          />
          <FormField
            v-model="form.fees"
            name="fees"
            label="Fees"
            type="currency"
            :error="errors.fees"
          />
          <FormField
            v-model="form.discounts"
            name="discounts"
            label="Discounts"
            type="currency"
            :error="errors.discounts"
          />
          <FormField
            v-model="form.rebates"
            name="rebates"
            label="Rebates"
            type="currency"
            :error="errors.rebates"
          />
          <FormField
            v-model="form.down_payment"
            name="down_payment"
            label="Down payment"
            type="currency"
            :error="errors.down_payment"
          />
          <FormField
            v-model="form.sales_tax_percent"
            name="sales_tax_percent"
            label="Sales tax percent"
            type="percentage"
            :error="errors.sales_tax_percent"
          />
        </div>
      </div>
    </section>

    <!-- 05 · Finance Terms -->
    <section class="card overflow-hidden">
      <div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
        <span class="numeral text-xs text-text-muted">№ 05</span>
        <h3 class="font-display text-xl text-primary tracking-tight">Finance terms</h3>
      </div>
      <div class="p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            v-model="form.interest_rate"
            name="interest_rate"
            label="Interest rate"
            type="percentage"
            :error="errors.interest_rate"
          />
          <FormField
            v-model="form.finance_term"
            name="finance_term"
            label="Finance term (months)"
            type="number"
            :min="1"
            :max="120"
            :error="errors.finance_term"
          />
          <FormField
            name="start_date"
            label="Start date"
            type="date"
            :error="errors.start_date"
            :model-value="form.start_date ? form.start_date.substring(0, 10) : ''"
            @input="
              (event: any) => {
                form.start_date = event.target.value
              }
            "
          />
        </div>
      </div>
    </section>

    <!-- 06 · Notes -->
    <section class="card overflow-hidden">
      <div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
        <span class="numeral text-xs text-text-muted">№ 06</span>
        <h3 class="font-display text-xl text-primary tracking-tight">Notes</h3>
      </div>
      <div class="p-5 sm:p-6">
        <FormField
          v-model="form.notes"
          name="notes"
          label="Notes"
          type="textarea"
          :error="errors.notes"
        />
      </div>
    </section>

    <!-- Submit (only on Create — Edit page has its own submit in the header) -->
    <div v-if="!isEdit" class="flex items-center justify-end gap-3 pt-2">
      <RouterLink
        :to="backUrl"
        class="px-5 py-2.5 rounded-md text-sm font-medium text-text-muted hover:text-primary hover:bg-tan/50 transition-colors"
      >
        Cancel
      </RouterLink>
      <button
        type="submit"
        :disabled="loading"
        :class="[
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors',
          loading
            ? 'bg-tan text-text-muted cursor-not-allowed'
            : 'bg-primary hover:bg-primary-light text-surface',
        ]"
      >
        <Spinner v-if="loading" size="sm" color="white" />
        <CalculatorIcon v-else class="h-4 w-4" />
        {{ loading ? 'Creating…' : 'Create finance estimate' }}
      </button>
    </div>
  </form>
</template>
