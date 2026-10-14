import React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';
import type { VehicleLeaseSheet } from '@/lib/types/models';

import { LeaseCard } from './lease-card';

afterEach(cleanup);

jest.mock('expo-router', () => ({
	Link: ({ children }: { children: React.ReactNode }) => children,
}));

/*
 * The card computes its payment with @frugalist/contracts, linked in from
 * packages/contracts. This is the one app test that goes through that link,
 * so a broken jest.config.js mapping fails here rather than only on device.
 * The figures are contracts' hand-derived lease case (lease.test.ts).
 */
const sheet = {
	id: 1,
	sheet_name: 'Test lease',
	dealership_name: 'Test dealer',
	msrp: 45000,
	residual_percent: 58,
	money_factor: 0.00225,
	dealer_contribution: 2000,
	trade_in: 0,
	doc_fee: 599,
	acquisition_fee: 895,
	misc_fees: 300,
	lease_cash: 1500,
	down_payment: 3000,
	lease_term: 36,
	sales_tax_percent: 7,
} as unknown as VehicleLeaseSheet;

describe('LeaseCard', () => {
	it('shows the monthly payment from the shared calculator', () => {
		render(<LeaseCard sheet={sheet} />);

		expect(screen.getByText('$592.34', { exact: false })).toBeOnTheScreen();
	});
});
