<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import Card from '@/components/Card.vue'
import Badge from '@/components/Badge.vue'
import Spinner from '@/components/Spinner.vue'
import { TagIcon, PlusIcon, TrashIcon, EyeIcon, ArrowPathIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime } from '@/utils/time'
import { priceTrackerApi, RETAILERS, type TrackedProduct } from '@/api/price-tracker'

const products = ref<TrackedProduct[]>([])
const loading = ref(true)
const refreshingId = ref<number | null>(null)

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
  refreshingId.value = id
  try {
    await priceTrackerApi.refresh(id)
    await fetchProducts()
  } catch (error) {
    console.error('Error refreshing product:', error)
  } finally {
    refreshingId.value = null
  }
}

const getRetailerName = (product: TrackedProduct): string => {
  if (product.retailer?.name) return product.retailer.name
  const retailer = RETAILERS.find(r => r.id === product.retailer_id)
  return retailer?.name || 'Unknown'
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <!-- Header -->
      <PageHeader
        title="Smart Price Tracker"
        description="Track product prices and get notified when they drop"
        back-link="/dashboard"
        back-label="Dashboard"
      >
        <template #actions>
          <RouterLink to="/price-tracker/create">
            <button class="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2">
              <PlusIcon class="h-5 w-5" />
              <span>Track New Product</span>
            </button>
          </RouterLink>
        </template>
      </PageHeader>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Spinner size="lg" color="accent" />
      </div>

      <!-- Empty State -->
      <Card v-else-if="!products.length" class="text-center" padding="lg">
        <div class="p-4 rounded-xl bg-accent/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TagIcon class="h-8 w-8 text-accent-dark" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">No products being tracked</h3>
        <p class="text-gray-600 mb-6">Start tracking products to get price drop alerts</p>
        <RouterLink to="/price-tracker/create">
          <button class="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 mx-auto">
            <PlusIcon class="h-5 w-5" />
            <span>Track First Product</span>
          </button>
        </RouterLink>
      </Card>

      <!-- Products List -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="product in products"
          :key="product.id"
          variant="interactive"
          padding="none"
          class="overflow-hidden"
        >
          <!-- Product Header -->
          <div class="p-4 border-b border-gray-100">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 truncate">
                  {{ product.product_name || 'Pending lookup...' }}
                </h3>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ getRetailerName(product) }} &middot; {{ product.sku_upc }}
                </p>
              </div>
              <Badge v-if="product.is_active" variant="success" size="sm">Active</Badge>
              <Badge v-else variant="neutral" size="sm">Paused</Badge>
            </div>

            <!-- Notification Methods -->
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs text-gray-400">Alerts:</span>
              <div class="flex items-center gap-1">
                <EnvelopeIcon
                  v-if="product.notification_method?.includes('email')"
                  class="h-4 w-4 text-primary"
                  title="Email notifications"
                />
                <DevicePhoneMobileIcon
                  v-if="product.notification_method?.includes('push')"
                  class="h-4 w-4 text-primary"
                  title="Push notifications"
                />
              </div>
            </div>
          </div>

          <!-- Price Info -->
          <div class="bg-gray-50 p-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-500 text-sm">Current Price</span>
              <span class="font-bold text-xl text-success">
                {{ product.current_price ? `$${formatCurrency(product.current_price)}` : '—' }}
              </span>
            </div>
            <div v-if="product.target_price" class="flex items-center justify-between mt-2">
              <span class="text-gray-500 text-sm">Target Price</span>
              <span class="font-medium text-gray-900">${{ formatCurrency(product.target_price) }}</span>
            </div>
            <div v-if="product.last_checked_at" class="text-xs text-gray-400 mt-2 text-right">
              Last checked {{ formatRelativeTime(product.last_checked_at) }}
            </div>
            <div v-else class="text-xs text-gray-400 mt-2 text-right">
              Not yet checked
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-3 gap-px bg-gray-100">
            <RouterLink :to="`/price-tracker/${product.id}`" class="block">
              <button class="w-full bg-white hover:bg-gray-50 text-gray-700 px-2 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
                <EyeIcon class="h-4 w-4" />
                <span>Details</span>
              </button>
            </RouterLink>
            <button
              @click="refreshProduct(product.id)"
              :disabled="refreshingId === product.id"
              class="w-full bg-white hover:bg-gray-50 text-gray-700 px-2 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon :class="['h-4 w-4', refreshingId === product.id && 'animate-spin']" />
              <span>{{ refreshingId === product.id ? 'Checking...' : 'Refresh' }}</span>
            </button>
            <button
              @click="deleteProduct(product.id)"
              class="w-full bg-white hover:bg-red-50 text-red-600 px-2 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <TrashIcon class="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </Card>

        <!-- Add New Card -->
        <RouterLink to="/price-tracker/create">
          <Card variant="interactive" class="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-accent/30 hover:border-accent bg-transparent" padding="lg">
            <div class="p-3 rounded-xl bg-accent/10 w-fit mx-auto mb-4">
              <PlusIcon class="h-8 w-8 text-accent-dark" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Track New Product</h3>
            <p class="text-gray-600 text-sm">Add a product to monitor its price</p>
          </Card>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
