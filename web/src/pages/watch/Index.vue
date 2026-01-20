<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Card from '@/components/Card.vue'
import Badge from '@/components/Badge.vue'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { TagIcon, PlusIcon, TrashIcon, EyeIcon, ArrowPathIcon, EnvelopeIcon, DevicePhoneMobileIcon, BellAlertIcon, PauseIcon, PlayIcon } from '@heroicons/vue/24/outline'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime } from '@/utils/time'
import { watchApi, type TrackedProduct } from '@/api/watch'

type FilterType = 'all' | 'active' | 'paused'

const products = ref<TrackedProduct[]>([])
const loading = ref(true)
const refreshingId = ref<number | null>(null)
const activeFilter = ref<FilterType>('all')

// Confirmation dialog state
const showDeleteDialog = ref(false)
const showPauseDialog = ref(false)
const selectedProduct = ref<TrackedProduct | null>(null)
const actionLoading = ref(false)

const filteredProducts = computed(() => {
  if (activeFilter.value === 'all') return products.value
  if (activeFilter.value === 'active') return products.value.filter(p => p.is_active)
  return products.value.filter(p => !p.is_active)
})

const filterCounts = computed(() => ({
  all: products.value.length,
  active: products.value.filter(p => p.is_active).length,
  paused: products.value.filter(p => !p.is_active).length,
}))

const fetchProducts = async () => {
  try {
    const data = await watchApi.getAll()
    products.value = data
  } catch (error) {
    console.error('Error fetching tracked products:', error)
  } finally {
    loading.value = false
  }
}

const openDeleteDialog = (product: TrackedProduct) => {
  selectedProduct.value = product
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedProduct.value) return
  actionLoading.value = true
  try {
    await watchApi.delete(selectedProduct.value.id)
    await fetchProducts()
    showDeleteDialog.value = false
    selectedProduct.value = null
  } catch (error) {
    console.error('Error deleting product:', error)
  } finally {
    actionLoading.value = false
  }
}

const openPauseDialog = (product: TrackedProduct) => {
  selectedProduct.value = product
  showPauseDialog.value = true
}

const confirmTogglePause = async () => {
  if (!selectedProduct.value) return
  actionLoading.value = true
  try {
    await watchApi.update(selectedProduct.value.id, {
      is_active: !selectedProduct.value.is_active
    })
    await fetchProducts()
    showPauseDialog.value = false
    selectedProduct.value = null
  } catch (error) {
    console.error('Error toggling pause:', error)
  } finally {
    actionLoading.value = false
  }
}

const refreshProduct = async (id: number) => {
  refreshingId.value = id
  try {
    await watchApi.refresh(id)
    await fetchProducts()
  } catch (error) {
    console.error('Error refreshing product:', error)
  } finally {
    refreshingId.value = null
  }
}

