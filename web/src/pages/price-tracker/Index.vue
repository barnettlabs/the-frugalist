<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { TagIcon, PlusIcon, TrashIcon, EyeIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime } from '@/utils/time'
import { priceTrackerApi, type TrackedProduct } from '@/api/price-tracker'

const products = ref<TrackedProduct[]>([])
const loading = ref(true)

const fetchProducts = async () => {
  try {
    const data = await priceTrackerApi.getAll()
    products.value = data
  } catch (error) {
    console.error('Error fetching tracked products:', error)
  } finally {
    loading.value = false
  }
}

const deleteProduct = async (id: number) => {
  if (confirm('Are you sure you want to stop tracking this product?')) {
    try {
      await priceTrackerApi.delete(id)
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }
}

const refreshProduct = async (id: number) => {
  try {
    await priceTrackerApi.refresh(id)
    await fetchProducts()
  } catch (error) {
    console.error('Error refreshing product:', error)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Smart Price Tracker</h1>
            <p class="mt-2 text-gray-600">
              Track product prices and get notified when they drop
            </p>
          </div>
          <RouterLink to="/price-tracker/create">
            <button class="bg-warning hover:bg-warning-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2">
              <PlusIcon class="h-5 w-5" />
              <span>Track New Product</span>
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-warning"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!products.length" class="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
        <div class="p-4 rounded-xl bg-warning/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TagIcon class="h-8 w-8 text-warning" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">No products being tracked</h3>
        <p class="text-gray-600 mb-6">Start tracking products to get price drop alerts</p>
        <RouterLink to="/price-tracker/create">
          <button class="bg-warning hover:bg-warning-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 mx-auto">
            <PlusIcon class="h-5 w-5" />
            <span>Track First Product</span>
          </button>
        </RouterLink>
      </div>

      <!-- Products List -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 truncate">{{ product.product_name }}</h3>
              <p class="text-xs text-gray-500">{{ product.retailer?.name || 'Unknown' }}</p>
            </div>
            <span v-if="product.last_checked_at" class="text-xs text-gray-400">
              {{ formatRelativeTime(product.last_checked_at) }}
            </span>
          </div>

          <div class="bg-gray-50 rounded-lg p-3 mb-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-500 text-xs">Current Price</span>
              <span class="font-bold text-green-600 text-lg">${{ formatCurrency(product.current_price) }}</span>
            </div>
            <div v-if="product.target_price" class="flex items-center justify-between mt-1">
              <span class="text-gray-500 text-xs">Target Price</span>
              <span class="font-medium text-gray-900">${{ formatCurrency(product.target_price) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <RouterLink :to="`/price-tracker/${product.id}`">
              <button class="w-full bg-warning hover:bg-warning-shade-1 text-white px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1">
                <EyeIcon class="h-3.5 w-3.5" />
                <span>View</span>
              </button>
            </RouterLink>
            <button
              @click="refreshProduct(product.id)"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1"
            >
              <ArrowPathIcon class="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            <button
              @click="deleteProduct(product.id)"
              class="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1"
            >
              <TrashIcon class="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Add new -->
        <RouterLink to="/price-tracker/create">
          <div class="bg-white rounded-lg p-8 text-center border-2 border-dashed border-warning/20 hover:border-warning/40 transition-colors cursor-pointer group h-full flex flex-col items-center justify-center">
            <div class="p-3 rounded-xl bg-warning/10 w-fit mx-auto mb-4 group-hover:bg-warning/20 transition-colors">
              <PlusIcon class="h-8 w-8 text-warning" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-warning transition-colors">
              Track New Product
            </h3>
            <p class="text-gray-600 text-sm">Add a product to monitor its price</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
