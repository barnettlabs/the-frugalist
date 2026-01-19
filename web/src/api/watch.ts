import apiClient from './client'

export interface PriceHistoryEntry {
  id: number
  tracked_product_id: number
  price: number
  in_stock: boolean
  checked_at: string
  created_at: string
}

export type RetailerStatus = 'active' | 'coming_soon'

export interface Retailer {
  id: number
  name: string
  slug: string
  is_active: boolean
  status: RetailerStatus
}

export type NotificationMethod = 'email' | 'push'

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
  last_checked_at: string | null
  created_at: string
  updated_at: string
  retailer?: Retailer
  price_history?: PriceHistoryEntry[]
}

export interface CreateTrackedProductData {
  retailer_id: number
  sku_upc: string
  target_price: number
  start_date?: string
  end_date?: string
  notification_method: NotificationMethod[]
}

export interface UpdateTrackedProductData {
  target_price?: number
  notification_method?: NotificationMethod[]
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

// Retailers with status - Best Buy is active, others are coming soon
export const RETAILERS: Retailer[] = [
  { id: 1, name: 'Best Buy', slug: 'bestbuy', is_active: true, status: 'active' },
  { id: 2, name: 'Home Depot', slug: 'homedepot', is_active: true, status: 'coming_soon' },
  { id: 3, name: "Lowe's", slug: 'lowes', is_active: true, status: 'coming_soon' },
  { id: 4, name: 'Amazon', slug: 'amazon', is_active: true, status: 'coming_soon' },
  { id: 5, name: 'Walmart', slug: 'walmart', is_active: true, status: 'coming_soon' },
  { id: 6, name: 'Target', slug: 'target', is_active: true, status: 'coming_soon' },
]

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
