import { VehicleType } from "./enums";

// Vehicle Finance Sheet Model
export interface VehicleFinanceSheet {
    // Keys
    id: string;
    user_id: string;

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
    shareable_key: string;

    // Dates
    created_at: string;
    updated_at: string;
}

// Vehicle Lease Sheet Model
export interface VehicleLeaseSheet {
    // Keys
    id: string;
    user_id: string;

    // Basic Information
    sheet_name: string;
    sales_consultant: string;
    dealership_name: string;

    // Vehicle Information
    vehicle_type: VehicleType;
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
    shareable_key: string;

    // Dates
    created_at: string;
    updated_at: string;
}

// Form Data Models (for frontend forms)
export type FinanceFormData = Omit<
    VehicleFinanceSheet,
    "id" | "user_id" | "shareable_key" | "created_at" | "updated_at"
>;

export type LeaseFormData = Omit<
    VehicleLeaseSheet,
    "id" | "user_id" | "shareable_key" | "created_at" | "updated_at"
>;

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
