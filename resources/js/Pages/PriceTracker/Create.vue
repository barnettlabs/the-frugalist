<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { ref, watch, computed } from 'vue'
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

interface Retailer {
  id: number
  name: string
  slug: string
  is_active: boolean
}

interface ProductData {
  name: string
  variant?: string
  description?: string
  image_url?: string
  price: number
  in_stock: boolean
  sku_upc: string
  retailer_url?: string
  metadata: Record<string, any>
}

interface Props {
  retailers: Retailer[]
}

const props = defineProps<Props>()

const form = useForm({
  retailer_id: '',
  sku_upc: '',
  target_price: '',
  tracking_start_date: new Date().toISOString().split('T')[0],
  tracking_end_date: '',
})

const productValidation = ref<{
  isValidating: boolean
  isValid: boolean
  product: ProductData | null
  error: string | null
}>({
  isValidating: false,
  isValid: false,
  product: null,
  error: null
})

const validateProduct = async () => {
  if (!form.retailer_id || !form.sku_upc) {
    productValidation.value = {
      isValidating: false,
      isValid: false,
      product: null,
      error: null
    }
    return
  }

  productValidation.value.isValidating = true
  productValidation.value.error = null

  try {
    const response = await fetch('/price-tracker/validate-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({
        retailer_id: form.retailer_id,
        sku_upc: form.sku_upc,
      }),
    })

    const data = await response.json()

    if (data.valid) {
      productValidation.value = {
        isValidating: false,
        isValid: true,
        product: data.product,
        error: null
      }
      
      // Set a reasonable target price (10% below current price)
      if (!form.target_price) {
        form.target_price = (data.product.price * 0.9).toFixed(2)
      }
    } else {
      productValidation.value = {
        isValidating: false,
        isValid: false,
        product: null,
        error: data.message || 'Product not found'
      }
    }
  } catch (error) {
    productValidation.value = {
      isValidating: false,
      isValid: false,
      product: null,
      error: 'Error validating product. Please try again.'
    }
  }
}

// Watch for changes in retailer or SKU/UPC
watch([() => form.retailer_id, () => form.sku_upc], () => {
  if (form.retailer_id && form.sku_upc && form.sku_upc.length >= 6) {
    const debounceTimer = setTimeout(() => {
      validateProduct()
    }, 500)
    
    return () => clearTimeout(debounceTimer)
  }
})

