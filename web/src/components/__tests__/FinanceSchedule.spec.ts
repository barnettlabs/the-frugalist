import { computeFinance } from '@frugalist/contracts';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AmortizationTable from '@/components/Finance/AmortizationTable.vue';
import PaymentCharts from '@/components/Finance/PaymentCharts.vue';
import { formatCurrency } from '@/utils/formatters';

/**
 * These two components are plain JavaScript, so vue-tsc does not check that
 * the fields they read exist on the calculator's output. Mounting them against
 * real figures from @frugalist/contracts does.
 */

const data = {
	msrp: 30000,
	down_payment: 3000,
	interest_rate: 6,
	finance_term: 60,
	extra_payments_json: JSON.stringify([{ startMonth: 6, endMonth: 6, paymentAmount: 1000 }]),
};

const expected = computeFinance(data).amortization!;
const extra = 1000;

describe('Finance AmortizationTable', () => {
	it('renders the totals and rows from the shared calculator', async () => {
		const wrapper = mount(AmortizationTable, { props: { data } });
		const buttons = wrapper.findAll('button');
		await buttons[0]!.trigger('click'); // show extras
		await buttons[1]!.trigger('click'); // expand

		expect(wrapper.text()).toContain(formatCurrency(expected.total_interest));
		expect(wrapper.text()).toContain(String(expected.months_paid));

		// Month 6: the extra in its own column, principal as the scheduled part.
		const month6 = expected.schedule[5]!;
		const cells = wrapper
			.findAll('tbody tr')[5]!
			.findAll('td')
			.map(td => td.text());
		expect(cells).toEqual([
			'6',
			`$${formatCurrency(month6.payment)}`,
			`$${formatCurrency(extra)}`,
			`$${formatCurrency(month6.principal_payment - extra)}`,
			`$${formatCurrency(month6.interest_payment)}`,
			`$${formatCurrency(month6.remaining_balance)}`,
		]);
	});
});

describe('Finance PaymentCharts', () => {
	it('counts an extra payment once, in its own slice', () => {
		const text = mount(PaymentCharts, { props: { data } }).text();

		expect(text).toContain(formatCurrency(expected.total_principal - extra));
		expect(text).toContain(formatCurrency(expected.total_interest));
		expect(text).toContain(formatCurrency(extra));
	});
});
