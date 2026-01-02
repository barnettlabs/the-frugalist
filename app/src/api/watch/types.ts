export interface CreateWatchRequest {
  sku_upc: string;
  retailer_id: number;
  target_price: number;
}

export interface UpdateWatchRequest {
  id: number;
  data: {
    target_price?: number;
    is_active?: boolean;
  };
}

export interface DeleteWatchRequest {
  id: number;
}

export interface RefreshWatchRequest {
  id: number;
}
