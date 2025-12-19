import apiClient from './client'

export interface PriceHistoryEntry {
  id: number
  tracked_product_id: number
  price: number
  in_stock: boolean
  checked_at: string
  created_at: string
}

export interface TrackedProduct {
  id: number
  user_id: number
  retailer_id: number
  product_url: string
  product_name: string
  retail_price: number
  current_price: number
  target_price: number | null
  last_checked_at: string
  created_at: string
  updated_at: string
  retailer: {
    id: number
    name: string
    domain: string
  }
  price_history?: PriceHistoryEntry[]
}

export interface CreateTrackedProductData {
  product_url: string
  target_price?: number
}

export interface UpdateTrackedProductData {
  target_price?: number
}

export const priceTrackerApi = {
  async getAll(): Promise<TrackedProduct[]> {
    const { data } = await apiClient.get<{ tracked_products: TrackedProduct[] }>('/price-tracker')
    return data.tracked_products
  },

  async get(id: number | string): Promise<TrackedProduct> {
    const { data } = await apiClient.get<{ tracked_product: TrackedProduct }>(`/price-tracker/${id}`)
    return data.tracked_product
  },

  async validateProduct(productUrl: string): Promise<{ valid: boolean; product_name?: string; price?: number; error?: string }> {
    const { data } = await apiClient.post('/price-tracker/validate-product', { product_url: productUrl })
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
