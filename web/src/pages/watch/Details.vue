<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  ArrowPathIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChevronLeftIcon,
  BugAntIcon,
  BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime, formatDateTime } from '@/utils/time'
import { watchApi, watchDebugApi, type TrackedProduct, type NotificationMethod, type DebugInfo } from '@/api/watch'
import { devicesApi } from '@/api/devices'
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

// Debug mode state
const canDebug = ref(false)
const debugEnabled = ref(false)
const debugInfo = ref<DebugInfo | null>(null)

// Device registration status for push notifications
const hasActiveDevices = ref(false)

// Edit form state
const editForm = ref({
  target_price: '',
  notification_email: false,
  notification_push: false,
})

const loadProduct = async () => {
  try {
    const data = await watchApi.get(route.params.id as string)
    product.value = data
    // Populate edit form
    editForm.value.target_price = data.target_price?.toString() || ''
    editForm.value.notification_email = data.notification_method?.includes('email') || false
    editForm.value.notification_push = data.notification_method?.includes('push') || false
  } catch (error) {
    console.error('Error loading product:', error)
    router.push('/watch')
  } finally {
    loading.value = false
  }
}

const refreshPrice = async () => {
  if (!product.value) return

  refreshing.value = true
  debugInfo.value = null
  try {
    if (debugEnabled.value) {
      // Use separate debug endpoint
      const response = await watchDebugApi.refresh(product.value.id)
      if (response.tracked_product) {
        product.value = response.tracked_product
      }
      debugInfo.value = response.debug
    } else {
      // Use production endpoint
      const updated = await watchApi.refresh(product.value.id)
      product.value = updated
    }
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

    const updated = await watchApi.update(product.value.id, {
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
      await watchApi.delete(product.value.id)
      router.push('/watch')
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }
}

// Check if target price has been reached (current price is at or below target)
const isTargetReached = computed(() => {
  if (!product.value || !product.value.target_price || !product.value.current_price) return false
  return product.value.current_price <= product.value.target_price
})

const progressPercent = computed(() => {
  if (!product.value || !product.value.target_price || !product.value.retail_price) return 0
  const retail = product.value.retail_price
  const target = product.value.target_price
  const current = product.value.current_price

  console.log({
    retail,
    target,
    current
  })

  if (retail <= target) return 100
  if (current <= target) return 100
  const progress = ((retail - current) / (retail - target)) * 100
  return Math.min(100, Math.max(0, progress))
})

// Chart data for price history
const chartData = computed(() => {
  if (!product.value?.price_history?.length) return null

  const history = [...product.value.price_history].reverse() // Oldest first
  const prices = history.map(h => h.price)
  const minPrice = Math.min(...prices) * 0.95
  const maxPrice = Math.max(...prices) * 1.05
  const priceRange = maxPrice - minPrice || 1

  const points = history.map((entry, index) => {
    const x = (index / (history.length - 1 || 1)) * 100
    const y = 100 - ((entry.price - minPrice) / priceRange) * 100
    return { x, y, price: entry.price, date: entry.checked_at, inStock: entry.in_stock }
  })

  return { points, minPrice, maxPrice }
})

const hoveredPoint = ref<{ x: number; y: number; price: number; date: string } | null>(null)

const handlePointHover = (point: typeof hoveredPoint.value) => {
  hoveredPoint.value = point
}

const checkDebugAccess = async () => {
  canDebug.value = await watchDebugApi.canDebug()
}

onMounted(async () => {
  const [, , hasDevices] = await Promise.all([
    loadProduct(),
    checkDebugAccess(),
    devicesApi.hasActiveDevices(),
  ])
  hasActiveDevices.value = hasDevices
})
</script>

<template>
  <main class="py-6 flex-1">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Spinner size="lg" color="accent" />
      </div>

      <template v-else-if="product">
        <!-- Header -->
        <div class="mb-6">
          <RouterLink
            to="/watch"
            class="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors mb-4"
          >
            <ChevronLeftIcon class="h-4 w-4" />
            Back to Watch
          </RouterLink>

          <!-- Status Badge -->
          <div class="mb-2">
            <Badge v-if="product.is_active" variant="success">Active</Badge>
            <Badge v-else variant="neutral">Paused</Badge>
          </div>

          <!-- Product Name -->
          <h1 class="text-xl sm:text-2xl font-bold text-primary mb-2">
            {{ product.product_name || 'Pending lookup...' }}
          </h1>

          <!-- Retailer -->
          <div class="flex items-center gap-2 text-accent mb-4">
            <BuildingStorefrontIcon class="h-5 w-5" />
            <span class="font-medium sm:text-lg">{{ product.retailer?.name || 'Unknown' }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              v-if="canDebug"
              @click="debugEnabled = !debugEnabled"
              :class="[
                'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                debugEnabled
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-border hover:bg-border/80 text-text-muted'
              ]"
              title="Toggle debug mode"
            >
              <BugAntIcon class="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{{ debugEnabled ? 'Debug On' : 'Debug' }}</span>
            </button>
            <button
              @click="refreshPrice"
              :disabled="refreshing"
              class="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
            >
              <ArrowPathIcon class="h-4 w-4 sm:h-5 sm:w-5" :class="{ 'animate-spin': refreshing }" />
              <span>{{ refreshing ? 'Refreshing...' : 'Refresh Price' }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Price Progress -->
            <Card>
              <h2 class="text-lg font-bold text-primary mb-4">Price Progress</h2>

              <!-- No price yet alert -->
              <Alert v-if="!product.current_price" variant="info" class="mb-4">
                Price not yet fetched. Click "Refresh Price" to check the current price.
              </Alert>

              <template v-else>
                <!-- Timeline Bar -->
                <div class="relative mb-4">
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
                    :style="{ left: `calc(${Math.min(progressPercent, 95)}% - 40px)` }"
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
                  <span class="font-medium" :class="isTargetReached ? 'text-success' : 'text-primary'">
                    {{ isTargetReached ? 'Target reached!' : `${Math.floor(progressPercent)}% to target` }}
                  </span>
                </div>
                <div v-else class="text-center text-sm text-text-muted">
                  Last checked: {{ product.last_checked_at ? formatRelativeTime(product.last_checked_at) : 'Never' }}
                </div>
              </template>
            </Card>

            <!-- Price History Chart -->
            <Card v-if="chartData && chartData.points.length > 1">
              <h2 class="text-lg font-bold text-primary mb-4">Price History</h2>

              <!-- Tooltip -->
              <div
                v-if="hoveredPoint"
                class="absolute z-10 bg-primary text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none"
                :style="{ left: `${hoveredPoint.x}%`, top: '20px', transform: 'translateX(-50%)' }"
              >
                <div class="font-bold">${{ formatCurrency(hoveredPoint.price) }}</div>
                <div class="text-xs opacity-80">{{ formatDateTime(hoveredPoint.date) }}</div>
              </div>

              <!-- Chart -->
              <div class="relative h-48">
                <svg
                  class="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  @mouseleave="hoveredPoint = null"
                >
                  <!-- Grid lines -->
                  <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" class="text-border" stroke-width="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" class="text-border" stroke-width="0.5" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" class="text-border" stroke-width="0.5" />

                  <!-- Target price line -->
                  <line
                    v-if="product.target_price && chartData"
                    :y1="100 - ((product.target_price - chartData.minPrice) / (chartData.maxPrice - chartData.minPrice)) * 100"
                    :y2="100 - ((product.target_price - chartData.minPrice) / (chartData.maxPrice - chartData.minPrice)) * 100"
                    x1="0"
                    x2="100"
                    stroke="currentColor"
                    class="text-success"
                    stroke-width="0.5"
                    stroke-dasharray="2,2"
                  />

                  <!-- Line path -->
                  <polyline
                    :points="chartData.points.map(p => `${p.x},${p.y}`).join(' ')"
                    fill="none"
                    stroke="currentColor"
                    class="text-accent"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Area fill -->
                  <polygon
                    :points="`0,100 ${chartData.points.map(p => `${p.x},${p.y}`).join(' ')} 100,100`"
                    fill="currentColor"
                    class="text-accent/10"
                  />

                  <!-- Data points -->
                  <circle
                    v-for="(point, index) in chartData.points"
                    :key="index"
                    :cx="point.x"
                    :cy="point.y"
                    r="2"
                    fill="currentColor"
                    class="text-accent cursor-pointer hover:text-accent-dark"
                    @mouseenter="handlePointHover(point)"
                  />
                </svg>

                <!-- Y-axis labels -->
                <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-muted pr-2">
                  <span>${{ formatCurrency(chartData.maxPrice) }}</span>
                  <span>${{ formatCurrency((chartData.maxPrice + chartData.minPrice) / 2) }}</span>
                  <span>${{ formatCurrency(chartData.minPrice) }}</span>
                </div>
              </div>

              <!-- History entries -->
              <div class="mt-4 pt-4 border-t border-border space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="entry in product.price_history"
                  :key="entry.id"
                  class="flex items-center justify-between py-1.5 text-sm"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium" :class="entry.price <= (product.target_price || 0) ? 'text-success' : 'text-primary'">
                      ${{ formatCurrency(entry.price) }}
                    </span>
                    <Badge v-if="!entry.in_stock" variant="danger" size="sm">Out of stock</Badge>
                  </div>
                  <span class="text-text-muted">{{ formatDateTime(entry.checked_at) }}</span>
                </div>
              </div>
            </Card>

            <!-- Single history entry - show as simple list -->
            <Card v-else-if="product.price_history?.length === 1">
              <h2 class="text-lg font-bold text-primary mb-4">Price History</h2>
              <p class="text-text-muted text-sm mb-4">Only one price check recorded so far. More data points will show a chart.</p>
              <div class="flex items-center justify-between py-2 text-sm border-t border-border">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-primary">
                    ${{ formatCurrency(product.price_history[0].price) }}
                  </span>
                  <Badge v-if="!product.price_history[0].in_stock" variant="danger" size="sm">Out of stock</Badge>
                </div>
                <span class="text-text-muted">{{ formatDateTime(product.price_history[0].checked_at) }}</span>
              </div>
            </Card>

            <!-- No history yet -->
            <Card v-else>
              <h2 class="text-lg font-bold text-primary mb-4">Price History</h2>
              <p class="text-text-muted text-sm">No price history yet. Prices will be tracked over time.</p>
            </Card>

            <!-- Debug Info Panel -->
            <Card v-if="debugEnabled && debugInfo" class="border-amber-500/30">
              <div class="flex items-center gap-2 mb-4">
                <BugAntIcon class="h-5 w-5 text-amber-500" />
                <h2 class="text-lg font-bold text-amber-500">Debug Information</h2>
              </div>

              <!-- Raw API Response -->
              <div v-if="debugInfo.raw_api_response" class="mb-6">
                <h3 class="text-sm font-semibold text-primary mb-2">Raw API Response</h3>
                <div class="text-xs text-text-muted mb-2">
                  <span class="font-medium">Retailer:</span> {{ debugInfo.raw_api_response.retailer }}
                </div>
                <div class="text-xs text-text-muted mb-2">
                  <span class="font-medium">Endpoint:</span> {{ debugInfo.raw_api_response.endpoint }}
                </div>
                <pre class="bg-surface-dark p-4 rounded-lg overflow-x-auto text-xs text-text-muted max-h-96 overflow-y-auto">{{ JSON.stringify(debugInfo.raw_api_response.response, null, 2) }}</pre>
              </div>

              <!-- Parsed Data -->
              <div class="mb-6">
                <h3 class="text-sm font-semibold text-primary mb-2">Parsed Data</h3>
                <pre class="bg-surface-dark p-4 rounded-lg overflow-x-auto text-xs text-text-muted max-h-64 overflow-y-auto">{{ JSON.stringify(debugInfo.parsed_data, null, 2) }}</pre>
              </div>

              <!-- Saved to DB -->
              <div v-if="debugInfo.saved_to_db">
                <h3 class="text-sm font-semibold text-primary mb-2">Saved to Database</h3>
                <pre class="bg-surface-dark p-4 rounded-lg overflow-x-auto text-xs text-text-muted max-h-64 overflow-y-auto">{{ JSON.stringify(debugInfo.saved_to_db, null, 2) }}</pre>
              </div>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Edit Settings -->
            <Card>
              <h2 class="text-lg font-bold text-primary mb-4">Edit Settings</h2>
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
                  <p class="text-xs text-text-muted mt-1">We'll notify you when the price drops to this amount</p>
                </div>

                <div>
                  <InputLabel value="Notifications" class="mb-3" />
                  <div class="space-y-3">
                    <label
                      :class="[
                        'flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                        editForm.notification_email
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/30'
                      ]"
                    >
                      <Checkbox v-model:checked="editForm.notification_email" />
                      <EnvelopeIcon class="h-5 w-5 text-text-muted" />
                      <div>
                        <span class="font-medium text-primary">Email</span>
                        <p class="text-xs text-text-muted">Receive alerts via email</p>
                      </div>
                    </label>

                    <label
                      :class="[
                        'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                        !hasActiveDevices ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                        editForm.notification_push && hasActiveDevices
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/30'
                      ]"
                    >
                      <Checkbox v-model:checked="editForm.notification_push" :disabled="!hasActiveDevices" />
                      <DevicePhoneMobileIcon class="h-5 w-5 text-text-muted" />
                      <div class="flex-1">
                        <span class="font-medium text-primary">Push Notification</span>
                        <p v-if="hasActiveDevices" class="text-xs text-text-muted">Instant alerts on your device</p>
                        <p v-else class="text-xs text-warning">No devices registered. Use the mobile app to enable push notifications.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <PrimaryButton @click="saveSettings" :disabled="saving" class="w-full">
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </PrimaryButton>
              </div>
            </Card>

            <!-- Product Details -->
            <Card>
              <h2 class="text-lg font-bold text-primary mb-3">Product Details</h2>
              <dl class="text-sm space-y-3">
                <div class="flex justify-between items-center">
                  <dt class="text-text-muted">Retailer</dt>
                  <dd class="flex items-center gap-2 text-primary font-medium">
                    <BuildingStorefrontIcon class="h-4 w-4 text-accent" />
                    {{ product.retailer?.name || 'Unknown' }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-text-muted">SKU/UPC</dt>
                  <dd class="font-mono text-primary">{{ product.sku_upc }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-text-muted">Tracking since</dt>
                  <dd class="text-primary">{{ formatDateTime(product.created_at) }}</dd>
                </div>
                <div v-if="product.product_variant" class="flex justify-between">
                  <dt class="text-text-muted">Variant</dt>
                  <dd class="text-primary">{{ product.product_variant }}</dd>
                </div>
              </dl>
            </Card>

            <!-- Danger Zone -->
            <Card class="border-danger/30">
              <h2 class="text-sm font-bold text-danger mb-2">Stop Tracking</h2>
              <p class="text-xs text-text-muted mb-3">
                Remove this product from your tracking list. This action cannot be undone.
              </p>
              <button
                @click="deleteProduct"
                class="w-full bg-danger hover:bg-danger/80 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
              >
                Stop Tracking
              </button>
            </Card>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
