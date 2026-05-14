export interface Term {
	term: string;
	definition: string;
}

export const FINANCE_TERMS: Term[] = [
	{
		term: "MSRP (Manufacturer's Suggested Retail Price)",
		definition:
			'The price recommended by the manufacturer for the vehicle. This is often the starting point for negotiations.',
	},
	{
		term: 'APR (Annual Percentage Rate)',
		definition:
			'The yearly interest rate charged for borrowing money. A lower APR means you pay less interest over the life of the loan.',
	},
	{
		term: 'Down Payment',
		definition:
			'The upfront amount you pay when purchasing a vehicle. A larger down payment reduces your loan amount and monthly payments.',
	},
	{
		term: 'Trade-In',
		definition:
			'Your current vehicle that you give to the dealer as partial payment toward a new vehicle. The trade-in value reduces your overall cost.',
	},
	{
		term: 'Rebates',
		definition:
			'Cash incentives offered by manufacturers that reduce the purchase price. These are often time-limited promotions.',
	},
	{
		term: 'Loan Term',
		definition:
			'The length of time you have to repay the loan, typically expressed in months (e.g., 36, 48, 60, or 72 months).',
	},
	{
		term: 'Principal',
		definition:
			'The original amount borrowed, excluding interest. Each payment you make reduces the principal balance.',
	},
	{
		term: 'Amortization',
		definition:
			'The process of spreading loan payments over time. Early payments are mostly interest, while later payments reduce principal.',
	},
	{
		term: 'Total Interest',
		definition:
			'The total amount of interest paid over the life of the loan. Shorter terms and lower APRs result in less total interest.',
	},
	{
		term: 'Doc Fee',
		definition:
			'A dealer-charged fee for processing paperwork. This varies by dealer and state but is often negotiable.',
	},
];

export const LEASE_TERMS: Term[] = [
	{
		term: 'Money Factor',
		definition:
			'The lease equivalent of an interest rate. Multiply by 2,400 to convert to an approximate APR (e.g., 0.00125 × 2400 = 3% APR).',
	},
	{
		term: 'Residual Value',
		definition:
			'The predicted value of the vehicle at the end of the lease. A higher residual typically means lower monthly payments.',
	},
	{
		term: 'Capitalized Cost (Cap Cost)',
		definition:
			'The negotiated price of the vehicle for leasing purposes. This is similar to the purchase price when buying.',
	},
	{
		term: 'Cap Cost Reduction',
		definition: 'Any upfront payments that reduce the capitalized cost, including down payment, trade-in, and rebates.',
	},
	{
		term: 'Acquisition Fee',
		definition:
			'A fee charged by the leasing company to set up the lease. This is typically $500-$1,000 and usually non-negotiable.',
	},
	{
		term: 'Disposition Fee',
		definition:
			'A fee charged at lease end if you return the vehicle. Typically $300-$500, often waived if you lease another vehicle.',
	},
	{
		term: 'Mileage Allowance',
		definition:
			'The maximum miles you can drive annually without penalty. Exceeding this results in per-mile charges at lease end.',
	},
	{
		term: 'Lease Cash / Incentives',
		definition:
			'Manufacturer rebates specifically for leasing. These reduce your capitalized cost and monthly payment.',
	},
	{
		term: 'Due at Signing',
		definition:
			'The total amount you pay upfront when signing the lease, including first payment, down payment, and fees.',
	},
	{
		term: 'Buyout Price',
		definition: 'The price to purchase the vehicle at lease end, typically the residual value plus any remaining fees.',
	},
];

export const FINANCE_TIPS: string[] = [
	'Get pre-approved for financing before visiting the dealership. This gives you negotiating leverage and a comparison point.',
	'A shorter loan term means higher monthly payments but less total interest paid over the life of the loan.',
	'Consider making extra payments toward principal to pay off your loan faster and save on interest.',
	'Your credit score significantly impacts your interest rate. Check and improve your score before applying.',
	"Don't focus only on monthly payment. Dealers may extend the term to lower payments while increasing total cost.",
	'Negotiate the total price of the vehicle first, then discuss financing terms separately.',
	'Watch for dealer add-ons like extended warranties and gap insurance. These can often be purchased elsewhere for less.',
	'If offered 0% financing, compare it to a cash rebate option. Sometimes the rebate saves you more.',
];

export const LEASE_TIPS: string[] = [
	'Negotiate the cap cost (selling price) just like you would if buying. The lower your cap cost, the lower your payment.',
	'A higher residual value is good for you as it means lower monthly payments during the lease.',
	"Choose your mileage allowance carefully. It's cheaper to buy extra miles upfront than to pay overage fees.",
	"Money factor is often negotiable, especially if you have excellent credit. Don't be afraid to ask for a better rate.",
	'Consider lease-specific incentives. Manufacturers often offer different rebates for leasing vs. buying.',
	'Read the lease agreement carefully for wear and tear policies to avoid surprise charges at lease end.',
	"Don't put too much money down on a lease. If the car is totaled, you'll lose that down payment.",
	'Time your lease end strategically. New models often have better lease deals when trying to clear inventory.',
];
