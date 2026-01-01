<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowPathIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime, formatDateTime } from '@/utils/time'
import { priceTrackerApi, RETAILERS, type TrackedProduct, type NotificationMethod } from '@/api/price-tracker'
import Card from '@/components/Card.vue'
import Badge from '@/components/Badge.vue'
import Spinner from '@/components/Spinner.vue'
import Alert from '@/components/Alert.vue'
import Checkbox from '@/components/Checkbox.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'

const route = useRoute()
const router = useRouter()

const product = ref<TrackedProduct | null>(null)
const loading = ref(true)
const refreshing = ref(false)
const saving = ref(false)

// Edit form state
const editForm = ref({
  target_price: '',
  notification_email: false,
  notification_push: false,
})

const loadProduct = async () => {
  try {
    const data = await priceTrackerApi.get(route.params.id as string)
    product.value = data
    // Populate edit form
    editForm.value.target_price = data.target_price?.toString() || ''
    editForm.value.notification_email = data.notification_method?.includes('email') || false
    editForm.value.notification_push = data.notification_method?.includes('push') || false
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

const saveSettings = async () => {
  if (!product.value) return

  saving.value = true
  try {
    const notificationMethods: NotificationMethod[] = []
    if (editForm.value.notification_email) notificationMethods.push('email')
    if (editForm.value.notification_push) notificationMethods.push('push')

    const updated = await priceTrackerApi.update(product.value.id, {
      target_price: editForm.value.target_price ? parseFloat(editForm.value.target_price) : undefined,
      notification_method: notificationMethods,
    })
    product.value = updated
  } catch (error) {
    console.error('Error updating product:', error)
  } finally {
    saving.value = false
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

const getRetailerName = (prod: TrackedProduct): string => {
  if (prod.retailer?.name) return prod.retailer.name
  const retailer = RETAILERS.find(r => r.id === prod.retailer_id)
  return retailer?.name || 'Unknown'
}

const progressPercent = computed(() => {
  if (!product.value || !product.value.target_price || !product.value.retail_price) return 0
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
        <Spinner size="lg" color="accent" />
      </div>

      <template v-else-if="product">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-3xl font-bold text-primary">
                  {{ product.product_name || 'Pending lookup...' }}
                </h1>
                <Badge v-if="product.is_active" variant="success">Active</Badge>
                <Badge v-else variant="neutral">Paused</Badge>
              </div>
              <p class="text-text-muted">
                {{ getRetailerName(product) }} &middot; {{ product.sku_upc }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-sm text-text-muted">Alerts:</span>
                <EnvelopeIcon
                  v-if="product.notification_method?.includes('email')"
                  class="h-5 w-5 text-accent"
                  title="Email notifications enabled"
                />
                <DevicePhoneMobileIcon
                  v-if="product.notification_method?.includes('push')"
                  class="h-5 w-5 text-accent"
                  title="Push notifications enabled"
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <RouterLink to="/price-tracker">
                <button class="bg-background hover:bg-border text-text-muted px-6 py-3 rounded-lg font-medium transition-all">
                  Back to List
                </button>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Price Timeline -->
        <Card class="mb-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-primary">Price Progress</h2>
            <button
              @click="refreshPrice"
              :disabled="refreshing"
              class="flex items-center gap-2 text-accent hover:text-accent-dark font-medium disabled:opacity-50"
            >
              <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': refreshing }" />
              <span>{{ refreshing ? 'Refreshing...' : 'Refresh Price' }}</span>
            </button>
          </div>

          <!-- No price yet alert -->
          <Alert v-if="!product.current_price" variant="info" class="mb-6">
            Price not yet fetched. Click "Refresh Price" to check the current price.
          </Alert>

          <template v-else>
            <!-- Timeline Bar -->
            <div class="relative mb-6">
              <!-- Labels above bar -->
              <div class="flex justify-between mb-2">
                <div class="text-left">
                  <span class="text-xs text-text-muted block">Retail</span>
                  <span class="text-lg font-semibold text-text-muted">
                    {{ product.retail_price ? `$${formatCurrency(product.retail_price)}` : '—' }}
                  </span>
                </div>
                <div class="text-center" v-if="product.target_price">
                  <span class="text-xs text-text-muted block">Target</span>
                  <span class="text-lg font-semibold text-success">${{ formatCurrency(product.target_price) }}</span>
                </div>
              </div>

              <!-- Progress bar -->
              <div v-if="product.target_price && product.retail_price" class="relative h-4 bg-border rounded-full overflow-hidden">
                <div
                  class="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-500"
                  :style="{ width: progressPercent + '%' }"
                ></div>
              </div>

              <!-- Current price indicator -->
              <div
                v-if="product.target_price && product.retail_price"
                class="absolute -bottom-8 transition-all duration-500"
                :style="{ left: `calc(${progressPercent}% - 40px)` }"
              >
                <div class="bg-primary text-white px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap">
                  ${{ formatCurrency(product.current_price) }}
                </div>
              </div>

              <!-- Simple current price display when no target -->
              <div v-else class="text-center py-4">
                <span class="text-xs text-text-muted block">Current Price</span>
                <span class="text-3xl font-bold text-success">${{ formatCurrency(product.current_price) }}</span>
              </div>
            </div>

            <div v-if="product.target_price && product.retail_price" class="mt-12 flex items-center justify-between text-sm text-text-muted">
              <span>Last checked: {{ product.last_checked_at ? formatRelativeTime(product.last_checked_at) : 'Never' }}</span>
              <span class="font-medium" :class="progressPercent >= 100 ? 'text-success' : 'text-primary'">
                {{ progressPercent >= 100 ? 'Target reached!' : `${progressPercent.toFixed(0)}% to target` }}
              </span>
            </div>
            <div v-else class="text-center text-sm text-text-muted">
              Last checked: {{ product.last_checked_at ? formatRelativeTime(product.last_checked_at) : 'Never' }}
            </div>
          </template>
        </Card>

        <!-- Price History -->
        <Card v-if="product.price_history && product.price_history.length > 0" class="mb-6">
          <h2 class="text-lg font-bold text-primary mb-4">Price History</h2>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div
              v-for="entry in product.price_history"
              :key="entry.id"
              class="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg font-semibold" :class="entry.price <= (product.target_price || 0) ? 'text-success' : 'text-primary'">
                  ${{ formatCurrency(entry.price) }}
                </span>
                <Badge v-if="!entry.in_stock" variant="danger" size="sm">Out of stock</Badge>
              </div>
              <span class="text-sm text-text-muted">{{ formatDateTime(entry.checked_at) }}</span>
            </div>
          </div>
        </Card>

        <!-- Edit Settings -->
        <Card class="mb-6">
          <h2 class="text-lg font-bold text-primary mb-4">Tracking Settings</h2>
          <div class="space-y-4">
            <div>
              <InputLabel for="target_price" value="Target Price" />
              <div class="relative mt-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                <TextInput
                  id="target_price"
                  v-model="editForm.target_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full pl-7"
                  placeholder="0.00"
                />
              </div>
              <p class="text-xs text-text-muted mt-1">Get notified when the price drops to or below this amount</p>
            </div>

            <div>
              <InputLabel value="Notification Preferences" class="mb-3" />
              <div class="space-y-3">
                <label class="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-background">
                  <Checkbox v-model:checked="editForm.notification_email" />
                  <EnvelopeIcon class="h-5 w-5 text-text-muted" />
                  <span class="text-sm text-primary">Email notifications</span>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-background">
                  <Checkbox v-model:checked="editForm.notification_push" />
                  <DevicePhoneMobileIcon class="h-5 w-5 text-text-muted" />
                  <span class="text-sm text-primary">Push notifications</span>
                </label>
              </div>
            </div>

            <div class="pt-4">
              <PrimaryButton @click="saveSettings" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Settings' }}
              </PrimaryButton>
            </div>
          </div>
        </Card>

        <!-- Product Info -->
        <Card class="mb-6" padding="sm">
          <h2 class="text-sm font-bold text-primary mb-2">Product Details</h2>
          <dl class="text-sm space-y-1">
            <div class="flex justify-between">
              <dt class="text-text-muted">SKU/UPC:</dt>
              <dd class="font-mono text-primary">{{ product.sku_upc }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-text-muted">Retailer:</dt>
              <dd class="text-primary">{{ getRetailerName(product) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-text-muted">Tracking since:</dt>
              <dd class="text-primary">{{ formatDateTime(product.created_at) }}</dd>
            </div>
          </dl>
        </Card>

        <!-- Danger Zone -->
        <Card class="border-danger/30">
          <h2 class="text-lg font-bold text-danger mb-2">Stop Tracking</h2>
          <p class="text-sm text-text-muted mb-4">
            Remove this product from your tracking list. This action cannot be undone.
          </p>
          <button
            @click="deleteProduct"
            class="bg-danger hover:bg-danger/80 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Stop Tracking
          </button>
        </Card>
      </template>
    </div>
  </main>
</template>
