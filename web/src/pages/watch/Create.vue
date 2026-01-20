<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import Checkbox from '@/components/Checkbox.vue'
import Card from '@/components/Card.vue'
import Alert from '@/components/Alert.vue'
import Badge from '@/components/Badge.vue'
import Spinner from '@/components/Spinner.vue'
import { watchApi, watchDebugApi, getRetailers, type Retailer, type NotificationMethod, type ValidateProductResponse, type ValidatedProduct, type DebugInfo } from '@/api/watch'
import { devicesApi } from '@/api/devices'
import { formatCurrency } from '@/utils/formatters'
import {
  BuildingStorefrontIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  BugAntIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0]

const form = ref({
  retailer_id: 0,
  sku_upc: '',
  target_price: '',
  start_date: today,
  end_date: '',
  notification_email: true,
  notification_push: false,
})

const loading = ref(false)
const validating = ref(false)
const validatedProduct = ref<ValidateProductResponse | null>(null)
const validationError = ref('')
const errors = ref<Record<string, string[]>>({})

// Debug mode state
const canDebug = ref(false)
const debugEnabled = ref(false)
const debugInfo = ref<DebugInfo | null>(null)

// Retailers fetched from the database
const retailers = ref<Retailer[]>([])
const retailersLoading = ref(true)

// Device registration status for push notifications
const hasActiveDevices = ref(false)

// Only show retailers that are active or coming soon
const visibleRetailers = computed(() => {
  return retailers.value.filter(r => r.is_active || r.coming_soon)
})

// Track the last validated SKU to avoid re-validating the same value
const lastValidatedSku = ref('')

const selectedRetailer = computed(() => {
  return retailers.value.find(r => r.id === form.value.retailer_id)
})

const notificationMethods = computed((): NotificationMethod[] => {
  const methods: NotificationMethod[] = []
  if (form.value.notification_email) methods.push('email')
  if (form.value.notification_push) methods.push('push')
  return methods
})

// Step completion checks
const isStoreSelected = computed(() => form.value.retailer_id > 0)
const isSkuEntered = computed(() => form.value.sku_upc.trim().length > 0)
const isProductValidated = computed(() => validatedProduct.value?.valid === true && validatedProduct.value?.product != null)
const hasNotificationMethod = computed(() => notificationMethods.value.length > 0)

// Convenience accessor for the validated product data
const product = computed((): ValidatedProduct | null => {
  return validatedProduct.value?.product ?? null
})

const targetPriceValue = computed(() => {
  const val = parseFloat(form.value.target_price)
  return isNaN(val) ? null : val
})

const isTargetPriceValid = computed(() => {
  if (targetPriceValue.value === null) return false
  if (targetPriceValue.value <= 0) return false
  if (!product.value?.current_price) return true
  return targetPriceValue.value < product.value.current_price
})

const targetPriceError = computed(() => {
  if (!form.value.target_price) return 'Target price is required'
  if (targetPriceValue.value === null || targetPriceValue.value <= 0) return 'Enter a valid price'
  if (product.value?.current_price && targetPriceValue.value >= product.value.current_price) {
    return `Target price must be less than current price ($${formatCurrency(product.value.current_price)})`
  }
  return ''
})

// Calculate savings percentage
const savingsPercent = computed(() => {
  if (!product.value?.retail_price || !product.value?.current_price) return null
  if (product.value.retail_price <= product.value.current_price) return null
  return Math.round((1 - product.value.current_price / product.value.retail_price) * 100)
})

const isFormValid = computed(() => {
  return isStoreSelected.value &&
    isSkuEntered.value &&
    isProductValidated.value &&
    isTargetPriceValid.value &&
    hasNotificationMethod.value
})

const skuPlaceholder = computed(() => {
  if (!selectedRetailer.value) return 'Select a store first'
  switch (selectedRetailer.value.slug) {
    case 'amazon':
      return 'e.g., B08N5WRWNW (ASIN)'
    case 'bestbuy':
      return 'e.g., 6505727 (SKU)'
    case 'homedepot':
      return 'e.g., 312066362 (Internet #)'
    case 'lowes':
      return 'e.g., 1000123456 (Item #)'
    case 'walmart':
      return 'e.g., 123456789 (Item ID)'
    case 'target':
      return 'e.g., 12345678 (TCIN)'
    default:
      return 'Enter SKU or UPC'
  }
})

// Reset validation when store changes
watch(() => form.value.retailer_id, () => {
  validatedProduct.value = null
  validationError.value = ''
  lastValidatedSku.value = ''
})

