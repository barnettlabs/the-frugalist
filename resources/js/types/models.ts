import { VehicleType } from './enums';

// Base Vehicle Sheet Interface (snake_case to match database)
interface BaseVehicleSheet {
    id?: number;
    user_id?: string;
    sheet_name?: string;
    sales_consultant?: string;
    dealership_name?: string;
    vehicle_type?: VehicleType;
    shareable_key?: string;
    
    // Vehicle Information
    vehicle_year?: string;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_trim?: string;
    
    // Common Fields
    msrp?: number;
    down_payment?: number;
    sales_tax_percent?: number;
    start_date?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
    
    // Metadata
    created_at?: string;
    updated_at?: string;
}

// Vehicle Finance Sheet Model
export interface VehicleFinanceSheet extends BaseVehicleSheet {
    // Finance-specific fields
    fees?: number;
    discounts?: number;
    rebates?: number;
    interest_rate?: number;
    finance_term?: number;
    extra_payments_json?: string;
}

// Vehicle Lease Sheet Model
export interface VehicleLeaseSheet extends BaseVehicleSheet {
    // Lease-specific fields
    dealer_contribution?: number;
    trade_in?: number;
    doc_fee?: number;
    acquisition_fee?: number;
    misc_fees?: number;
    lease_cash?: number;
    money_factor?: number;
    residual_percent?: number;
    lease_term?: number;
}

// Form Data Models (for frontend forms)
export interface FinanceFormData {
    // Basic Information
    sheet_name: string;
    sales_consultant: string;
    dealership_name: string;
    vehicle_type: VehicleType;
    
    // Vehicle Information
    vehicle_year: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_trim: string;
    
    // Pricing Information
    msrp: string;
    fees: string;
    discounts: string;
    rebates: string;
    down_payment: string;
    sales_tax_percent: string;
    
    // Finance Terms
    interest_rate: string;
    finance_term: string;
    start_date: string;
    
    // Contact Information
    contact_email: string;
    contact_phone: string;
    
    // Additional Fields
    extra_payments_json: string;
    notes: string;
}

export interface LeaseFormData {
    // Basic Information
    sheet_name: string;
    sales_consultant: string;
    dealership_name: string;
    vehicle_type: VehicleType;
    
    // Vehicle Information
    vehicle_year: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_trim: string;
    
    // Pricing Information
    msrp: string;
    dealer_contribution: string;
    trade_in: string;
    doc_fee: string;
    acquisition_fee: string;
    misc_fees: string;
    lease_cash: string;
    down_payment: string;
    sales_tax_percent: string;
    
    // Lease Terms
    money_factor: string;
    residual_percent: string;
    lease_term: string;
    start_date: string;
    
    // Contact Information
    contact_email: string;
    contact_phone: string;
    
    // Additional Fields
    notes: string;
}

// Legacy form data for backward compatibility (create forms use different schema)
export interface LegacyFinanceFormData {
    // Basic Information
    sheet_name: string;
    dealership_name: string;
    
    // Vehicle Information
    vehicle_year: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_trim: string;
    
    // Pricing Information
    msrp: string;
    selling_price: string;
    down_payment: string;
    trade_in_value: string;
    trade_in_payoff: string;
    cash_rebate: string;
    dealer_rebate: string;
    other_incentives: string;
    sales_tax_rate: string;
    doc_fee: string;
    title_fee: string;
    license_fee: string;
    other_fees: string;
    
    // Finance Terms
    interest_rate: string;
    loan_term_months: string;
    monthly_payment: string;
    total_interest: string;
    total_cost: string;
    
    // Additional Fields
    notes: string;
    amount_financed: string;
}

export interface LegacyLeaseFormData {
    // Basic Information
    sheet_name: string;
    dealership_name: string;
    
    // Vehicle Information
    vehicle_year: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_trim: string;
    
    // Pricing Information
    msrp: string;
    selling_price: string;
    down_payment: string;
    trade_in_value: string;
    trade_in_payoff: string;
    cash_rebate: string;
    dealer_rebate: string;
    other_incentives: string;
    sales_tax_rate: string;
    doc_fee: string;
    title_fee: string;
    license_fee: string;
    other_fees: string;
    
    // Lease Terms
    money_factor: string;
    lease_term_months: string;
    monthly_payment: string;
    residual_value: string;
    
    // Additional Fields
    notes: string;
    capitalized_cost: string;
}

// API Response Models
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

// Form Error Types
export type FormErrors<T = Record<string, any>> = {
    [K in keyof T]?: string[];
} & {
    [key: string]: string[] | undefined;
};