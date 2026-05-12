// Vehicle Type Enum
export enum VehicleType {
	CAR = 'CAR',
	TRUCK = 'TRUCK',
	SUV = 'SUV',
}

// Finance Form Field Names (snake_case to match database)
export enum FinanceFormFields {
	// Basic Information
	SHEET_NAME = 'sheet_name',
	SALES_CONSULTANT = 'sales_consultant',
	DEALERSHIP_NAME = 'dealership_name',
	VEHICLE_TYPE = 'vehicle_type',

	// Vehicle Information
	VEHICLE_YEAR = 'vehicle_year',
	VEHICLE_MAKE = 'vehicle_make',
	VEHICLE_MODEL = 'vehicle_model',
	VEHICLE_TRIM = 'vehicle_trim',

	// Pricing Information
	MSRP = 'msrp',
	FEES = 'fees',
	DISCOUNTS = 'discounts',
	REBATES = 'rebates',
	DOWN_PAYMENT = 'down_payment',
	SALES_TAX_PERCENT = 'sales_tax_percent',

	// Finance Terms
	INTEREST_RATE = 'interest_rate',
	FINANCE_TERM = 'finance_term',
	START_DATE = 'start_date',

	// Contact Information
	CONTACT_EMAIL = 'contact_email',
	CONTACT_PHONE = 'contact_phone',

	// Additional Fields
	EXTRA_PAYMENTS_JSON = 'extra_payments_json',
	NOTES = 'notes',

	// Metadata
	SHAREABLE_KEY = 'shareable_key',
	CREATED_AT = 'created_at',
	UPDATED_AT = 'updated_at',
}

// Lease Form Field Names (snake_case to match database)
export enum LeaseFormFields {
	// Basic Information
	SHEET_NAME = 'sheet_name',
	SALES_CONSULTANT = 'sales_consultant',
	DEALERSHIP_NAME = 'dealership_name',
	VEHICLE_TYPE = 'vehicle_type',

	// Vehicle Information
	VEHICLE_YEAR = 'vehicle_year',
	VEHICLE_MAKE = 'vehicle_make',
	VEHICLE_MODEL = 'vehicle_model',
	VEHICLE_TRIM = 'vehicle_trim',

	// Pricing Information
	MSRP = 'msrp',
	DEALER_CONTRIBUTION = 'dealer_contribution',
	TRADE_IN = 'trade_in',
	DOC_FEE = 'doc_fee',
	ACQUISITION_FEE = 'acquisition_fee',
	MISC_FEES = 'misc_fees',
	LEASE_CASH = 'lease_cash',
	DOWN_PAYMENT = 'down_payment',
	SALES_TAX_PERCENT = 'sales_tax_percent',

	// Lease Terms
	MONEY_FACTOR = 'money_factor',
	RESIDUAL_PERCENT = 'residual_percent',
	LEASE_TERM = 'lease_term',
	START_DATE = 'start_date',

	// Contact Information
	CONTACT_EMAIL = 'contact_email',
	CONTACT_PHONE = 'contact_phone',

	// Additional Fields
	NOTES = 'notes',

	// Metadata
	SHAREABLE_KEY = 'shareable_key',
	CREATED_AT = 'created_at',
	UPDATED_AT = 'updated_at',
}

// Vehicle Type Options for Select Components
export const vehicleTypeOptions = [
	{ value: VehicleType.CAR, label: 'Car' },
	{ value: VehicleType.TRUCK, label: 'Truck' },
	{ value: VehicleType.SUV, label: 'SUV' },
] as const;

// Property Type Enum (mortgage)
export enum PropertyType {
	HOUSE = 'HOUSE',
	CONDO = 'CONDO',
	TOWNHOUSE = 'TOWNHOUSE',
	MULTI_FAMILY = 'MULTI_FAMILY',
	LAND = 'LAND',
}

export const propertyTypeOptions = [
	{ value: PropertyType.HOUSE, label: 'House' },
	{ value: PropertyType.CONDO, label: 'Condo' },
	{ value: PropertyType.TOWNHOUSE, label: 'Townhouse' },
	{ value: PropertyType.MULTI_FAMILY, label: 'Multi-family' },
	{ value: PropertyType.LAND, label: 'Land' },
] as const;

// Expense frequency for mortgage extra expenses
export const expenseFrequencyOptions = [
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'annual', label: 'Annual' },
] as const;
