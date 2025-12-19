<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime, formatDateTime } from '@/utils/time'
import { priceTrackerApi, type TrackedProduct } from '@/api/price-tracker'

const route = useRoute()
const router = useRouter()

const product = ref<TrackedProduct | null>(null)
const loading = ref(true)
const refreshing = ref(false)

const loadProduct = async () => {
  try {
    const data = await priceTrackerApi.get(route.params.id as string)
    product.value = data
  } catch (error) {
    console.error('Error loading product:', error)
    router.push('/price-tracker')
  } finally {
    loading.value = false
  }
}

const refreshPrice = async () => {
  if (!product.value) return

  refreshing.value = true
  try {
    const updated = await priceTrackerApi.refresh(product.value.id)
    product.value = updated
  } catch (error) {
    console.error('Error refreshing price:', error)
  } finally {
    refreshing.value = false
  }
}

const deleteProduct = async () => {
  if (!product.value) return
  if (confirm('Are you sure you want to stop tracking this product?')) {
    try {
      await priceTrackerApi.delete(product.value.id)
      router.push('/price-tracker')
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }
}

const progressPercent = computed(() => {
  if (!product.value || !product.value.target_price) return 0
  const retail = product.value.retail_price
  const target = product.value.target_price
  const current = product.value.current_price

  if (retail <= target) return 100
  const progress = ((retail - current) / (retail - target)) * 100
  return Math.min(100, Math.max(0, progress))
})

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-warning"></div>
      </div>

      <template v-else-if="product">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ product.product_name }}</h1>
              <p class="mt-2 text-gray-600">{{ product.retailer?.name || 'Unknown Retailer' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <RouterLink to="/price-tracker">
                <button class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                  Back to List
                </button>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Price Timeline -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-900">Price Progress</h2>
            <button
              @click="refreshPrice"
              :disabled="refreshing"
              class="flex items-center gap-2 text-warning hover:text-warning-shade-1 font-medium disabled:opacity-50"
            >
              <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': refreshing }" />
              <span>{{ refreshing ? 'Refreshing...' : 'Refresh Price' }}</span>
            </button>
          </div>

          <!-- Timeline Bar -->
          <div class="relative mb-6">
            <!-- Labels above bar -->
            <div class="flex justify-between mb-2">
              <div class="text-left">
                <span class="text-xs text-gray-500 block">Retail</span>
                <span class="text-lg font-semibold text-gray-600">${{ formatCurrency(product.retail_price) }}</span>
              </div>
              <div class="text-center" v-if="product.target_price">
                <span class="text-xs text-gray-500 block">Target</span>
                <span class="text-lg font-semibold text-green-600">${{ formatCurrency(product.target_price) }}</span>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="absolute left-0 top-0 h-full bg-gradient-to-r from-warning to-green-500 rounded-full transition-all duration-500"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>

            <!-- Current price indicator -->
            <div
              class="absolute -bottom-8 transition-all duration-500"
              :style="{ left: `calc(${progressPercent}% - 40px)` }"
            >
              <div class="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap">
                ${{ formatCurrency(product.current_price) }}
              </div>
            </div>
          </div>

          <div class="mt-12 flex items-center justify-between text-sm text-gray-500">
            <span>Last checked: {{ product.last_checked_at ? formatRelativeTime(product.last_checked_at) : 'Never' }}</span>
            <span v-if="product.target_price" class="font-medium" :class="progressPercent >= 100 ? 'text-green-600' : 'text-gray-600'">
              {{ progressPercent >= 100 ? 'Target reached!' : `${progressPercent.toFixed(0)}% to target` }}
            </span>
          </div>
        </div>

        <!-- Price History -->
        <div v-if="product.price_history && product.price_history.length > 0" class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Price History</h2>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div
              v-for="entry in product.price_history"
              :key="entry.id"
              class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg font-semibold" :class="entry.price <= (product.target_price || 0) ? 'text-green-600' : 'text-gray-900'">
                  ${{ formatCurrency(entry.price) }}
                </span>
                <span
                  v-if="!entry.in_stock"
                  class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded"
                >
                  Out of stock
                </span>
              </div>
              <span class="text-sm text-gray-500">{{ formatDateTime(entry.checked_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Product URL -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Product Link</h2>
          <a
            :href="product.product_url"
            target="_blank"
            class="text-primary hover:text-primary-shade-1 break-all"
          >
            {{ product.product_url }}
          </a>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-lg border border-red-200 shadow-sm p-6">
          <h2 class="text-lg font-bold text-red-600 mb-4">Stop Tracking</h2>
          <p class="text-sm text-gray-600 mb-4">
            Remove this product from your tracking list.
          </p>
          <button
            @click="deleteProduct"
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Stop Tracking
          </button>
        </div>
      </template>
    </div>
  </main>
</template>
