<script setup lang="ts">
import { Head, Link, useForm, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { ref, computed } from 'vue'
import {
  EyeIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  EllipsisVerticalIcon,
  PauseIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/20/solid'

interface TrackedProduct {
  id: number
  sku_upc: string
  product_name: string
  product_variant?: string
  product_image_url?: string
  retail_price: number
  current_price: number
  target_price: number
  tracking_start_date: string
  tracking_end_date?: string
  is_active: boolean
  last_checked_at?: string
  last_scraper_error?: string
  last_error_at?: string
  product_metadata?: {
    retailer_url?: string
    [key: string]: any
  }
  retailer: {
    id: number
    name: string
    slug: string
  }
  price_history: Array<{
    id: number
    price: number
    checked_at: string
  }>
  price_alerts: Array<{
    id: number
    alert_type: string
    old_price: number
    new_price: number
    triggered_at: string
  }>
  price_drop_percentage: number
}

interface Props {
  trackedProducts: TrackedProduct[]
  retailers: Array<{
    id: number
    name: string
    slug: string
    is_active: boolean
  }>
}

const props = defineProps<Props>()

const refreshForm = useForm({})

// Dropdown state - track which dropdown is open
const openDropdown = ref<number | null>(null)

// Toggle dropdown for a specific product
const toggleDropdown = (productId: number) => {
  openDropdown.value = openDropdown.value === productId ? null : productId
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  openDropdown.value = null
}

// Filter state
type FilterType = 'all' | 'active' | 'paused' | 'target_reached' | 'price_drops'
const activeFilter = ref<FilterType>('all')

// Filtered products based on active filter
const filteredProducts = computed(() => {
  switch (activeFilter.value) {
    case 'active':
      return props.trackedProducts.filter((p) => p.is_active)
    case 'paused':
      return props.trackedProducts.filter((p) => !p.is_active)
    case 'target_reached':
      return props.trackedProducts.filter((p) => p.current_price <= p.target_price)
    case 'price_drops':
      return props.trackedProducts.filter((p) => p.price_drop_percentage > 0)
    default:
      return props.trackedProducts
  }
})

// Filter buttons configuration
const filters = [
  { key: 'all' as FilterType, label: 'All', count: computed(() => props.trackedProducts.length) },
  {
    key: 'active' as FilterType,
    label: 'Active',
    count: computed(() => props.trackedProducts.filter((p) => p.is_active).length),
  },
  {
    key: 'paused' as FilterType,
    label: 'Paused',
    count: computed(() => props.trackedProducts.filter((p) => !p.is_active).length),
  },
  {
    key: 'target_reached' as FilterType,
    label: 'Target Reached',
    count: computed(
      () => props.trackedProducts.filter((p) => p.current_price <= p.target_price).length
    ),
  },
  {
    key: 'price_drops' as FilterType,
    label: 'Price Drops',
    count: computed(() => props.trackedProducts.filter((p) => p.price_drop_percentage > 0).length),
  },
]

const refreshPrice = (productId: number) => {
  closeDropdown()
  refreshForm.post(`/price-tracker/${productId}/refresh`, {
    preserveScroll: true,
  })
}

const deleteProduct = (productId: number) => {
  if (confirm('Are you sure you want to stop tracking this product?')) {
    closeDropdown()
    useForm({}).delete(`/price-tracker/${productId}`, {
      preserveScroll: true,
    })
  }
}

const togglePauseProduct = (product: TrackedProduct) => {
  closeDropdown()
  useForm({
    is_active: !product.is_active,
    target_price: product.target_price,
    tracking_end_date: product.tracking_end_date || '',
  }).patch(`/price-tracker/${product.id}`, {
    preserveScroll: true,
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusColor = (product: TrackedProduct) => {
  if (product.current_price <= product.target_price) {
    return 'text-success border border-success/20 bg-success/10 rounded-full'
  }
  if (product.price_drop_percentage > 0) {
    return 'text-warning border border-warning/20 bg-warning/10 rounded-full'
  }
  return 'text-gray-500 border border-gray-200 rounded-full'
}

const getStatusText = (product: TrackedProduct) => {
  if (product.current_price <= product.target_price) {
    return 'Target Reached'
  }
  if (product.price_drop_percentage > 0) {
    return `${product.price_drop_percentage.toFixed(1)}% Off`
  }
  return 'Tracking'
}
</script>

<template>
  <Head title="Smart Price Tracker" />

  <AuthenticatedLayout>
    <div class="py-12" @click="closeDropdown">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Smart Price Tracker</h1>
              <p class="mt-2 text-gray-600">
                Monitor prices and get alerted when they drop below your target threshold
              </p>
            </div>
            <Link
              :href="route('price-tracker.create')"
              class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2"
            >
              <PlusIcon class="h-5 w-5" />
              <span>Track New Product</span>
            </Link>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-primary/10">
                <EyeIcon class="h-6 w-6 text-primary" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Tracking</p>
                <p class="text-2xl font-bold text-gray-900">{{ trackedProducts.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-success/10">
                <CheckCircleIcon class="h-6 w-6 text-success" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Target Reached</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ trackedProducts.filter((p) => p.current_price <= p.target_price).length }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-warning/10">
                <ChartBarIcon class="h-6 w-6 text-warning" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Price Drops</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ trackedProducts.filter((p) => p.price_drop_percentage > 0).length }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-lg bg-info/10">
                <ExclamationTriangleIcon class="h-6 w-6 text-info" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Recent Alerts</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ trackedProducts.reduce((sum, p) => sum + p.price_alerts.length, 0) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Filters -->
        <div v-if="trackedProducts.length > 0" class="mb-6">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-sm font-medium text-gray-700">Filter by:</span>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="filter in filters"
                  :key="filter.key"
                  @click="activeFilter = filter.key"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  :class="
                    activeFilter === filter.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  "
                >
                  {{ filter.label }}
                  <span
                    class="ml-1.5 px-1.5 py-0.5 rounded text-xs"
                    :class="
                      activeFilter === filter.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    "
                  >
                    {{ filter.count.value }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div
          v-if="filteredProducts.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <!-- Product Header -->
            <div class="flex flex-col items-start justify-between mb-4">
              <div class="flex flex-row justify-between items-center space-x-2 mb-2 w-full">
                <span class="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {{ product.retailer.name }}
                </span>
                <div class="tech-status text-xs px-2 py-1 rounded" :class="getStatusColor(product)">
                  {{ getStatusText(product) }}
                </div>
              </div>

              <div class="flex-1 flex flex-row">
                <div>
                  <h3 class="font-bold text-gray-900 text-sm leading-tight mb-1">
                    {{ product.product_name }}
                  </h3>
                  <p v-if="product.product_variant" class="text-xs text-gray-500">
                    {{ product.product_variant }}
                  </p>
                </div>

                <img
                  v-if="product.product_image_url"
                  :src="product.product_image_url"
                  :alt="product.product_name"
                  class="w-16 h-16 object-cover rounded-lg ml-4"
                />
              </div>
            </div>

            <!-- Price Information -->
            <div class="space-y-3 mb-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Retail Price</span>
                <span class="text-sm text-gray-500 line-through">
                  {{ formatCurrency(product.retail_price) }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Current Price</span>
                <span class="text-lg font-bold text-gray-900">
                  {{ formatCurrency(product.current_price) }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Target Price</span>
                <span class="text-sm font-medium text-primary">
                  {{ formatCurrency(product.target_price) }}
                </span>
              </div>

              <!-- Best Buy TotalTech Note -->
              <div v-if="product.retailer.slug === 'bestbuy'" class="pt-2">
                <p class="text-xs text-gray-500 italic">
                  * TotalTech member prices cannot be shown
                </p>
              </div>

              <div
                v-if="product.price_drop_percentage > 0"
                class="flex justify-between items-center"
              >
                <span class="text-sm text-gray-600">Savings</span>
                <span class="text-sm font-medium text-success">
                  {{ formatCurrency(product.retail_price - product.current_price) }}
                  ({{ product.price_drop_percentage.toFixed(1) }}%)
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress to Target</span>
                <span>
                  {{
                    Math.max(
                      0,
                      Math.min(
                        100,
                        ((product.retail_price - product.current_price) /
                          (product.retail_price - product.target_price)) *
                          100
                      )
                    ).toFixed(0)
                  }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-primary rounded-full h-2 transition-all duration-300"
                  :style="{
                    width:
                      Math.max(
                        0,
                        Math.min(
                          100,
                          ((product.retail_price - product.current_price) /
                            (product.retail_price - product.target_price)) *
                            100
                        )
                      ) + '%',
                  }"
                ></div>
              </div>
            </div>

            <!-- Tracking Info -->
            <div class="text-xs text-gray-500 mb-4">
              <p>Tracking since {{ formatDate(product.tracking_start_date) }}</p>
              <p v-if="product.last_checked_at">
                Last checked {{ formatDate(product.last_checked_at) }}
              </p>
            </div>

            <!-- Scraper Error Alert -->
            <div
              v-if="product.last_scraper_error"
              class="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg"
            >
              <div class="flex items-start gap-2">
                <ExclamationTriangleIcon class="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-danger">Scraper Error</p>
                  <p class="text-xs text-danger/80 mt-1">{{ product.last_scraper_error }}</p>
                  <p v-if="product.last_error_at" class="text-xs text-danger/60 mt-1">
                    {{ formatDate(product.last_error_at) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-between items-center gap-2">
              <div class="flex gap-2">
                <Link
                  :href="route('price-tracker.show', product.id)"
                  class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <EyeIcon class="h-4 w-4" />
                  <span>Details</span>
                </Link>

                <a
                  v-if="product.product_metadata?.retailer_url"
                  :href="product.product_metadata.retailer_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  title="View on retailer website"
                >
                  <ArrowTopRightOnSquareIcon class="h-4 w-4" />
                </a>
              </div>

              <!-- Actions Dropdown -->
              <div class="relative ml-auto">
                <button
                  @click.stop="toggleDropdown(product.id)"
                  class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <EllipsisVerticalIcon class="h-4 w-4" />
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="openDropdown === product.id"
                  @click.stop
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                >
                  <div class="py-1">
                    <button
                      @click="refreshPrice(product.id)"
                      :disabled="refreshForm.processing"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      <ArrowPathIcon
                        class="h-4 w-4"
                        :class="{ 'animate-spin': refreshForm.processing }"
                      />
                      <span>Refresh Price</span>
                    </button>

                    <button
                      @click="togglePauseProduct(product)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <component :is="product.is_active ? PauseIcon : PlayIcon" class="h-4 w-4" />
                      <span>{{ product.is_active ? 'Pause' : 'Resume' }} Tracking</span>
                    </button>

                    <hr class="my-1 border-gray-200" />

                    <button
                      @click="deleteProduct(product.id)"
                      class="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 flex items-center gap-2"
                    >
                      <TrashIcon class="h-4 w-4" />
                      <span>Stop Tracking</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State - No products matching filter -->
        <div v-else-if="trackedProducts.length > 0" class="text-center py-12">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-12 max-w-md mx-auto">
            <ExclamationTriangleIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products match this filter</h3>
            <p class="text-gray-600 mb-6">
              Try selecting a different filter to see your tracked products.
            </p>
            <button
              @click="activeFilter = 'all'"
              class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 inline-flex items-center space-x-2"
            >
              <span>Show All Products</span>
            </button>
          </div>
        </div>

        <!-- Empty State - No products at all -->
        <div v-else class="text-center py-12">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-12 max-w-md mx-auto">
            <EyeIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products being tracked</h3>
            <p class="text-gray-600 mb-6">
              Start tracking products to get notified when prices drop below your target threshold.
            </p>
            <Link
              :href="route('price-tracker.create')"
              class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 inline-flex items-center space-x-2"
            >
              <PlusIcon class="h-5 w-5" />
              <span>Track Your First Product</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
