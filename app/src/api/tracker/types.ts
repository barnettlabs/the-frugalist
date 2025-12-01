export interface CreatePriceTrackerRequest {
  sku_upc: string;
  retailer_id: number;
  target_price: number;
}

export interface UpdatePriceTrackerRequest {
  id: number;
  data: {
    target_price?: number;
    is_active?: boolean;
  };
}

export interface DeletePriceTrackerRequest {
  id: number;
}

export interface RefreshPriceTrackerRequest {
  id: number;
}
