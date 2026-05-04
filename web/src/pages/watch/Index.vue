<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Spinner from '@/components/Spinner.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import {
  TagIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellAlertIcon,
  PauseIcon,
  PlayIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  PhotoIcon,
  ArrowUpRightIcon,
} from '@heroicons/vue/24/outline'
import CopyText from '@/components/CopyText.vue'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime } from '@/utils/time'
import { watchApi, type TrackedProduct } from '@/api/watch'

type FilterType = 'all' | 'active' | 'paused'

const products = ref<TrackedProduct[]>([])
const loading = ref(true)
const refreshingId = ref<number | null>(null)
const activeFilter = ref<FilterType>('all')

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

const targetReachedCount = computed(() =>
  products.value.filter(p => p.target_price && p.current_price && p.current_price <= p.target_price).length
)

const fetchProducts = async () => {
  try {
    products.value = await watchApi.getAll()
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
      is_active: !selectedProduct.value.is_active,
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

const getDistanceToTarget = (product: TrackedProduct) => {
  if (!product.target_price || !product.current_price) return null
  const diff = product.current_price - product.target_price
  if (diff <= 0) return { reached: true, amount: 0 }
  return { reached: false, amount: diff }
}

const getProgressPercent = (product: TrackedProduct) => {
  if (!product.target_price || !product.retail_price || !product.current_price) return 0
  const range = product.retail_price - product.target_price
  if (range <= 0) return 100
  const traveled = product.retail_price - product.current_price
  return Math.min(100, Math.max(0, (traveled / range) * 100))
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="pb-16">
    <!-- Editorial header replaces the heavy gradient block -->
    <SectionHeader
      eyebrow="Watch · Price ledger"
      title="Track movement before you buy."
      description="Drop-by-drop price history on the things you actually buy. Alerts fire only when motion makes the moment worth your attention."
      :icon="BellAlertIcon"
      :index="filterCounts.all || 0"
    >
      <template #aside>
        <div v-if="!loading && filterCounts.all" class="mt-4 grid grid-cols-2 gap-3">
          <div class="border-l border-border pl-4">
            <p class="figure text-2xl text-primary leading-none">{{ filterCounts.active }}</p>
            <p class="eyebrow mt-1.5">Active</p>
          </div>
          <div class="border-l border-signal pl-4">
            <p class="figure text-2xl text-signal-dark leading-none">{{ targetReachedCount }}</p>
            <p class="eyebrow mt-1.5">At target</p>
          </div>
        </div>
      </template>

      <template #actions>
        <RouterLink
          to="/watch/create"
          class="group inline-flex items-center gap-2 rounded-md px-4 py-2.5 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <PlusIcon class="h-4 w-4" />
          Track new product
        </RouterLink>
      </template>
    </SectionHeader>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
      <!-- Filter strip -->
      <div v-if="!loading && products.length" class="flex items-center gap-1 mb-8 border border-border rounded-md p-1 bg-surface w-fit">
        <button
          v-for="filter in (['all', 'active', 'paused'] as FilterType[])"
          :key="filter"
          @click="activeFilter = filter"
          :class="[
            'inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors',
            activeFilter === filter
              ? 'bg-primary text-surface'
              : 'text-text-muted hover:text-primary',
          ]"
        >
          <span class="eyebrow !text-[0.625rem]" :class="activeFilter === filter ? '!text-surface' : ''">
            {{ filter }}
          </span>
          <span class="numeral" :class="activeFilter === filter ? 'text-surface/80' : 'text-text-muted'">
            {{ filterCounts[filter] }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Spinner size="lg" color="accent" />
      </div>

      <!-- Empty -->
      <section v-else-if="!products.length" class="surface-ink paper-grain rounded-md border border-primary-dark/40 p-10 sm:p-14 relative overflow-hidden">
        <div class="grid grid-cols-12 gap-6 items-center relative z-10">
          <div class="col-span-12 lg:col-span-8">
            <p class="eyebrow text-white/60 mb-4">Your watchlist is empty</p>
            <h2 class="font-display font-medium text-white tracking-tightest text-3xl sm:text-4xl leading-[0.95]">
              Pick a product. <span class="italic text-signal-light">Watch it breathe.</span>
            </h2>
            <p class="mt-5 text-sm text-white/70 max-w-md">
              Drop in a SKU or product link. We&rsquo;ll log every price change and ping you when motion matters.
            </p>
          </div>
          <div class="col-span-12 lg:col-span-4 lg:text-right">
            <RouterLink
              to="/watch/create"
              class="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 bg-surface text-primary text-sm font-medium hover:bg-tan transition-colors"
            >
              <TagIcon class="h-4 w-4" />
              Track first product
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Empty filter -->
      <div v-else-if="products.length && !filteredProducts.length" class="bg-surface border border-border rounded-md p-10 text-center">
        <p class="text-text-muted text-sm">
          No {{ activeFilter === 'active' ? 'active' : 'paused' }} products.
          <button @click="activeFilter = 'all'" class="text-accent-dark hover:underline">View all</button>
        </p>
      </div>

      <!-- Cards grid -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="product in filteredProducts"
          :key="product.id"
          :to="`/watch/${product.id}`"
          class="group block"
        >
          <article class="card h-full flex flex-col overflow-hidden">
            <!-- Header strip with status + retailer + actions -->
            <div class="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
              <div class="flex items-center gap-2 min-w-0">
                <span
                  :class="[
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    product.is_active ? 'bg-success' : 'bg-text-muted',
                  ]"
                />
                <span class="eyebrow truncate">{{ getRetailerName(product) }}</span>
                <span class="inline-flex items-center gap-0.5 text-text-muted ml-1">
                  <CurrencyDollarIcon v-if="product.watch_type === 'price' || !product.watch_type" class="h-3 w-3" />
                  <ArchiveBoxIcon v-if="product.watch_type === 'stock' || product.watch_type === 'both'" class="h-3 w-3" />
                </span>
              </div>
              <div class="flex items-center gap-0.5 flex-shrink-0" @click.prevent>
                <button
                  @click="refreshProduct(product.id)"
                  :disabled="refreshingId === product.id"
                  class="p-1.5 rounded text-text-muted hover:text-primary hover:bg-surface-dark transition-colors disabled:opacity-50"
                  title="Refresh price"
                >
                  <ArrowPathIcon :class="['h-3.5 w-3.5', refreshingId === product.id && 'animate-spin']" />
                </button>
                <button
                  @click="openPauseDialog(product)"
                  class="p-1.5 rounded text-text-muted hover:text-primary hover:bg-surface-dark transition-colors"
                  :title="product.is_active ? 'Pause tracking' : 'Resume tracking'"
                >
                  <PlayIcon v-if="!product.is_active" class="h-3.5 w-3.5" />
                  <PauseIcon v-else class="h-3.5 w-3.5" />
                </button>
                <button
                  @click="openDeleteDialog(product)"
                  class="p-1.5 rounded text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Delete tracker"
                >
                  <TrashIcon class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <!-- Body: image anchor + content -->
            <div class="flex gap-4 p-4">
              <!-- Image anchor -->
              <div class="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-surface-dark border border-border flex items-center justify-center relative">
                <img
                  v-if="product.product_image_url"
                  :src="product.product_image_url"
                  :alt="product.product_name || 'Product image'"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <PhotoIcon v-else class="h-8 w-8 text-text-muted/40" />

                <!-- Target reached badge -->
                <span v-if="getDistanceToTarget(product)?.reached"
                  class="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-signal text-white shadow-soft">
                  <ArrowUpRightIcon class="h-3 w-3 -rotate-90" />
                </span>
              </div>

              <!-- Title + price -->
              <div class="flex-1 min-w-0 flex flex-col">
                <h3 class="font-display text-[1.0625rem] text-primary tracking-tight leading-snug line-clamp-2 group-hover:text-accent-dark transition-colors">
                  {{ product.product_name || 'Pending lookup…' }}
                </h3>

                <div class="mt-auto pt-3 flex items-baseline gap-2">
                  <span class="figure text-2xl text-primary leading-none">
                    {{ product.current_price ? `$${formatCurrency(product.current_price)}` : '·' }}
                  </span>
                  <span v-if="product.retail_price && product.current_price && product.current_price < product.retail_price"
                    class="numeral text-xs text-text-muted line-through">
                    ${{ formatCurrency(product.retail_price) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Status row: target / stock -->
            <div class="px-4 pb-2">
              <template v-if="product.watch_type === 'stock' || product.watch_type === 'both'">
                <div class="flex items-center justify-between text-xs">
                  <span class="eyebrow">Stock</span>
                  <span :class="product.in_stock ? 'text-success' : 'text-danger'" class="numeral">
                    {{ product.in_stock ? 'In stock' : 'Out of stock' }}
                  </span>
                </div>
              </template>
              <template v-else-if="product.target_price && product.current_price">
                <div class="flex items-center justify-between text-xs">
                  <span class="eyebrow">Target ${{ formatCurrency(product.target_price) }}</span>
                  <span v-if="getDistanceToTarget(product)?.reached" class="numeral text-signal-dark font-medium">
                    Reached
                  </span>
                  <span v-else class="numeral text-text-muted">
                    +${{ formatCurrency(getDistanceToTarget(product)?.amount || 0) }}
                  </span>
                </div>
                <!-- Progress -->
                <div class="mt-2 h-[3px] bg-border rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-accent to-signal transition-all duration-500"
                    :style="{ width: getProgressPercent(product) + '%' }"
                  />
                </div>
              </template>
              <template v-else>
                <div class="flex items-center justify-between text-xs">
                  <span class="eyebrow">No target set</span>
                  <span class="numeral text-text-muted">Watching</span>
                </div>
              </template>
            </div>

            <!-- Footer: SKU + alerts + last checked -->
            <div class="mt-auto px-4 py-3 border-t border-border flex items-center justify-between gap-2">
              <CopyText :text="product.sku_upc" label="SKU" @click.prevent />
              <div class="flex items-center gap-2 text-text-muted">
                <EnvelopeIcon
                  v-if="product.notification_method?.includes('email')"
                  class="h-3 w-3"
                  title="Email alerts on"
                />
                <DevicePhoneMobileIcon
                  v-if="product.notification_method?.includes('push')"
                  class="h-3 w-3"
                  title="Push alerts on"
                />
                <span class="numeral text-[0.6875rem]">
                  {{ product.last_checked_at ? formatRelativeTime(product.last_checked_at) : '·' }}
                </span>
              </div>
            </div>
          </article>
        </RouterLink>

        <!-- Add new card -->
        <RouterLink
          to="/watch/create"
          class="group flex flex-col items-center justify-center min-h-[280px] rounded-md border border-dashed border-border-strong text-center p-6 hover:border-primary hover:bg-surface transition-colors"
        >
          <div class="w-12 h-12 rounded-md bg-primary text-surface flex items-center justify-center mb-3">
            <PlusIcon class="h-5 w-5" />
          </div>
          <p class="font-display text-lg text-primary tracking-tight">Track another</p>
          <p class="text-xs text-text-muted mt-1">Drop in a SKU or product URL</p>
        </RouterLink>
      </div>
    </main>

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

    <ConfirmDialog
      :show="showPauseDialog"
      :title="selectedProduct?.is_active ? 'Pause Tracking' : 'Resume Tracking'"
      :message="
        selectedProduct?.is_active
          ? `Are you sure you want to pause tracking for '${selectedProduct?.product_name || 'this product'}'? You won't receive price alerts while paused.`
          : `Are you sure you want to resume tracking for '${selectedProduct?.product_name || 'this product'}'? You'll start receiving price alerts again.`
      "
      :confirm-text="selectedProduct?.is_active ? 'Pause' : 'Resume'"
      variant="primary"
      :loading="actionLoading"
      @confirm="confirmTogglePause"
      @close="showPauseDialog = false"
    />
  </div>
</template>
