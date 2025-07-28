<script setup lang="ts">
import { Head, useForm, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { ref } from 'vue'
import {
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  BellIcon,
  ExternalLinkIcon
} from '@heroicons/vue/24/outline'

interface TrackedProduct {
  id: number
  sku_upc: string
  product_name: string
  product_variant?: string
  product_description?: string
  product_image_url?: string
  original_price: number
  current_price: number
  target_price: number
  tracking_start_date: string
  tracking_end_date?: string
  is_active: boolean
  last_checked_at?: string
  retailer: {
    id: number
    name: string
    slug: string
  }
  price_history: Array<{
    id: number
    price: number
    in_stock: boolean
    checked_at: string
  }>
  price_alerts: Array<{
    id: number
    alert_type: string
    old_price: number
    new_price: number
    triggered_at: string
    notification_sent: boolean
  }>
  price_drop_percentage: number
}

interface Props {
  trackedProduct: TrackedProduct
}

const props = defineProps<Props>()

const isEditing = ref(false)
const refreshForm = useForm({})

const editForm = useForm({
  target_price: props.trackedProduct.target_price,
  tracking_end_date: props.trackedProduct.tracking_end_date || '',
  is_active: props.trackedProduct.is_active,
})

const refreshPrice = () => {
  refreshForm.post(`/price-tracker/${props.trackedProduct.id}/refresh`, {
    preserveScroll: true,
  })
}

const updateProduct = () => {
  editForm.patch(`/price-tracker/${props.trackedProduct.id}`, {
    preserveScroll: true,
    onSuccess: () => {
      isEditing.value = false
    }
  })
}

const deleteProduct = () => {
  if (confirm('Are you sure you want to stop tracking this product?')) {
    router.delete(`/price-tracker/${props.trackedProduct.id}`)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getAlertTypeColor = (type: string) => {
  switch (type) {
    case 'target_reached':
      return 'bg-success/10 text-success border-success/20'
    case 'price_drop':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'back_in_stock':
      return 'bg-info/10 text-info border-info/20'
    default:
      return 'bg-gray/10 text-gray-600 border-gray/20'
  }
}

const getAlertTypeText = (type: string) => {
  switch (type) {
    case 'target_reached':
      return 'Target Reached'
    case 'price_drop':
      return 'Price Drop'
    case 'back_in_stock':
      return 'Back in Stock'
    default:
      return type
  }
}

// Prepare chart data for price history
const chartData = props.trackedProduct.price_history.slice().reverse().slice(0, 30)
</script>

<template>
  <Head :title="`${trackedProduct.product_name} - Price Tracker`" />

  <AuthenticatedLayout>
    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-3 mb-2">
                <h1 class="text-3xl font-bold text-gray-900">{{ trackedProduct.product_name }}</h1>
                <span class="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {{ trackedProduct.retailer.name }}
                </span>
              </div>
              <p v-if="trackedProduct.product_variant" class="text-gray-600">
                {{ trackedProduct.product_variant }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                SKU/UPC: {{ trackedProduct.sku_upc }}
              </p>
            </div>
            
            <div class="flex space-x-3">
              <button
                @click="refreshPrice"
                :disabled="refreshForm.processing"
                class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                :class="{ 'opacity-50 cursor-not-allowed': refreshForm.processing }"
              >
                <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': refreshForm.processing }" />
                <span>Refresh</span>
              </button>
              
              <button
                @click="isEditing = !isEditing"
                class="bg-primary hover:bg-primary-shade-1 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <PencilIcon class="h-5 w-5" />
                <span>{{ isEditing ? 'Cancel' : 'Edit' }}</span>
              </button>
              
              <button
                @click="deleteProduct"
                class="bg-danger hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <TrashIcon class="h-5 w-5" />
                <span>Stop Tracking</span>
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Product Overview -->
            <div class="futuristic-card p-6">
              <div class="flex items-start space-x-6">
                <img 
                  v-if="trackedProduct.product_image_url"
                  :src="trackedProduct.product_image_url"
                  :alt="trackedProduct.product_name"
                  class="w-32 h-32 object-cover rounded-lg"
                />
                
                <div class="flex-1">
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <h3 class="text-sm font-medium text-gray-600 mb-2">Current Price</h3>
                      <p class="text-3xl font-bold text-gray-900">
                        {{ formatCurrency(trackedProduct.current_price) }}
                      </p>
                      <div v-if="trackedProduct.price_drop_percentage > 0" class="mt-2">
                        <span class="text-success font-medium">
                          {{ formatCurrency(trackedProduct.original_price - trackedProduct.current_price) }} saved
                          ({{ trackedProduct.price_drop_percentage.toFixed(1) }}% off)
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 class="text-sm font-medium text-gray-600 mb-2">Target Price</h3>
                      <p class="text-2xl font-bold text-primary">
                        {{ formatCurrency(trackedProduct.target_price) }}
                      </p>
                      <div class="mt-2">
                        <span 
                          class="text-sm px-2 py-1 rounded"
                          :class="trackedProduct.current_price <= trackedProduct.target_price 
                            ? 'bg-success/10 text-success' 
                            : 'bg-gray-100 text-gray-600'"
                        >
                          {{ trackedProduct.current_price <= trackedProduct.target_price ? 'Target Reached!' : 'Tracking...' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="mt-6">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress to Target</span>
                      <span>
                        {{ Math.max(0, Math.min(100, ((trackedProduct.original_price - trackedProduct.current_price) / (trackedProduct.original_price - trackedProduct.target_price)) * 100)).toFixed(0) }}%
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        class="bg-primary rounded-full h-3 transition-all duration-300"
                        :style="{ 
                          width: Math.max(0, Math.min(100, ((trackedProduct.original_price - trackedProduct.current_price) / (trackedProduct.original_price - trackedProduct.target_price)) * 100)) + '%' 
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="trackedProduct.product_description" class="mt-6 pt-6 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Description</h3>
                <p class="text-gray-700 text-sm">{{ trackedProduct.product_description }}</p>
              </div>
            </div>

            <!-- Edit Form -->
            <div v-if="isEditing" class="futuristic-card p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Edit Tracking Settings</h2>
              
              <form @submit.prevent="updateProduct" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="target_price" class="block text-sm font-medium text-gray-700 mb-2">
                      Target Price
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500">$</span>
                      </div>
                      <input
                        id="target_price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        :max="trackedProduct.current_price - 0.01"
                        v-model="editForm.target_price"
                        class="block w-full pl-8 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div v-if="editForm.errors.target_price" class="mt-2 text-sm text-danger">
                      {{ editForm.errors.target_price }}
                    </div>
                  </div>

                  <div>
                    <label for="tracking_end_date" class="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      id="tracking_end_date"
                      type="date"
                      v-model="editForm.tracking_end_date"
                      class="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                    <div v-if="editForm.errors.tracking_end_date" class="mt-2 text-sm text-danger">
                      {{ editForm.errors.tracking_end_date }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center">
                  <input
                    id="is_active"
                    type="checkbox"
                    v-model="editForm.is_active"
                    class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label for="is_active" class="ml-2 block text-sm text-gray-700">
                    Keep tracking active
                  </label>
                </div>

                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="isEditing = false"
                    class="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="editForm.processing"
                    class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {{ editForm.processing ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Price History Chart -->
            <div class="futuristic-card p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ChartBarIcon class="h-5 w-5" />
                <span>Price History</span>
              </h2>
              
              <div v-if="chartData.length > 1" class="space-y-4">
                <!-- Simple visualization -->
                <div class="relative h-64 bg-gray-50 rounded-lg p-4">
                  <div class="absolute inset-4">
                    <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <!-- Grid lines -->
                      <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#grid)" />
                      
                      <!-- Price line -->
                      <polyline
                        :points="chartData.map((point, index) => {
                          const x = (index / (chartData.length - 1)) * 100
                          const minPrice = Math.min(...chartData.map(p => p.price))
                          const maxPrice = Math.max(...chartData.map(p => p.price))
                          const y = 100 - ((point.price - minPrice) / (maxPrice - minPrice)) * 100
                          return `${x},${y}`
                        }).join(' ')"
                        fill="none"
                        stroke="#6366f1"
                        stroke-width="2"
                        class="drop-shadow-sm"
                      />
                      
                      <!-- Target price line -->
                      <line
                        x1="0"
                        y1="80"
                        x2="100" 
                        y2="80"
                        stroke="#10b981"
                        stroke-width="1"
                        stroke-dasharray="5,5"
                        opacity="0.7"
                      />
                    </svg>
                  </div>
                </div>
                
                <!-- Price points -->
                <div class="flex justify-between text-xs text-gray-600">
                  <div v-for="(point, index) in chartData.slice(0, 5)" :key="point.id">
                    <div class="font-medium">{{ formatCurrency(point.price) }}</div>
                    <div>{{ formatDateShort(point.checked_at) }}</div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500">
                <ChartBarIcon class="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Not enough data points for chart visualization</p>
                <p class="text-sm">Check back after a few price updates</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Tracking Info -->
            <div class="futuristic-card p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Tracking Info</h3>
              
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Original Price</span>
                  <span class="font-medium">{{ formatCurrency(trackedProduct.original_price) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Started</span>
                  <span class="font-medium">{{ formatDate(trackedProduct.tracking_start_date) }}</span>
                </div>
                
                <div v-if="trackedProduct.tracking_end_date" class="flex justify-between">
                  <span class="text-gray-600">Ends</span>
                  <span class="font-medium">{{ formatDate(trackedProduct.tracking_end_date) }}</span>
                </div>
                
                <div v-if="trackedProduct.last_checked_at" class="flex justify-between">
                  <span class="text-gray-600">Last Checked</span>
                  <span class="font-medium">{{ formatDate(trackedProduct.last_checked_at) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Status</span>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="trackedProduct.is_active 
                      ? 'bg-success/10 text-success' 
                      : 'bg-gray-100 text-gray-600'"
                  >
                    {{ trackedProduct.is_active ? 'Active' : 'Paused' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Alerts -->
            <div class="futuristic-card p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BellIcon class="h-5 w-5" />
                <span>Recent Alerts</span>
              </h3>
              
              <div v-if="trackedProduct.price_alerts.length > 0" class="space-y-3">
                <div 
                  v-for="alert in trackedProduct.price_alerts.slice(0, 5)" 
                  :key="alert.id"
                  class="border rounded-lg p-3"
                  :class="getAlertTypeColor(alert.alert_type)"
                >
                  <div class="flex justify-between items-start mb-1">
                    <span class="text-sm font-medium">{{ getAlertTypeText(alert.alert_type) }}</span>
                    <span class="text-xs opacity-75">{{ formatDate(alert.triggered_at) }}</span>
                  </div>
                  <div class="text-sm">
                    {{ formatCurrency(alert.old_price) }} → {{ formatCurrency(alert.new_price) }}
                  </div>
                  <div v-if="!alert.notification_sent" class="text-xs mt-1 opacity-75">
                    Notification pending
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-6 text-gray-500">
                <BellIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">No alerts yet</p>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="futuristic-card p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div class="space-y-3">
                <a
                  :href="route('price-tracker.index')"
                  class="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Back to All Products
                </a>
                
                <a
                  :href="route('price-tracker.create')"
                  class="block w-full text-center bg-primary hover:bg-primary-shade-1 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Track Another Product
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>