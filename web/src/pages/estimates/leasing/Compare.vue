<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { leaseApi } from '@/api/lease'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()

const sheets = ref<any[]>([])
const loading = ref(true)

const loadSheets = async () => {
  const sheetIds = (route.query.sheets as string)?.split(',') || []
  if (sheetIds.length < 2) return

  try {
    const loadedSheets = await Promise.all(
      sheetIds.map((id) => leaseApi.get(id))
    )
    sheets.value = loadedSheets
  } catch (error) {
    console.error('Error loading sheets:', error)
  } finally {
    loading.value = false
  }
}

const getVehicleTitle = (sheet: any) => {
  const parts = [sheet.vehicle_year, sheet.vehicle_make, sheet.vehicle_model, sheet.vehicle_trim].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Vehicle'
}

onMounted(() => {
  loadSheets()
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <!-- Header -->
      <PageHeader
        title="Compare Lease Estimates"
        description="Side-by-side comparison of your leasing options"
        back-link="/estimates/leasing"
        back-label="Lease Calculator"
      />

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>

      <!-- Comparison Table -->
      <div v-else class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metric</th>
                <th
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-left text-sm font-semibold text-gray-900"
                >
                  {{ getVehicleTitle(sheet) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-4 text-sm text-gray-600">Monthly Payment</td>
                <td
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-sm font-bold text-green-600"
                >
                  ${{ formatCurrency(sheet.monthly_payment || 0) }}
                </td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-600">MSRP</td>
                <td
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-sm font-medium text-gray-900"
                >
                  ${{ formatCurrency(sheet.msrp || 0) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-gray-600">Capitalized Cost</td>
                <td
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-sm font-medium text-gray-900"
                >
                  ${{ formatCurrency(sheet.capitalized_cost || 0) }}
                </td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-600">Money Factor</td>
                <td
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-sm font-medium text-gray-900"
                >
                  {{ sheet.money_factor || 0 }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-gray-600">Residual %</td>
                <td
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-sm font-medium text-gray-900"
                >
                  {{ sheet.residual_percent || 0 }}%
                </td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-600">Term</td>
                <td
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-sm font-medium text-gray-900"
                >
                  {{ sheet.lease_term || 0 }} months
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-gray-600">Down Payment</td>
                <td
                  v-for="sheet in sheets"
                  :key="sheet.id"
                  class="px-6 py-4 text-sm font-medium text-gray-900"
                >
                  ${{ formatCurrency(sheet.down_payment || 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>
