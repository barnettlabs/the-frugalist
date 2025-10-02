<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { ref, watch, computed } from 'vue'
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/vue/24/outline'
import BestBuyLogo from '@/../assets/logos/retailers/best-buy-logo.jpg'
import HomeDepotLogo from '@/../assets/logos/retailers/home-depot-logo.png'

interface Retailer {
  id: number
  name: string
  slug: string
  logo_url?: string
  is_active: boolean
}

interface ProductData {
  name: string
  variant?: string
  description?: string
  image_url?: string
  retail_price: number
  current_price: number
  in_stock: boolean
  sku_upc: string
  retailer_url?: string
  metadata: Record<string, any>
}

interface User {
  id: number
  email: string
  email_verified_at?: string
  phone_number?: string
  phone_verified_at?: string
}

interface Props {
  retailers: Retailer[]
  user: User
}

const props = defineProps<Props>()

const form = useForm({
  retailer_id: '',
  sku_upc: '',
  target_price: '',
  discount_percentage: '',
  notification_methods: [] as string[],
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
  error: null,
})

const validateProduct = async () => {
  if (!form.retailer_id || !form.sku_upc) {
    productValidation.value = {
      isValidating: false,
      isValid: false,
      product: null,
      error: null,
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
        'X-CSRF-TOKEN':
          document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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
        error: null,
      }

      // Set a reasonable target price (10% below current price)
      if (!form.target_price) {
        const discountPercentage = 10
        form.target_price = (data.product.retail_price * (1 - discountPercentage / 100)).toFixed(2)
        form.discount_percentage = discountPercentage.toString()
      }
    } else {
      productValidation.value = {
        isValidating: false,
        isValid: false,
        product: null,
        error: data.message || 'Product not found',
      }
    }
  } catch (error) {
    productValidation.value = {
      isValidating: false,
      isValid: false,
      product: null,
      error: 'Error validating product. Please try again.',
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
  return productValidation.value.product
    ? productValidation.value.product.current_price - 0.01
    : null
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Computed property for discount amount
const discountAmount = computed(() => {
  if (!productValidation.value.product || !form.target_price) return null
  const retailPrice = productValidation.value.product.retail_price
  const targetPrice = parseFloat(form.target_price)
  if (isNaN(targetPrice)) return null
  return retailPrice - targetPrice
})

// Computed property for discount percentage
const calculatedDiscountPercentage = computed(() => {
  if (!productValidation.value.product || !form.target_price) return null
  const retailPrice = productValidation.value.product.retail_price
  const targetPrice = parseFloat(form.target_price)
  if (isNaN(targetPrice) || retailPrice === 0) return null
  return (((retailPrice - targetPrice) / retailPrice) * 100).toFixed(1)
})

// Handler for target price blur - update discount percentage
const handleTargetPriceBlur = () => {
  if (form.target_price && calculatedDiscountPercentage.value) {
    form.discount_percentage = calculatedDiscountPercentage.value
  }
}

// Handler for discount percentage blur - update target price
const handleDiscountPercentageBlur = () => {
  if (form.discount_percentage && productValidation.value.product) {
    const discount = parseFloat(form.discount_percentage)
    if (!isNaN(discount) && discount >= 0 && discount <= 100) {
      const retailPrice = productValidation.value.product.retail_price
      const targetPrice = retailPrice * (1 - discount / 100)
      form.target_price = targetPrice.toFixed(2)
    }
  }
}

// Computed for form step progression
const canProceedToProduct = computed(() => !!form.retailer_id)
const canProceedToPrice = computed(
  () => canProceedToProduct.value && productValidation.value.isValid
)
const canProceedToNotifications = computed(() => canProceedToPrice.value && !!form.target_price)

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
          <p class="mt-2 text-gray-600">Enter a product SKU or UPC to start monitoring its price</p>
        </div>

        <form @submit.prevent="submit" class="space-y-8">
          <!-- Step 1: Retailer Selection -->
          <div class="futuristic-card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              <span
                class="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-2 text-sm"
                >1</span
              >
              Select Retailer
            </h2>

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
                  class="border-2 rounded-lg p-4 text-center transition-all duration-150 flex flex-col items-center"
                  :class="
                    form.retailer_id == retailer.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  "
                >
                  <img
                    :src="retailer.name === 'Best Buy' ? BestBuyLogo : HomeDepotLogo"
                    :alt="retailer.name"
                    class="h-12 w-auto mb-2 rounded"
                  />
                  <div class="font-medium">{{ retailer.name }}</div>
                </div>
              </label>
            </div>

            <div v-if="form.errors.retailer_id" class="mt-2 text-sm text-danger">
              {{ form.errors.retailer_id }}
            </div>
          </div>

          <!-- Step 2: Product Information -->
          <div
            class="futuristic-card p-6"
            :class="{ 'opacity-50 pointer-events-none': !canProceedToProduct }"
          >
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              <span
                class="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-2 text-sm"
                >2</span
              >
              Product Information
            </h2>

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
                    <div
                      v-if="productValidation.isValidating"
                      class="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"
                    ></div>
                    <CheckCircleIcon
                      v-else-if="productValidation.isValid"
                      class="h-5 w-5 text-success"
                    />
                    <ExclamationTriangleIcon
                      v-else-if="productValidation.error"
                      class="h-5 w-5 text-danger"
                    />
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
              <div
                v-if="productValidation.isValid && productValidation.product"
                class="bg-gray-50 rounded-lg p-4 border"
              >
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
                        {{ formatCurrency(productValidation.product.retail_price) }}
                      </span>
                      <span
                        class="ml-2 text-sm px-2 py-1 rounded"
                        :class="
                          productValidation.product.in_stock
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        "
                      >
                        {{ productValidation.product.in_stock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Price Target -->
          <div
            class="futuristic-card p-6"
            :class="{ 'opacity-50 pointer-events-none': !canProceedToPrice }"
          >
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              <span
                class="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-2 text-sm"
                >3</span
              >
              Price Target
            </h2>

            <!-- Price Information -->
            <div v-if="productValidation.product" class="mb-6 p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-600 mb-1">Retail Price</div>
                  <div class="text-xl font-bold text-gray-900">
                    {{ formatCurrency(productValidation.product.retail_price) }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 mb-1">Current Listed Price</div>
                  <div class="text-xl font-bold text-gray-900">
                    {{ formatCurrency(productValidation.product.current_price) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Target Price and Discount -->
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
                    :max="maxTargetPrice"
                    v-model="form.target_price"
                    @blur="handleTargetPriceBlur"
                    placeholder="0.00"
                    class="block w-full pl-8 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    :class="{ 'border-danger': form.errors.target_price }"
                  />
                </div>
                <div v-if="form.errors.target_price" class="mt-2 text-sm text-danger">
                  {{ form.errors.target_price }}
                </div>
              </div>

              <div>
                <label
                  for="discount_percentage"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Discount %
                </label>
                <div class="relative">
                  <input
                    id="discount_percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    v-model="form.discount_percentage"
                    @blur="handleDiscountPercentageBlur"
                    placeholder="0.0"
                    class="block w-full pr-8 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                  <div
                    class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                  >
                    <span class="text-gray-500">%</span>
                  </div>
                </div>
                <div v-if="discountAmount" class="mt-2 text-sm text-success">
                  Save {{ formatCurrency(discountAmount) }}
                </div>
              </div>
            </div>

            <p class="mt-4 text-sm text-gray-600">
              Enter a target price manually or specify a discount percentage. Values update
              automatically.
            </p>
          </div>

          <!-- Step 4: Notification Preferences -->
          <div
            class="futuristic-card p-6"
            :class="{ 'opacity-50 pointer-events-none': !canProceedToNotifications }"
          >
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              <span
                class="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-2 text-sm"
                >4</span
              >
              Notification Preferences
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                v-for="method in [
                  {
                    value: 'email',
                    label: 'Email',
                    icon: EnvelopeIcon,
                    available: !!user.email_verified_at,
                  },
                  // SMS TEMPORARILY DISABLED - waiting for Twilio approval
                  // { value: 'sms', label: 'SMS', icon: DevicePhoneMobileIcon, available: !!user.phone_verified_at },
                ]"
                :key="method.value"
                class="relative"
                :class="method.available ? 'cursor-pointer' : 'cursor-not-allowed'"
              >
                <input
                  type="checkbox"
                  :value="method.value"
                  v-model="form.notification_methods"
                  :disabled="!method.available"
                  class="sr-only"
                />
                <div
                  class="border-2 rounded-lg p-4 text-center transition-all duration-150 flex flex-col items-center relative"
                  :class="
                    !method.available
                      ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                      : form.notification_methods.includes(method.value)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  "
                >
                  <component :is="method.icon" class="h-8 w-8 mb-2" />
                  <div class="font-medium">{{ method.label }}</div>
                  <div v-if="!method.available" class="absolute top-2 right-2">
                    <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div
                    v-if="method.available && form.notification_methods.includes(method.value)"
                    class="absolute top-2 right-2"
                  >
                    <svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </label>
            </div>

            <div v-if="form.errors.notification_methods" class="mt-2 text-sm text-danger">
              {{ form.errors.notification_methods }}
            </div>

            <p class="mt-4 text-sm text-gray-600">
              Select how you'd like to be notified when your target price is reached. Tracking will
              automatically stop after notification is sent.
            </p>

            <div
              v-if="!user.email_verified_at"
              class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <p class="text-sm text-yellow-800">
                <strong>Note: </strong>
                <span v-if="!user.email_verified_at"
                  >Email notifications are unavailable until you verify your email address.</span
                >
              </p>
            </div>

            <!-- SMS TEMPORARILY DISABLED
            <div v-if="!user.phone_verified_at || !user.email_verified_at" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-sm text-yellow-800">
                <strong>Note:</strong>
                <span v-if="!user.email_verified_at">Email notifications are unavailable until you verify your email address.</span>
                <span v-if="!user.phone_verified_at">
                  SMS notifications are unavailable until you verify your phone number in your
                  <a href="/profile" class="underline font-medium">profile settings</a>.
                </span>
              </p>
            </div>
            -->
          </div>

          <!-- Step 5: Tracking Period -->
          <div
            class="futuristic-card p-6"
            :class="{ 'opacity-50 pointer-events-none': !canProceedToNotifications }"
          >
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              <span
                class="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-2 text-sm"
                >5</span
              >
              Tracking Period
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="tracking_start_date"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
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
                <p class="mt-2 text-sm text-gray-600">Leave blank to track indefinitely</p>
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
