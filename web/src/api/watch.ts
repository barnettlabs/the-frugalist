import apiClient from './client'

export interface PriceHistoryEntry {
  id: number
  tracked_product_id: number
  price: number
  in_stock: boolean
  checked_at: string
  created_at: string
}

export interface Retailer {
  id: number
  name: string
  slug: string
  is_active: boolean
  coming_soon: boolean
}

export type NotificationMethod = 'email' | 'push'
export type WatchType = 'price' | 'stock' | 'both'
export type CheckInterval = 1 | 5 | 15 | 30 | 60 | 360 | 720 | 1440 // minutes

export const CHECK_INTERVAL_OPTIONS = [
  { value: 1, label: 'Every minute' },
  { value: 5, label: 'Every 5 minutes' },
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
  { value: 360, label: 'Every 6 hours' },
  { value: 720, label: 'Every 12 hours' },
  { value: 1440, label: 'Once a day' },
] as const

export const WATCH_TYPE_OPTIONS = [
  { value: 'price', label: 'Price drop', description: 'Notify when price drops to target' },
  { value: 'stock', label: 'Back in stock', description: 'Notify when item becomes available' },
  { value: 'both', label: 'Price or stock', description: 'Notify for either event' },
] as const

export interface TrackedProduct {
  id: number
  user_id: number
  retailer_id: number
  sku_upc: string
  product_name: string
  product_variant?: string
  product_description?: string
  product_image_url?: string
  retail_price: number
  current_price: number
  target_price: number | null
  is_active: boolean
  notification_method: NotificationMethod[]
  watch_type: WatchType
  check_interval: CheckInterval
  in_stock: boolean
  last_checked_at: string | null
  created_at: string
  updated_at: string
  retailer?: Retailer
  price_history?: PriceHistoryEntry[]
}

export interface CreateTrackedProductData {
  retailer_id: number
  sku_upc: string
  target_price?: number
  tracking_start_date: string
  tracking_end_date?: string
  notification_methods: NotificationMethod[]
  watch_type: WatchType
  check_interval: CheckInterval
}

export interface UpdateTrackedProductData {
  target_price?: number
  notification_method?: NotificationMethod[]
  is_active?: boolean
  watch_type?: WatchType
  check_interval?: CheckInterval
}

export interface ProductMetadata {
  on_sale?: boolean
  model_number?: string
  retailer_url?: string
}

export interface ValidatedProduct {
  name: string
  variant?: string
  description?: string
  image_url?: string
  retail_price: number
  current_price: number
  in_stock: boolean
  sku_upc?: string
  retailer_url?: string
  metadata: ProductMetadata
}

export interface ValidateProductResponse {
  valid: boolean
  product?: ValidatedProduct
  message?: string
}

// Debug-specific types
export interface DebugInfo {
  raw_api_response: {
    retailer: string
    endpoint: string
    response: unknown
  } | null
  parsed_data: ValidatedProduct | null
  saved_to_db?: {
    current_price: number
    product_metadata: ProductMetadata
    last_checked_at: string
  }
  price_history_entry?: Record<string, unknown>
  alert_created?: Record<string, unknown> | null
  price_changed?: boolean
  old_price?: number
  new_price?: number
  error?: string
  trace?: string
}

export interface DebugValidateProductResponse {
  valid: boolean
  product?: ValidatedProduct
  message?: string
  debug: DebugInfo
}

export interface DebugRefreshResponse {
  message?: string
  error?: string
  tracked_product?: TrackedProduct
  debug: DebugInfo
}

// Fetch retailers from database
export async function getRetailers(): Promise<Retailer[]> {
  const { data } = await apiClient.get<{ retailers: Retailer[] }>('/retailers')
  return data.retailers
}

// Production API - clean endpoints
export const watchApi = {
  async getAll(): Promise<TrackedProduct[]> {
    const { data } = await apiClient.get<{ tracked_products: TrackedProduct[] }>('/watch')
    return data.tracked_products
  },

  async get(id: number | string): Promise<TrackedProduct> {
    const { data } = await apiClient.get<{ tracked_product: TrackedProduct }>(`/watch/${id}`)
    return data.tracked_product
  },

  async validateProduct(retailerId: number, skuUpc: string): Promise<ValidateProductResponse> {
    const { data } = await apiClient.post<ValidateProductResponse>('/watch/validate-product', {
      retailer_id: retailerId,
      sku_upc: skuUpc,
    })
    return data
  },

  async create(productData: CreateTrackedProductData): Promise<TrackedProduct> {
    const { data } = await apiClient.post<{ tracked_product: TrackedProduct }>('/watch', productData)
    return data.tracked_product
  },

  async update(id: number | string, productData: UpdateTrackedProductData): Promise<TrackedProduct> {
    const { data } = await apiClient.patch<{ tracked_product: TrackedProduct }>(`/watch/${id}`, productData)
    return data.tracked_product
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/watch/${id}`)
  },

  async refresh(id: number | string): Promise<TrackedProduct> {
    const { data } = await apiClient.post<{ tracked_product: TrackedProduct }>(`/watch/${id}/refresh`)
    return data.tracked_product
  },
}

// Debug API - separate endpoints for debugging retailer API calls
export const watchDebugApi = {
  async canDebug(): Promise<boolean> {
    try {
      const { data } = await apiClient.get<{ can_debug: boolean }>('/watch-debug/can-debug')
      return data.can_debug
    } catch {
      return false
    }
  },

  async validateProduct(retailerId: number, skuUpc: string): Promise<DebugValidateProductResponse> {
    const { data } = await apiClient.post<DebugValidateProductResponse>('/watch-debug/validate-product', {
      retailer_id: retailerId,
      sku_upc: skuUpc,
    })
    return data
  },

  async refresh(id: number | string): Promise<DebugRefreshResponse> {
    const { data } = await apiClient.post<DebugRefreshResponse>(`/watch-debug/${id}/refresh`)
    return data
  },
}
