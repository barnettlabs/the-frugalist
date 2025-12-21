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
  target_price?: number
  notification_method: NotificationMethod[]
}

export interface UpdateTrackedProductData {
  target_price?: number
  notification_method?: NotificationMethod[]
}

export interface ValidateProductResponse {
  valid: boolean
  product_name?: string
  product_description?: string
  product_image_url?: string
  current_price?: number
  retail_price?: number
  in_stock?: boolean
  error?: string
}

// Hardcoded retailers matching the mobile app and seeder
export const RETAILERS: Retailer[] = [
  { id: 1, name: 'Best Buy', slug: 'bestbuy', is_active: true },
  { id: 2, name: 'Home Depot', slug: 'homedepot', is_active: true },
  { id: 3, name: "Lowe's", slug: 'lowes', is_active: true },
  { id: 4, name: 'Amazon', slug: 'amazon', is_active: true },
  { id: 5, name: 'Walmart', slug: 'walmart', is_active: true },
  { id: 6, name: 'Target', slug: 'target', is_active: true },
]

export const priceTrackerApi = {
  async getAll(): Promise<TrackedProduct[]> {
    const { data } = await apiClient.get<{ tracked_products: TrackedProduct[] }>('/price-tracker')
    return data.tracked_products
  },

  async get(id: number | string): Promise<TrackedProduct> {
    const { data } = await apiClient.get<{ tracked_product: TrackedProduct }>(`/price-tracker/${id}`)
    return data.tracked_product
  },

  async validateProduct(retailerId: number, skuUpc: string): Promise<ValidateProductResponse> {
    const { data } = await apiClient.post<ValidateProductResponse>('/price-tracker/validate-product', {
      retailer_id: retailerId,
      sku_upc: skuUpc,
    })
    return data
  },

  async create(productData: CreateTrackedProductData): Promise<TrackedProduct> {
    const { data } = await apiClient.post<{ tracked_product: TrackedProduct }>('/price-tracker', productData)
    return data.tracked_product
  },

  async update(id: number | string, productData: UpdateTrackedProductData): Promise<TrackedProduct> {
    const { data } = await apiClient.patch<{ tracked_product: TrackedProduct }>(`/price-tracker/${id}`, productData)
    return data.tracked_product
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/price-tracker/${id}`)
  },

  async refresh(id: number | string): Promise<TrackedProduct> {
    const { data } = await apiClient.post<{ tracked_product: TrackedProduct }>(`/price-tracker/${id}/refresh`)
    return data.tracked_product
  },
}