// Validate product on blur
const validateProduct = async () => {
  const sku = form.value.sku_upc.trim()

  // Skip if empty, no store selected, or already validated this exact SKU
  if (!sku || !form.value.retailer_id) return
  if (sku === lastValidatedSku.value && validatedProduct.value) return

  validating.value = true
  validationError.value = ''
  validatedProduct.value = null
  debugInfo.value = null

  try {
    if (debugEnabled.value) {
      // Use separate debug endpoint
      const result = await watchDebugApi.validateProduct(form.value.retailer_id, sku)
      lastValidatedSku.value = sku
      debugInfo.value = result.debug

      if (result.valid && result.product) {
        validatedProduct.value = { valid: true, product: result.product }
      } else {
        validationError.value = result.message || 'Product not found. Please check the SKU/UPC and try again.'
      }
    } else {
      // Use production endpoint
      const result = await watchApi.validateProduct(form.value.retailer_id, sku)
      lastValidatedSku.value = sku

      if (result.valid && result.product) {
        validatedProduct.value = result
      } else {
        validationError.value = result.message || 'Product not found. Please check the SKU/UPC and try again.'
      }
    }
  } catch (error: any) {
    validationError.value = error.response?.data?.message || 'Failed to validate product. Please try again.'
  } finally {
    validating.value = false
  }
}

// Clear validation when SKU changes
watch(() => form.value.sku_upc, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    // Only clear if the value actually changed from what was validated
    if (newVal.trim() !== lastValidatedSku.value) {
      validatedProduct.value = null
      validationError.value = ''
    }
  }
})

const submitForm = async () => {
  if (!isFormValid.value) return

  loading.value = true
  errors.value = {}

  try {
    // Use today if start_date is empty
    const startDate = form.value.start_date || today

    const newProduct = await watchApi.create({
      retailer_id: form.value.retailer_id,
      sku_upc: form.value.sku_upc.trim(),
      target_price: targetPriceValue.value!,
      tracking_start_date: startDate,
      tracking_end_date: form.value.end_date || undefined,
      notification_methods: notificationMethods.value,
    })
    router.push(`/watch/${newProduct.id}`)
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value = { general: ['Failed to create tracker. Please try again.'] }
    }
  } finally {
    loading.value = false
  }
}

