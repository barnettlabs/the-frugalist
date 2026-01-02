/**
 * Shared type definitions for the TheFrugalist mobile app
 */

export enum VehicleType {
  CAR = 'CAR',
  TRUCK = 'TRUCK',
  SUV = 'SUV',
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  phone?: string;
  phone_verified_at?: string | null;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleFinanceSheet {
  id: number;
  user_id: number;
  sheet_name: string;
  sales_consultant: string | null;
  dealership_name: string | null;
  vehicle_type: VehicleType;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  msrp: number;
  fees: number;
  discounts: number;
  rebates: number;
  down_payment: number;
  sales_tax_percent: number;
  interest_rate: number;
  finance_term: number;
  start_date: string;
  contact_email: string | null;
  contact_phone: string | null;
  extra_payments_json: string | null;
  notes: string | null;
  shareable_key: string;
  created_at: string;
  updated_at: string;
}

export type FinanceFormData = Omit<
  VehicleFinanceSheet,
  'id' | 'user_id' | 'shareable_key' | 'created_at' | 'updated_at'
>;

export interface ExtraPayment {
  startMonth: number;
  endMonth: number;
  paymentAmount: number;
}

export interface VehicleLeaseSheet {
  id: number;
  user_id: number;
  sheet_name: string;
  sales_consultant: string | null;
  dealership_name: string | null;
  vehicle_type: VehicleType;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  msrp: number;
  dealer_contribution: number;
  trade_in: number;
  doc_fee: number;
  acquisition_fee: number;
  misc_fees: number;
  lease_cash: number;
  down_payment: number;
  sales_tax_percent: number;
  money_factor: number;
  residual_percent: number;
  lease_term: number;
  start_date: string;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  shareable_key: string;
  created_at: string;
  updated_at: string;
}

export type LeaseFormData = Omit<
  VehicleLeaseSheet,
  'id' | 'user_id' | 'shareable_key' | 'created_at' | 'updated_at'
>;

export interface Retailer {
  id: number;
  name: string;
  slug: string;
}

export interface PriceHistoryEntry {
  price: number;
  checked_at: string;
}

export interface PriceAlert {
  id: number;
  type: 'target_reached' | 'price_drop';
  message: string;
  created_at: string;
}

export interface PriceTrackerItem {
  tracked_product: {
    id: number;
    sku_upc: string;
    product_name: string;
    product_variant?: string;
    product_image_url?: string;
    retail_price: number;
    current_price: number;
    target_price: number;
    tracking_start_date: string;
    tracking_end_date?: string;
    is_active: boolean;
    last_checked_at?: string;
    last_scraper_error?: string;
    last_error_at?: string;
    product_metadata?: {
      retailer_url?: string;
      [key: string]: any;
    };
    retailer: {
      id: number;
      name: string;
      slug: string;
    };
    price_history: {
      id: number;
      price: number;
      checked_at: string;
    }[];
    price_alerts: {
      id: number;
      alert_type: string;
      old_price: number;
      new_price: number;
      triggered_at: string;
    };
    price_drop_percentage: number;
  };
}

export interface PriceTracker {
  retailers: Retailer[];
  tracked_products: PriceTrackerItem['tracked_product'][];
}

export type PriceTrackerFilter =
  | 'all'
  | 'active'
  | 'paused'
  | 'target_reached'
  | 'price_drops';

// Amortization schedule types
export interface AmortizationPayment {
  month: number;
  payment: number;
  extraPayment: number;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export interface AmortizationResult {
  schedule: AmortizationPayment[];
  totalInterest: number;
  totalPrincipal: number;
  monthsPaid: number;
  monthsSaved: number;
}

export interface PaymentBreakdown {
  principal: number;
  interest: number;
  extraPayments: number;
}

export interface FinanceSummary {
  purchasePrice: number;
  salesTaxAmount: number;
  loanAmount: number;
  monthlyPayment: number;
  interestAmount: number;
  paymentsTotal: number;
  grandTotal: number;
  amortization: AmortizationResult | null;
  paymentBreakdown: PaymentBreakdown | null;
}

// Lease schedule types
export interface LeaseSchedulePayment {
  month: number;
  principalPayment: number;
  interestPayment: number;
  taxPayment: number;
  totalPayment: number;
  remainingPrincipal: number;
}

export interface LeasePaymentBreakdown {
  principal: number;
  interest: number;
  tax: number;
}

export interface LeaseSummary {
  residualAmount: number;
  interestRate: number;
  finalDealerPrice: number;
  grossCapCost: number;
  netCapCost: number;
  principalAmount: number;
  monthlyPrincipalPayment: number;
  residualMonthlyInterestPayment: number;
  totalSalesTax: number;
  monthlySalesTax: number;
  leasePayment: number;
  cashDueAtSigning: number;
  totalLeaseCost: number;
  paymentBreakdown: LeasePaymentBreakdown;
  schedule: LeaseSchedulePayment[];
}