const maxTargetPrice = computed(() => {
  return productValidation.value.product ? productValidation.value.product.price - 0.01 : null
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const submit = () => {
  form.post(route('price-tracker.store'))
}
</script>

<template>
  <Head title="Track New Product - Smart Price Tracker" />

  <AuthenticatedLayout>
    <div class="py-12">
      <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Track New Product</h1>
          <p class="mt-2 text-gray-600">
            Enter a product SKU or UPC to start monitoring its price
          </p>
        </div>

        <form @submit.prevent="submit" class="space-y-8">
          <!-- Retailer Selection -->
          <div class="futuristic-card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Select Retailer</h2>
            
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label 
                v-for="retailer in retailers" 
                :key="retailer.id"
                class="relative cursor-pointer"
              >
                <input
                  type="radio"
                  :value="retailer.id"
                  v-model="form.retailer_id"
                  class="sr-only"
                />
                <div 
                  class="border-2 rounded-lg p-4 text-center transition-all duration-150"
                  :class="form.retailer_id == retailer.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'"
                >
                  <div class="font-medium">{{ retailer.name }}</div>
                  <div class="text-xs mt-1 opacity-75">{{ retailer.slug }}</div>
                </div>
              </label>
            </div>

            <div v-if="form.errors.retailer_id" class="mt-2 text-sm text-danger">
              {{ form.errors.retailer_id }}
            </div>
          </div>

          <!-- Product Information -->
          <div class="futuristic-card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            
            <div class="space-y-4">
              <!-- SKU/UPC Input -->
              <div>
                <label for="sku_upc" class="block text-sm font-medium text-gray-700 mb-2">
                  Product SKU or UPC
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="sku_upc"
                    type="text"
                    v-model="form.sku_upc"
                    placeholder="Enter SKU or UPC number"
                    class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    :class="{ 'border-danger': form.errors.sku_upc }"
                  />
                  
                  <!-- Validation Status -->
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div v-if="productValidation.isValidating" 
                         class="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent">
                    </div>
                    <CheckCircleIcon v-else-if="productValidation.isValid" 
                                     class="h-5 w-5 text-success" />
                    <ExclamationTriangleIcon v-else-if="productValidation.error" 
                                             class="h-5 w-5 text-danger" />
                  </div>
                </div>
                
                <div v-if="form.errors.sku_upc" class="mt-2 text-sm text-danger">
                  {{ form.errors.sku_upc }}
                </div>
                <div v-else-if="productValidation.error" class="mt-2 text-sm text-danger">
                  {{ productValidation.error }}
                </div>
              </div>

              <!-- Product Preview -->
              <div v-if="productValidation.isValid && productValidation.product" 
                   class="bg-gray-50 rounded-lg p-4 border">
                <h3 class="font-medium text-gray-900 mb-2">Product Found</h3>
                
                <div class="flex items-start space-x-4">
                  <img 
                    v-if="productValidation.product.image_url"
                    :src="productValidation.product.image_url"
                    :alt="productValidation.product.name"
                    class="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ productValidation.product.name }}</h4>
                    <p v-if="productValidation.product.variant" class="text-sm text-gray-600 mt-1">
                      {{ productValidation.product.variant }}
                    </p>
                    <div class="mt-2">
                      <span class="text-lg font-bold text-gray-900">
                        {{ formatCurrency(productValidation.product.price) }}
                      </span>
                      <span 
                        class="ml-2 text-sm px-2 py-1 rounded"
                        :class="productValidation.product.in_stock 
                          ? 'bg-success/10 text-success' 
                          : 'bg-danger/10 text-danger'"
                      >
                        {{ productValidation.product.in_stock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Price Target -->
          <div class="futuristic-card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Price Target</h2>
            
            <div>
              <label for="target_price" class="block text-sm font-medium text-gray-700 mb-2">
                Target Price (Alert when price drops to or below this amount)
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
                  :max="maxTargetPrice"
                  v-model="form.target_price"
                  placeholder="0.00"
                  class="block w-full pl-8 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  :class="{ 'border-danger': form.errors.target_price }"
                />
              </div>
              
              <div v-if="form.errors.target_price" class="mt-2 text-sm text-danger">
                {{ form.errors.target_price }}
              </div>
              <div v-else-if="productValidation.product" class="mt-2 text-sm text-gray-600">
                Current price: {{ formatCurrency(productValidation.product.price) }}. 
                Target must be lower than current price.
              </div>
            </div>
          </div>

          <!-- Tracking Period -->
          <div class="futuristic-card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Tracking Period</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="tracking_start_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="tracking_start_date"
                    type="date"
                    v-model="form.tracking_start_date"
                    class="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    :class="{ 'border-danger': form.errors.tracking_start_date }"
                  />
                </div>
                <div v-if="form.errors.tracking_start_date" class="mt-2 text-sm text-danger">
                  {{ form.errors.tracking_start_date }}
                </div>
              </div>

              <div>
                <label for="tracking_end_date" class="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="tracking_end_date"
                    type="date"
                    v-model="form.tracking_end_date"
                    class="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    :class="{ 'border-danger': form.errors.tracking_end_date }"
                  />
                </div>
                <div v-if="form.errors.tracking_end_date" class="mt-2 text-sm text-danger">
                  {{ form.errors.tracking_end_date }}
                </div>
                <p class="mt-2 text-sm text-gray-600">
                  Leave blank to track indefinitely
                </p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-between">
            <a 
              :href="route('price-tracker.index')"
              class="text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </a>
            
            <button
              type="submit"
              :disabled="form.processing || !productValidation.isValid"
              class="bg-primary hover:bg-primary-shade-1 text-white px-8 py-3 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="form.processing">Starting Tracking...</span>
              <span v-else>Start Tracking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>