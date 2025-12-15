import apiClient from './client'

export interface TrackedProduct {
  id: number
  user_id: number
  retailer_id: number
  product_url: string
  product_name: string
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
    const { data } = await apiClient.get<TrackedProduct[]>('/price-tracker')
    return data
  },

  async get(id: number | string): Promise<TrackedProduct> {
    const { data } = await apiClient.get<TrackedProduct>(`/price-tracker/${id}`)
    return data
  },

  async validateProduct(productUrl: string): Promise<{ valid: boolean; product_name?: string; price?: number; error?: string }> {
    const { data } = await apiClient.post('/price-tracker/validate-product', { product_url: productUrl })
    return data
  },

  async create(productData: CreateTrackedProductData): Promise<TrackedProduct> {
    const { data } = await apiClient.post<TrackedProduct>('/price-tracker', productData)
    return data
  },

  async update(id: number | string, productData: UpdateTrackedProductData): Promise<TrackedProduct> {
    const { data } = await apiClient.patch<TrackedProduct>(`/price-tracker/${id}`, productData)
    return data
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/price-tracker/${id}`)
  },

  async refresh(id: number | string): Promise<TrackedProduct> {
    const { data } = await apiClient.post<TrackedProduct>(`/price-tracker/${id}/refresh`)
    return data
  },
}
