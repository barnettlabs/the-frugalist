<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import { watchApi, RETAILERS, type NotificationMethod, type ValidateProductResponse } from '@/api/watch'
import { formatCurrency } from '@/utils/formatters'
import {
  BuildingStorefrontIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()

const form = ref({
  retailer_id: 0,
  sku_upc: '',
  target_price: '',
  notification_email: true,
  notification_push: false,
})

const loading = ref(false)
const validating = ref(false)
const validatedProduct = ref<ValidateProductResponse | null>(null)
const validationError = ref('')
const errors = ref<Record<string, string[]>>({})

// Track the last validated SKU to avoid re-validating the same value
const lastValidatedSku = ref('')

const selectedRetailer = computed(() => {
  return RETAILERS.find(r => r.id === form.value.retailer_id)
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
const isProductValidated = computed(() => validatedProduct.value?.valid === true)
const hasNotificationMethod = computed(() => notificationMethods.value.length > 0)

const isFormValid = computed(() => {
  return isStoreSelected.value &&
    isSkuEntered.value &&
    isProductValidated.value &&
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

  try {
    const result = await watchApi.validateProduct(form.value.retailer_id, sku)
    lastValidatedSku.value = sku

    if (result.valid) {
      validatedProduct.value = result
    } else {
      validationError.value = result.error || 'Product not found. Please check the SKU/UPC and try again.'
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
    await watchApi.create({
      retailer_id: form.value.retailer_id,
      sku_upc: form.value.sku_upc.trim(),
      target_price: form.value.target_price ? parseFloat(form.value.target_price) : undefined,
      notification_method: notificationMethods.value,
    })
    router.push('/watch')
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
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <PageHeader
        title="Track New Product"
        description="Set up price tracking for a product"
        back-link="/watch"
        back-label="Watch"
      />

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

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            v-for="retailer in RETAILERS"
            :key="retailer.id"
            type="button"
            @click="retailer.status === 'active' ? form.retailer_id = retailer.id : null"
            :disabled="retailer.status !== 'active'"
            :class="[
              'relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
              retailer.status !== 'active'
                ? 'border-border bg-background cursor-not-allowed opacity-60'
                : form.retailer_id === retailer.id
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border hover:border-accent/30 text-text-muted hover:bg-background cursor-pointer'
            ]"
          >
            <BuildingStorefrontIcon class="h-6 w-6 mb-2" />
            <span class="text-sm font-medium text-center">{{ retailer.name }}</span>
            <!-- Coming Soon Badge -->
            <Badge
              v-if="retailer.status !== 'active'"
              variant="neutral"
              size="sm"
              class="absolute -top-2 -right-2"
            >
              Soon
            </Badge>
            <!-- Selected Checkmark -->
            <div
              v-if="form.retailer_id === retailer.id"
              class="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center"
            >
              <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
        <InputError :message="errors.retailer_id?.[0]" class="mt-2" />
      </Card>

      <!-- Step 2: SKU/UPC Input -->
      <Card
        class="mb-4 transition-opacity duration-200"
        :class="{ 'opacity-50 pointer-events-none': !isStoreSelected }"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            :class="[
              'flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
              isStoreSelected ? 'bg-accent text-white' : 'bg-border text-text-muted'
            ]"
          >
            2
          </div>
          <h3 :class="['text-lg font-bold', isStoreSelected ? 'text-primary' : 'text-text-muted']">
            Enter Product Identifier
          </h3>
          <CheckCircleIcon v-if="isProductValidated" class="h-5 w-5 text-success ml-auto" />
        </div>

        <div>
          <InputLabel for="sku_upc" value="SKU / UPC / Item Number" />
          <div class="relative mt-1">
            <TextInput
              id="sku_upc"
              v-model="form.sku_upc"
              type="text"
              class="block w-full pr-10"
              :placeholder="skuPlaceholder"
              :disabled="!isStoreSelected"
              @blur="validateProduct"
              @keyup.enter="validateProduct"
            />
            <div v-if="validating" class="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" color="primary" />
            </div>
          </div>
          <p class="text-xs text-text-muted mt-1">
            Find this on the product page or product packaging
          </p>
          <InputError :message="errors.sku_upc?.[0]" class="mt-2" />
        </div>

        <!-- Validation Error -->
        <Alert v-if="validationError" variant="danger" class="mt-4">
          <div class="flex items-center gap-2">
            <XCircleIcon class="h-5 w-5 flex-shrink-0" />
            <span>{{ validationError }}</span>
          </div>
        </Alert>

        <!-- Product Preview -->
        <div v-if="isProductValidated && validatedProduct" class="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg">
          <div class="flex items-start gap-4">
            <!-- Product Image -->
            <div v-if="validatedProduct.product_image_url" class="flex-shrink-0">
              <img
                :src="validatedProduct.product_image_url"
                :alt="validatedProduct.product_name"
                class="w-20 h-20 object-contain rounded-lg bg-surface border border-border"
              />
            </div>
            <div v-else class="flex-shrink-0 w-20 h-20 bg-background rounded-lg flex items-center justify-center">
              <BuildingStorefrontIcon class="h-8 w-8 text-text-muted" />
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <CheckCircleIcon class="h-5 w-5 text-success flex-shrink-0" />
                <span class="text-sm font-medium text-success">Product Found</span>
              </div>
              <h4 class="font-bold text-primary line-clamp-2">{{ validatedProduct.product_name }}</h4>
              <p v-if="validatedProduct.product_description" class="text-sm text-text-muted mt-1 line-clamp-2">
                {{ validatedProduct.product_description }}
              </p>
              <div class="flex items-center gap-4 mt-2">
                <div v-if="validatedProduct.current_price">
                  <span class="text-xs text-text-muted">Current Price</span>
                  <p class="text-lg font-bold text-success">${{ formatCurrency(validatedProduct.current_price) }}</p>
                </div>
                <div v-if="validatedProduct.retail_price && validatedProduct.retail_price !== validatedProduct.current_price">
                  <span class="text-xs text-text-muted">Retail Price</span>
                  <p class="text-lg font-medium text-text-muted line-through">${{ formatCurrency(validatedProduct.retail_price) }}</p>
                </div>
                <Badge v-if="validatedProduct.in_stock === false" variant="danger" size="sm">Out of Stock</Badge>
                <Badge v-else-if="validatedProduct.in_stock === true" variant="success" size="sm">In Stock</Badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div v-if="isStoreSelected && !isProductValidated && !validating" class="mt-4 p-3 bg-background rounded-lg">
          <p class="text-xs text-text-muted">
            <strong>Tip:</strong>
            <template v-if="selectedRetailer?.slug === 'bestbuy'"> Look for "SKU" on the Best Buy product page.</template>
            <template v-else-if="selectedRetailer?.slug === 'homedepot'"> Look for "Internet #" or "Store SKU" on the Home Depot product page.</template>
            <template v-else-if="selectedRetailer?.slug === 'lowes'"> Look for "Item #" on the Lowe's product page.</template>
            <template v-else-if="selectedRetailer?.slug === 'amazon'"> Use the ASIN from the Amazon product URL (e.g., B08N5WRWNW).</template>
            <template v-else-if="selectedRetailer?.slug === 'walmart'"> Look for "Item ID" or use the number from the Walmart product URL.</template>
            <template v-else-if="selectedRetailer?.slug === 'target'"> Look for "TCIN" on the Target product page.</template>
            <template v-else> Enter the product's SKU, UPC, or item number.</template>
          </p>
        </div>
      </Card>

      <!-- Step 3: Tracking Settings -->
      <Card
        class="mb-4 transition-opacity duration-200"
        :class="{ 'opacity-50 pointer-events-none': !isProductValidated }"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            :class="[
              'flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
              isProductValidated ? 'bg-accent text-white' : 'bg-border text-text-muted'
            ]"
          >
            3
          </div>
          <h3 :class="['text-lg font-bold', isProductValidated ? 'text-primary' : 'text-text-muted']">
            Tracking Settings
          </h3>
          <CheckCircleIcon v-if="hasNotificationMethod" class="h-5 w-5 text-success ml-auto" />
        </div>

        <!-- Target Price -->
        <div class="mb-6">
          <InputLabel for="target_price" value="Target Price (optional)" />
          <div class="relative mt-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <TextInput
              id="target_price"
              v-model="form.target_price"
              type="number"
              step="0.01"
              min="0"
              class="block w-full pl-7"
              placeholder="0.00"
              :disabled="!isProductValidated"
            />
          </div>
          <p class="text-xs text-text-muted mt-1">
            Get notified when the price drops to or below this amount
          </p>
          <InputError :message="errors.target_price?.[0]" class="mt-2" />
        </div>

        <!-- Notification Preferences -->
        <div>
          <InputLabel value="Notification Preferences" class="mb-3" />
          <div class="space-y-3">
            <label
              :class="[
                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                !isProductValidated ? 'cursor-not-allowed' : 'cursor-pointer',
                form.notification_email && isProductValidated
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/30'
              ]"
            >
              <Checkbox v-model:checked="form.notification_email" :disabled="!isProductValidated" />
              <EnvelopeIcon class="h-5 w-5 text-text-muted" />
              <div>
                <span class="font-medium text-primary">Email</span>
                <p class="text-xs text-text-muted">Receive price drop alerts via email</p>
              </div>
            </label>

            <label
              :class="[
                'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                !isProductValidated ? 'cursor-not-allowed' : 'cursor-pointer',
                form.notification_push && isProductValidated
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/30'
              ]"
            >
              <Checkbox v-model:checked="form.notification_push" :disabled="!isProductValidated" />
              <DevicePhoneMobileIcon class="h-5 w-5 text-text-muted" />
              <div>
                <span class="font-medium text-primary">Push Notification</span>
                <p class="text-xs text-text-muted">Receive instant alerts on your device</p>
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
          <button
            type="button"
            class="bg-background hover:bg-border text-text-muted px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </RouterLink>
        <PrimaryButton
          @click="submitForm"
          :disabled="loading || !isFormValid"
        >
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
</style>