const getRetailerName = (product: TrackedProduct): string => {
  return product.retailer?.name || 'Unknown'
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <header class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-blue-900"></div>
      <div class="dotted-background relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="max-w-2xl">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-white/20 rounded-lg mr-3">
                <BellAlertIcon class="h-6 w-6 text-white" />
              </div>
              <span class="text-white/70 text-sm font-medium">Watch</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-medium text-white mb-4 tracking-tight">
              Track prices, buy smarter
            </h1>
            <p class="text-lg text-white/80 leading-relaxed">
              Monitor product prices and get notified when they drop. Know the right time to buy
              instead of guessing.
            </p>
          </div>
          <div class="flex-shrink-0">
            <RouterLink to="/watch/create">
              <button class="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 border border-white/20">
                <PlusIcon class="h-5 w-5" />
                <span>Track New Product</span>
              </button>
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <main class="py-8 lg:py-12 flex-1">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">

      <!-- Quick Filters -->
      <div v-if="!loading && products.length" class="flex items-center gap-2 mb-6">
        <button
          v-for="filter in (['all', 'active', 'paused'] as FilterType[])"
          :key="filter"
          @click="activeFilter = filter"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeFilter === filter
              ? 'bg-accent text-white'
              : 'bg-surface text-text-muted hover:bg-background'
          ]"
        >
          {{ filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Paused' }}
          <span class="ml-1.5 text-xs opacity-75">({{ filterCounts[filter] }})</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <Spinner size="lg" color="accent" />
      </div>

      <!-- Empty State -->
      <Card v-else-if="!products.length" class="text-center" padding="lg">
        <div class="p-4 rounded-xl bg-accent/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TagIcon class="h-8 w-8 text-accent-dark" />
        </div>
        <h3 class="text-lg font-medium text-primary mb-2">No products being tracked</h3>
        <p class="text-text-muted mb-6">Track product prices to understand price movement before you buy</p>
        <RouterLink to="/watch/create">
          <button class="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 mx-auto">
            <PlusIcon class="h-5 w-5" />
            <span>Track First Product</span>
          </button>
        </RouterLink>
      </Card>

      <!-- Empty Filter State -->
      <Card v-else-if="products.length && !filteredProducts.length" class="text-center" padding="lg">
        <p class="text-text-muted">
          No {{ activeFilter === 'active' ? 'active' : 'paused' }} products.
          <button @click="activeFilter = 'all'" class="text-accent hover:underline">View all</button>
        </p>
      </Card>

      <!-- Products List -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="product in filteredProducts"
          :key="product.id"
          variant="interactive"
          padding="none"
          class="overflow-hidden"
        >
          <!-- Product Header -->
          <div class="p-4 border-b border-border">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-primary truncate">
                  {{ product.product_name || 'Pending lookup...' }}
                </h3>
                <p class="text-xs text-text-muted mt-0.5">
                  {{ getRetailerName(product) }} &middot; {{ product.sku_upc }}
                </p>
              </div>
              <Badge v-if="product.is_active" variant="success" size="sm">Active</Badge>
              <Badge v-else variant="neutral" size="sm">Paused</Badge>
            </div>

            <!-- Notification Methods -->
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs text-text-muted">Alerts:</span>
              <div class="flex items-center gap-1">
                <EnvelopeIcon
                  v-if="product.notification_method?.includes('email')"
                  class="h-4 w-4 text-accent"
                  title="Email notifications"
                />
                <DevicePhoneMobileIcon
                  v-if="product.notification_method?.includes('push')"
                  class="h-4 w-4 text-accent"
                  title="Push notifications"
                />
              </div>
            </div>
          </div>

          <!-- Price Info -->
          <div class="bg-background p-4">
            <div class="flex items-center justify-between">
              <span class="text-text-muted text-sm">Current Price</span>
              <span class="font-medium text-xl text-success">
                {{ product.current_price ? `$${formatCurrency(product.current_price)}` : '—' }}
              </span>
            </div>
            <div v-if="product.target_price" class="flex items-center justify-between mt-2">
              <span class="text-text-muted text-sm">Target Price</span>
              <span class="font-medium text-primary">${{ formatCurrency(product.target_price) }}</span>
            </div>
            <div v-if="product.last_checked_at" class="text-xs text-text-muted mt-2 text-right">
              Last checked {{ formatRelativeTime(product.last_checked_at) }}
            </div>
            <div v-else class="text-xs text-text-muted mt-2 text-right">
              Not yet checked
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-4 gap-px bg-border border-t border-border">
            <RouterLink :to="`/watch/${product.id}`" class="block">
              <button class="w-full bg-surface hover:bg-background text-text-muted px-2 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
                <EyeIcon class="h-4 w-4" />
                <span>Details</span>
              </button>
            </RouterLink>
            <button
              @click="refreshProduct(product.id)"
              :disabled="refreshingId === product.id"
              class="w-full bg-surface hover:bg-background text-text-muted px-2 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon :class="['h-4 w-4', refreshingId === product.id && 'animate-spin']" />
              <span>{{ refreshingId === product.id ? '...' : 'Refresh' }}</span>
            </button>
            <button
              @click="openPauseDialog(product)"
              class="w-full bg-surface hover:bg-background text-text-muted px-2 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <PlayIcon v-if="!product.is_active" class="h-4 w-4" />
              <PauseIcon v-else class="h-4 w-4" />
              <span>{{ product.is_active ? 'Pause' : 'Resume' }}</span>
            </button>
            <button
              @click="openDeleteDialog(product)"
              class="w-full bg-surface hover:bg-danger text-danger hover:text-white px-2 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <TrashIcon class="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </Card>

        <!-- Add New Card -->
        <RouterLink to="/watch/create">
          <Card variant="interactive" class="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-accent/30 hover:border-accent bg-transparent" padding="lg">
            <div class="p-3 rounded-xl bg-accent/10 w-fit mx-auto mb-4">
              <PlusIcon class="h-8 w-8 text-accent-dark" />
            </div>
            <h3 class="text-lg font-medium text-primary mb-2">Track New Product</h3>
            <p class="text-text-muted text-sm">Add a product to monitor its price</p>
          </Card>
        </RouterLink>
      </div>
      </div>
    </main>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Tracker"
      :message="`Are you sure you want to stop tracking '${selectedProduct?.product_name || 'this product'}'? This action cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      :loading="actionLoading"
      @confirm="confirmDelete"
      @close="showDeleteDialog = false"
    />

    <!-- Pause/Resume Confirmation Dialog -->
    <ConfirmDialog
      :show="showPauseDialog"
      :title="selectedProduct?.is_active ? 'Pause Tracking' : 'Resume Tracking'"
      :message="selectedProduct?.is_active
        ? `Are you sure you want to pause tracking for '${selectedProduct?.product_name || 'this product'}'? You won't receive price alerts while paused.`
        : `Are you sure you want to resume tracking for '${selectedProduct?.product_name || 'this product'}'? You'll start receiving price alerts again.`"
      :confirm-text="selectedProduct?.is_active ? 'Pause' : 'Resume'"
      variant="primary"
      :loading="actionLoading"
      @confirm="confirmTogglePause"
      @close="showPauseDialog = false"
    />
  </div>
</template>
