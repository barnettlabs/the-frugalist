import { z } from 'zod';

import { mortgageSheets, vehicleFinanceSheets, vehicleLeaseSheets } from '../db/schema.js';
import { laravelRules as r } from '../http/rules.js';
import { createSheetResource } from './sheet-resource.js';

/**
 * The three estimate resources.
 *
 * Rules are transcribed from their Laravel controllers, bounds included, so the
 * 422 bodies stay identical. `passthroughStringFields` carries the columns that
 * were in $fillable but had no validation rule - Laravel's fill() accepted them
 * unchecked, and the clients send them, so dropping them would be a silent
 * regression.
 */

const VEHICLE_TYPES = ['CAR', 'TRUCK', 'SUV'] as const;
const PROPERTY_TYPES = ['HOUSE', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'LAND'] as const;

/** Shared by finance and lease. */
const vehicleCommon = {
	sheet_name: r.nullableString('sheet name', 255),
	sales_consultant: r.nullableString('sales consultant', 255),
	dealership_name: r.nullableString('dealership name', 255),
	vehicle_type: r.nullableEnum('vehicle type', VEHICLE_TYPES),
	shareable_key: r.nullableString('shareable key', 255),
	start_date: r.nullableDate('start date'),
	contact_email: r.nullableEmail('contact email', 255),
	contact_phone: r.nullableString('contact phone', 255),
};

const VEHICLE_PASSTHROUGH = [
	'vehicle_year',
	'vehicle_make',
	'vehicle_model',
	'vehicle_trim',
	'notes',
] as const;

export const financeSheetRoutes = createSheetResource({
	table: vehicleFinanceSheets,
	idColumn: vehicleFinanceSheets.id,
	userIdColumn: vehicleFinanceSheets.userId,
	createdAtColumn: vehicleFinanceSheets.createdAt,
	passthroughStringFields: VEHICLE_PASSTHROUGH,
	shape: {
		...vehicleCommon,
		msrp: r.nullableNumeric('msrp', { min: 0 }),
		fees: r.nullableNumeric('fees', { min: 0 }),
		discounts: r.nullableNumeric('discounts', { min: 0 }),
		rebates: r.nullableNumeric('rebates', { min: 0 }),
		down_payment: r.nullableNumeric('down payment', { min: 0 }),
		sales_tax_percent: r.nullableNumeric('sales tax percent', { min: 0, max: 100 }),
		interest_rate: r.nullableNumeric('interest rate', { min: 0, max: 100 }),
		finance_term: r.nullableInteger('finance term', { min: 1, max: 120 }),
		extra_payments_json: r.nullableString('extra payments json'),
	},
});

export const leaseSheetRoutes = createSheetResource({
	table: vehicleLeaseSheets,
	idColumn: vehicleLeaseSheets.id,
	userIdColumn: vehicleLeaseSheets.userId,
	createdAtColumn: vehicleLeaseSheets.createdAt,
	passthroughStringFields: VEHICLE_PASSTHROUGH,
	shape: {
		...vehicleCommon,
		msrp: r.nullableNumeric('msrp', { min: 0 }),
		dealer_contribution: r.nullableNumeric('dealer contribution', { min: 0 }),
		trade_in: r.nullableNumeric('trade in', { min: 0 }),
		doc_fee: r.nullableNumeric('doc fee', { min: 0 }),
		acquisition_fee: r.nullableNumeric('acquisition fee', { min: 0 }),
		misc_fees: r.nullableNumeric('misc fees', { min: 0 }),
		lease_cash: r.nullableNumeric('lease cash', { min: 0 }),
		down_payment: r.nullableNumeric('down payment', { min: 0 }),
		money_factor: r.nullableNumeric('money factor', { min: 0 }),
		sales_tax_percent: r.nullableNumeric('sales tax percent', { min: 0, max: 100 }),
		residual_percent: r.nullableNumeric('residual percent', { min: 0, max: 100 }),
		lease_term: r.nullableInteger('lease term', { min: 1, max: 120 }),
	},
});

export const mortgageSheetRoutes = createSheetResource({
	table: mortgageSheets,
	idColumn: mortgageSheets.id,
	userIdColumn: mortgageSheets.userId,
	createdAtColumn: mortgageSheets.createdAt,
	shape: {
		sheet_name: r.nullableString('sheet name', 255),
		property_address: r.nullableString('property address', 255),
		property_type: r.nullableEnum('property type', PROPERTY_TYPES),
		shareable_key: r.nullableString('shareable key', 255),
		property_value: r.nullableNumeric('property value', { min: 0 }),
		down_payment: r.nullableNumeric('down payment', { min: 0 }),
		interest_rate: r.nullableNumeric('interest rate', { min: 0, max: 100 }),
		// 50 years here, not the 120 months the vehicle terms use.
		loan_term_years: r.nullableInteger('loan term years', { min: 1, max: 50 }),
		start_date: r.nullableDate('start date'),
		monthly_hoa: r.nullableNumeric('monthly hoa', { min: 0 }),
		annual_insurance: r.nullableNumeric('annual insurance', { min: 0 }),
		annual_property_tax: r.nullableNumeric('annual property tax', { min: 0 }),
		extra_expenses_json: r.nullableString('extra expenses json'),
		extra_payments_json: r.nullableString('extra payments json'),
		contact_email: r.nullableEmail('contact email', 255),
		contact_phone: r.nullableString('contact phone', 255),
		notes: z.union([z.string(), z.null()]).optional(),
	},
});
