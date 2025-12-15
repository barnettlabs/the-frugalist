<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime } from '@/utils/time'
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

        <!-- Price Info -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Price Information</h2>
            <button
              @click="refreshPrice"
              :disabled="refreshing"
              class="flex items-center gap-2 text-warning hover:text-warning-shade-1 font-medium disabled:opacity-50"
            >
              <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': refreshing }" />
              <span>{{ refreshing ? 'Refreshing...' : 'Refresh Price' }}</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <span class="text-gray-500 text-sm block mb-1">Current Price</span>
              <span class="text-3xl font-bold text-green-600">${{ formatCurrency(product.current_price) }}</span>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <span class="text-gray-500 text-sm block mb-1">Target Price</span>
              <span v-if="product.target_price" class="text-3xl font-bold text-gray-900">
                ${{ formatCurrency(product.target_price) }}
              </span>
              <span v-else class="text-xl text-gray-400">Not set</span>
            </div>
          </div>

          <div class="mt-4 text-sm text-gray-500">
            Last checked: {{ product.last_checked_at ? formatRelativeTime(product.last_checked_at) : 'Never' }}
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