// Fetch retailers, debug access, and device status on mount
onMounted(async () => {
  try {
    const [fetchedRetailers, hasDebugAccess, hasDevices] = await Promise.all([
      getRetailers(),
      watchDebugApi.canDebug(),
      devicesApi.hasActiveDevices(),
    ])
    retailers.value = fetchedRetailers
    canDebug.value = hasDebugAccess
    hasActiveDevices.value = hasDevices
  } catch (error) {
    console.error('Failed to load initial data:', error)
  } finally {
    retailersLoading.value = false
  }
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <PageHeader title="Track New Product" description="Set up price tracking for a product" back-link="/watch"
        back-label="Watch" />

      <!-- General Error -->
      <Alert v-if="errors.general" variant="danger" class="mb-6">
        {{ errors.general[0] }}
      </Alert>

      <!-- Step 1: Store Selection -->
      <Card class="mb-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm">
            1
          </div>
          <h3 class="text-lg font-bold text-primary">Select Store</h3>
          <CheckCircleIcon v-if="isStoreSelected" class="h-5 w-5 text-success ml-auto" />
        </div>

        <!-- Loading state -->
        <div v-if="retailersLoading" class="flex items-center justify-center py-8">
          <Spinner size="md" color="primary" />
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button v-for="retailer in visibleRetailers" :key="retailer.id" type="button"
            @click="retailer.is_active && !retailer.coming_soon ? form.retailer_id = retailer.id : null"
            :disabled="!retailer.is_active || retailer.coming_soon" :class="[
              'relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
              !retailer.is_active || retailer.coming_soon
                ? 'border-border bg-background cursor-not-allowed opacity-60'
                : form.retailer_id === retailer.id
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border hover:border-tan-dark text-text-muted hover:bg-tan-light cursor-pointer'
            ]">
            <BuildingStorefrontIcon class="h-6 w-6 mb-2" />
            <span class="text-sm font-medium text-center">{{ retailer.name }}</span>
            <!-- Coming Soon Badge -->
            <Badge v-if="retailer.coming_soon" variant="warning" size="sm" class="absolute -top-2 -right-2">
              Soon
            </Badge>
            <!-- Selected Checkmark -->
            <div v-if="form.retailer_id === retailer.id"
              class="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
        <InputError :message="errors.retailer_id?.[0]" class="mt-2" />
      </Card>

      <!-- Step 2: SKU/UPC Input -->
      <Card class="mb-4 transition-opacity duration-200"
        :class="{ 'opacity-50 pointer-events-none': !isStoreSelected }">
        <div class="flex items-center gap-3 mb-4">
          <div :class="[
            'flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
            isStoreSelected ? 'bg-accent text-white' : 'bg-border text-text-muted'
          ]">
            2
          </div>
          <h3 :class="['text-lg font-bold', isStoreSelected ? 'text-primary' : 'text-text-muted']">
            Enter Product Identifier
          </h3>
          <!-- Debug Toggle (only visible to authorized users) -->
          <button v-if="canDebug && isStoreSelected" @click="debugEnabled = !debugEnabled" :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ml-auto',
            debugEnabled
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-border hover:bg-border/80 text-text-muted'
          ]" title="Toggle debug mode">
            <BugAntIcon class="h-4 w-4" />
            <span>{{ debugEnabled ? 'Debug On' : 'Debug' }}</span>
          </button>
          <CheckCircleIcon v-if="isProductValidated" class="h-5 w-5 text-success"
            :class="{ 'ml-auto': !canDebug || !isStoreSelected }" />
        </div>

        <div>
          <InputLabel for="sku_upc" value="SKU / UPC / Item Number" />
          <div class="flex gap-2 mt-1">
            <div class="relative flex-1">
              <TextInput id="sku_upc" v-model="form.sku_upc" type="text" class="block w-full"
                :placeholder="skuPlaceholder" :disabled="!isStoreSelected" @keyup.enter="validateProduct" />
            </div>
            <button type="button" @click="validateProduct"
              :disabled="!isStoreSelected || !form.sku_upc.trim() || validating" :class="[
                'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                !isStoreSelected || !form.sku_upc.trim() || validating
                  ? 'bg-border text-text-muted cursor-not-allowed'
                  : 'bg-accent hover:bg-accent-dark text-white'
              ]">
              <Spinner v-if="validating" size="sm" color="white" />
              <MagnifyingGlassIcon v-else class="h-5 w-5" />
              <span class="hidden sm:inline">{{ validating ? 'Searching...' : 'Search' }}</span>
            </button>
          </div>
          <InputError :message="errors.sku_upc?.[0]" class="mt-2" />
        </div>

        <!-- Validation Error -->
        <Alert v-if="validationError" variant="danger" class="mt-4" :title="validationError" />

        <!-- Product Preview -->
        <div v-if="isProductValidated && product" class="mt-4 p-5 bg-success/5 border border-success/20 rounded-xl">
          <!-- Success Header -->
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-success/20">
            <CheckCircleIcon class="h-5 w-5 text-success flex-shrink-0" />
            <span class="text-sm font-medium text-success">Product Found</span>
            <div class="flex items-center gap-2 ml-auto">
              <Badge v-if="product.metadata?.clearance" variant="warning" size="sm">Clearance</Badge>
              <Badge v-if="product.metadata?.on_sale" variant="accent" size="sm">On Sale</Badge>
              <Badge v-if="product.in_stock === false" variant="danger" size="sm">Out of Stock</Badge>
              <Badge v-else-if="product.in_stock === true" variant="success" size="sm">In Stock</Badge>
            </div>
          </div>

          <div class="flex gap-5">
            <!-- Product Image -->
            <div class="flex-shrink-0">
              <div v-if="product.image_url" class="w-40 h-40 rounded-lg bg-white border border-border overflow-hidden">
                <img :src="product.image_url" :alt="product.name" class="w-full h-full object-contain p-2" />
              </div>
              <div v-else
                class="w-40 h-40 bg-background rounded-lg flex items-center justify-center border border-border">
                <BuildingStorefrontIcon class="h-16 w-16 text-text-muted" />
              </div>
            </div>

            <!-- Product Details -->
            <div class="flex-1 min-w-0">
              <!-- Product Name -->
              <h4 class="text-lg font-bold text-primary leading-tight">{{ product.name }}</h4>

              <!-- Model / Variant -->
              <p v-if="product.variant || product.metadata?.model_number" class="text-sm text-text-muted mt-1">
                Model: {{ product.variant || product.metadata?.model_number }}
              </p>

              <!-- Description -->
              <p v-if="product.description" class="text-sm text-text-muted mt-2 line-clamp-3">
                {{ product.description }}
              </p>

              <!-- Product Identifiers -->
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-text-muted">
                <span class="flex items-center gap-1">
                  <BuildingStorefrontIcon class="h-3.5 w-3.5" />
                  {{ selectedRetailer?.name }}
                </span>
                <span class="flex items-center gap-1">
                  <TagIcon class="h-3.5 w-3.5" />
                  SKU: {{ product.sku_upc || form.sku_upc }}
                </span>
                <a v-if="product.retailer_url || product.metadata?.retailer_url"
                  :href="product.retailer_url || product.metadata?.retailer_url" target="_blank"
                  rel="noopener noreferrer" class="flex items-center gap-1 text-accent hover:underline">
                  <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
                  View on {{ selectedRetailer?.name }}
                </a>
              </div>

              <!-- Pricing -->
              <div class="flex items-end gap-4 mt-4 pt-3 border-t border-success/20">
                <div v-if="product.current_price">
                  <span class="text-xs text-text-muted block">Current Price</span>
                  <span class="text-2xl font-bold text-success">${{ formatCurrency(product.current_price) }}</span>
                </div>
                <div v-if="product.retail_price && product.retail_price !== product.current_price">
                  <span class="text-xs text-text-muted block">Retail Price</span>
                  <span class="text-lg text-text-muted line-through">${{ formatCurrency(product.retail_price) }}</span>
                </div>
                <Badge v-if="savingsPercent" variant="success" size="sm">
                  Save {{ savingsPercent }}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div v-if="isStoreSelected && !isProductValidated && !validating" class="mt-4 p-3 bg-background rounded-lg">
          <p class="text-xs text-text-muted">
            <strong>Tip:</strong>
            <template v-if="selectedRetailer?.slug === 'bestbuy'"> Look for "SKU" on the Best Buy product
              page.</template>
            <template v-else-if="selectedRetailer?.slug === 'homedepot'"> Look for "Internet #" or "Store SKU" on the
              Home Depot product page.</template>
            <template v-else-if="selectedRetailer?.slug === 'lowes'"> Look for "Item #" on the Lowe's product
              page.</template>
            <template v-else-if="selectedRetailer?.slug === 'amazon'"> Use the ASIN from the Amazon product URL (e.g.,
              B08N5WRWNW).</template>
            <template v-else-if="selectedRetailer?.slug === 'walmart'"> Look for "Item ID" or use the number from the
              Walmart product URL.</template>
            <template v-else-if="selectedRetailer?.slug === 'target'"> Look for "TCIN" on the Target product
              page.</template>
            <template v-else> Enter the product's SKU, UPC, or item number.</template>
          </p>
        </div>

        <!-- Debug Info Panel -->
        <div v-if="debugEnabled && debugInfo" class="mt-4 p-5 border-2 border-amber-500/30 rounded-xl bg-amber-50/5">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-amber-500/20">
            <BugAntIcon class="h-5 w-5 text-amber-500" />
            <span class="text-sm font-bold text-amber-500">Debug Information</span>
          </div>

          <!-- Raw API Response -->
          <div v-if="debugInfo.raw_api_response" class="mb-6">
            <h4 class="text-xs font-semibold text-primary mb-2">Raw API Response</h4>
            <div class="text-xs text-text-muted mb-2">
              <span class="font-medium">Retailer:</span> {{ debugInfo.raw_api_response.retailer }}
            </div>
            <div class="text-xs text-text-muted mb-2">
              <span class="font-medium">Endpoint:</span> {{ debugInfo.raw_api_response.endpoint }}
            </div>
            <pre
              class="bg-surface-dark p-4 rounded-lg overflow-x-auto text-xs text-text-muted max-h-80 overflow-y-auto">{{
                JSON.stringify(debugInfo.raw_api_response.response, null, 2) }}</pre>
          </div>

          <!-- Parsed Data -->
          <div v-if="debugInfo.parsed_data">
            <h4 class="text-xs font-semibold text-primary mb-2">Parsed Data</h4>
            <pre
              class="bg-surface-dark p-4 rounded-lg overflow-x-auto text-xs text-text-muted max-h-48 overflow-y-auto">{{
                JSON.stringify(debugInfo.parsed_data, null, 2) }}</pre>
          </div>

          <!-- Error Info (if any) -->
          <div v-if="debugInfo.error" class="mt-4">
            <h4 class="text-xs font-semibold text-danger mb-2">Error</h4>
            <pre class="bg-danger/10 p-4 rounded-lg overflow-x-auto text-xs text-danger max-h-48 overflow-y-auto">{{
              debugInfo.error }}</pre>
          </div>
        </div>
      </Card>

      <!-- Step 3: Tracking Settings -->
      <Card class="mb-4 transition-opacity duration-200"
        :class="{ 'opacity-50 pointer-events-none': !isProductValidated }">
        <div class="flex items-center gap-3 mb-4">
          <div :class="[
            'flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
            isProductValidated ? 'bg-accent text-white' : 'bg-border text-text-muted'
          ]">
            3
          </div>
          <h3 :class="['text-lg font-bold', isProductValidated ? 'text-primary' : 'text-text-muted']">
            Tracking Settings
          </h3>
          <CheckCircleIcon v-if="isTargetPriceValid && hasNotificationMethod" class="h-5 w-5 text-success ml-auto" />
        </div>

        <!-- Target Price & Dates -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <InputLabel for="target_price">
              Target Price <span class="text-danger">*</span>
            </InputLabel>
            <div class="relative mt-1">
              <TextInput id="target_price" v-model="form.target_price" type="number" step="0.01" min="0"
                class="pl-6"
                :placeholder="product?.current_price ? `Less than $${formatCurrency(product.current_price)}` : '0.00'"
                :disabled="!isProductValidated" />
              <span class="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            </div>
            <p class="text-xs text-text-muted mt-1">
              We'll notify you when the price drops to this amount
            </p>
            <p v-if="isProductValidated && form.target_price && targetPriceError" class="text-xs text-danger mt-1">
              {{ targetPriceError }}
            </p>
            <InputError :message="errors.target_price?.[0]" class="mt-2" />
          </div>

          <div>
            <InputLabel for="start_date" value="Start Date" />
            <TextInput id="start_date" v-model="form.start_date" type="date" class="block w-full mt-1"
              :disabled="!isProductValidated" />
            <p class="text-xs text-text-muted mt-1">
              When to begin
            </p>
            <InputError :message="errors.start_date?.[0]" class="mt-2" />
          </div>

          <div>
            <InputLabel for="end_date" value="End Date (optional)" />
            <TextInput id="end_date" v-model="form.end_date" type="date" class="block w-full mt-1"
              :min="form.start_date" :disabled="!isProductValidated" />
            <p class="text-xs text-text-muted mt-1">
              Auto-stop tracking
            </p>
            <InputError :message="errors.end_date?.[0]" class="mt-2" />
          </div>
        </div>

        <!-- Notification Preferences -->
        <div>
          <InputLabel value="Notification Preferences" class="mb-3" />
          <div class="space-y-3">
            <label :class="[
              'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
              !isProductValidated ? 'cursor-not-allowed' : 'cursor-pointer',
              form.notification_email && isProductValidated
                ? 'border-accent bg-accent/5'
                : 'border-border hover:bg-tan-light hover:border-tan-dark'
            ]">
              <Checkbox v-model:checked="form.notification_email" :disabled="!isProductValidated" />
              <EnvelopeIcon class="h-5 w-5 text-text-muted" />
              <div>
                <span class="font-medium text-primary">Email</span>
                <p class="text-xs text-text-muted">Receive price drop alerts via email</p>
              </div>
            </label>

            <label :class="[
              'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
              !isProductValidated || !hasActiveDevices ? 'cursor-not-allowed' : 'cursor-pointer',
              !hasActiveDevices ? 'opacity-60' : '',
              form.notification_push && isProductValidated && hasActiveDevices
                ? 'border-accent bg-accent/5'
                : 'border-border hover:bg-tan-light hover:border-tan-dark'
            ]">
              <Checkbox v-model:checked="form.notification_push" :disabled="!isProductValidated || !hasActiveDevices" />
              <DevicePhoneMobileIcon class="h-5 w-5 text-text-muted" />
              <div class="flex-1">
                <span class="font-medium text-primary">Push Notification</span>
                <p v-if="hasActiveDevices" class="text-xs text-text-muted">Receive instant alerts on your device</p>
                <p v-else class="text-xs text-warning">No devices registered. Use the mobile app to enable push notifications.</p>
              </div>
            </label>
          </div>
          <p v-if="isProductValidated && !hasNotificationMethod" class="text-xs text-danger mt-2">
            Please select at least one notification method
          </p>
          <InputError :message="errors.notification_method?.[0]" class="mt-2" />
        </div>
      </Card>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <RouterLink to="/watch">
          <button type="button"
            class="bg-background hover:bg-tan text-text-muted px-6 py-3 rounded-lg font-medium transition-colors">
            Cancel
          </button>
        </RouterLink>
        <PrimaryButton @click="submitForm" :disabled="loading || !isFormValid">
          <BellIcon v-if="!loading" class="h-5 w-5 mr-2" />
          {{ loading ? 'Creating...' : 'Start Tracking' }}
        </PrimaryButton>
      </div>
    </div>
  </main>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
