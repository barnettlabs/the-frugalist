export interface Term {
  term: string
  definition: string
  example?: string
}

export interface Keyword {
  keyword: string
  description?: string
}

export interface LearningContent {
  title: string
  description: string
  keywords: Keyword[]
  terms: Term[]
  tips?: string[]
}

export const financeLearningContent: LearningContent = {
  title: 'Vehicle Financing',
  description: 'Learn about vehicle financing terms and concepts to make informed decisions when purchasing a vehicle.',
  keywords: [
    { keyword: 'APR', description: 'Annual Percentage Rate' },
    { keyword: 'Principal', description: 'Loan amount' },
    { keyword: 'Amortization', description: 'Payment schedule' },
    { keyword: 'Trade-in', description: 'Vehicle exchange value' },
    { keyword: 'Equity', description: 'Ownership value' },
  ],
  terms: [
    {
      term: 'MSRP (Manufacturer\'s Suggested Retail Price)',
      definition: 'The price recommended by the vehicle manufacturer before any negotiations, fees, or taxes. This is the starting point for most vehicle purchases.',
      example: 'A car with an MSRP of $30,000 might sell for $28,000 after negotiations and incentives.',
    },
    {
      term: 'Down Payment',
      definition: 'The upfront cash payment made at the time of purchase. A larger down payment reduces your loan amount and monthly payments.',
      example: 'Putting $5,000 down on a $25,000 vehicle means you\'ll finance $20,000.',
    },
    {
      term: 'Interest Rate (APR)',
      definition: 'The Annual Percentage Rate is the yearly cost of borrowing money, expressed as a percentage. Lower rates mean less money paid over the life of the loan.',
      example: 'A 5% APR on a $20,000 loan means you\'ll pay about $5% of the loan amount per year in interest.',
    },
    {
      term: 'Finance Term',
      definition: 'The length of time (in months) over which you\'ll repay the loan. Common terms are 36, 48, 60, or 72 months. Longer terms mean lower monthly payments but more interest paid overall.',
      example: 'A 60-month term means you\'ll make 60 monthly payments to pay off the loan.',
    },
    {
      term: 'Monthly Payment',
      definition: 'The amount you pay each month toward your loan, which includes both principal (loan amount) and interest.',
      example: 'A $20,000 loan at 5% APR for 60 months results in approximately $377 monthly payment.',
    },
    {
      term: 'Total Interest',
      definition: 'The total amount of money you\'ll pay in interest charges over the entire life of the loan, in addition to the principal amount.',
      example: 'On a $20,000 loan at 5% APR for 60 months, you might pay around $2,645 in total interest.',
    },
    {
      term: 'Sales Tax',
      definition: 'A percentage-based tax charged by your state or local government on the purchase price of the vehicle. This is added to your total cost.',
      example: 'In a state with 7% sales tax, a $25,000 vehicle purchase would include $1,750 in sales tax.',
    },
    {
      term: 'Dealer Fees',
      definition: 'Additional charges from the dealership that may include documentation fees, dealer preparation, or destination charges. These are added to the purchase price.',
      example: 'Common dealer fees range from $300-$800 and cover paperwork processing and vehicle preparation.',
    },
    {
      term: 'Rebates & Incentives',
      definition: 'Manufacturer or dealer discounts that reduce the purchase price. These can be cash-back offers, special financing rates, or loyalty programs.',
      example: 'A $2,000 manufacturer rebate on a $30,000 vehicle reduces your purchase price to $28,000.',
    },
    {
      term: 'Trade-in Value',
      definition: 'The amount a dealer will credit you for your current vehicle when purchasing a new one. This reduces your down payment requirement or purchase price.',
      example: 'Trading in a vehicle worth $8,000 on a $25,000 purchase means you need to finance $17,000.',
    },
    {
      term: 'Loan-to-Value (LTV) Ratio',
      definition: 'The ratio of your loan amount to the vehicle\'s value, expressed as a percentage. Lenders prefer lower LTV ratios.',
      example: 'Financing $20,000 on a $25,000 vehicle gives you an 80% LTV ratio.',
    },
    {
      term: 'Negative Equity',
      definition: 'When you owe more on your current vehicle than it\'s worth. This often happens with long-term loans and high depreciation.',
      example: 'If you owe $15,000 but your car is only worth $12,000, you have $3,000 in negative equity.',
    },
  ],
  tips: [
    'A 20% down payment typically gets you better loan terms and rates.',
    'Shorter loan terms mean higher monthly payments but significantly less interest paid over time.',
    'Check your credit score before applying - higher scores qualify for lower interest rates.',
    'Get pre-approved for financing to strengthen your negotiating position.',
    'Don\'t focus solely on monthly payments - consider the total cost including interest.',
    'Watch out for "upside down" loans where you owe more than the vehicle is worth.',
    'Consider certified pre-owned vehicles for better value and lower insurance costs.',
  ],
}

export const leaseLearningContent: LearningContent = {
  title: 'Vehicle Leasing',
  description: 'Understand leasing terminology and concepts to determine if leasing is the right choice for your situation.',
  keywords: [
    { keyword: 'Money Factor', description: 'Lease interest rate' },
    { keyword: 'Residual Value', description: 'End-of-lease value' },
    { keyword: 'Capitalized Cost', description: 'Negotiated price' },
    { keyword: 'Disposition Fee', description: 'End-of-lease charge' },
    { keyword: 'Mileage Allowance', description: 'Annual mileage limit' },
  ],
  terms: [
    {
      term: 'Capitalized Cost (Cap Cost)',
      definition: 'The negotiated price of the vehicle in a lease, similar to the purchase price in financing. A lower cap cost means lower monthly payments.',
      example: 'Negotiating the cap cost down from $35,000 to $33,000 saves you money over the lease term.',
    },
    {
      term: 'Residual Value',
      definition: 'The estimated value of the vehicle at the end of the lease term. This is set by the leasing company and affects your monthly payment. Higher residual values mean lower payments.',
      example: 'A car worth $40,000 today might have a 60% residual value ($24,000) after a 3-year lease.',
    },
    {
      term: 'Money Factor',
      definition: 'The interest rate in leasing, expressed as a decimal. To convert to APR, multiply by 2400. Lower money factors mean lower monthly payments.',
      example: 'A money factor of 0.00125 equals 3% APR (0.00125 × 2400 = 3).',
    },
    {
      term: 'Lease Term',
      definition: 'The length of the lease agreement, typically 24, 36, or 48 months. Longer terms generally mean lower monthly payments.',
      example: 'A 36-month lease is the most common, balancing payments with vehicle warranty coverage.',
    },
    {
      term: 'Annual Mileage Allowance',
      definition: 'The number of miles you can drive per year without incurring extra charges. Common allowances are 10,000, 12,000, or 15,000 miles annually.',
      example: 'A 12,000-mile annual allowance on a 3-year lease gives you 36,000 total miles.',
    },
    {
      term: 'Excess Mileage Charge',
      definition: 'The per-mile fee charged if you exceed your mileage allowance at lease end. Typical charges range from $0.15-$0.30 per mile.',
      example: 'Going 2,000 miles over with a $0.25/mile charge costs an additional $500 at lease end.',
    },
    {
      term: 'Acquisition Fee',
      definition: 'An upfront administrative charge by the leasing company to set up your lease, typically $500-$1,000. This is usually rolled into your monthly payments.',
      example: 'A $795 acquisition fee might add about $22 to your monthly payment on a 36-month lease.',
    },
    {
      term: 'Disposition Fee',
      definition: 'A charge at the end of the lease if you return the vehicle instead of purchasing it, typically $300-$500. This covers the cost of preparing the vehicle for resale.',
      example: 'Most leases include a $395 disposition fee due at lease return.',
    },
    {
      term: 'Security Deposit',
      definition: 'An upfront refundable deposit (typically one monthly payment) held by the leasing company. Some manufacturers waive this for qualified buyers.',
      example: 'A security deposit equal to your $450 monthly payment is refunded if the vehicle is returned in good condition.',
    },
    {
      term: 'Lease Buyout',
      definition: 'The option to purchase the leased vehicle at the end of the term for the residual value plus any fees. This can be a good deal if the vehicle is worth more than the residual.',
      example: 'If the residual is $20,000 but the car is worth $23,000, buying it saves you $3,000.',
    },
    {
      term: 'Gap Insurance',
      definition: 'Insurance that covers the difference between what you owe and the vehicle\'s value if it\'s totaled or stolen. Often included in leases.',
      example: 'If you owe $25,000 but the car is worth $20,000, gap insurance covers the $5,000 difference.',
    },
    {
      term: 'Wear and Tear',
      definition: 'Normal damage expected from regular use. Excessive wear beyond normal use (dents, scratches, interior damage) may result in charges at lease end.',
      example: 'Small door dings are normal wear, but a damaged bumper might cost $500 to repair at lease end.',
    },
    {
      term: 'Early Termination Fee',
      definition: 'A penalty charged if you end your lease before the agreed term. These fees can be substantial and include remaining depreciation costs.',
      example: 'Ending a lease 12 months early might cost several thousand dollars in penalties.',
    },
  ],
  tips: [
    'Leasing works best if you drive less than 15,000 miles per year and want a new car every few years.',
    'Always negotiate the capitalized cost, just like you would a purchase price.',
    'Consider purchasing extra mileage upfront - it\'s cheaper than paying overage fees later.',
    'Keep detailed records of vehicle maintenance to avoid end-of-lease charges.',
    'Inspect the vehicle carefully at lease signing to document existing damage.',
    'Understand that lease payments don\'t build equity - you\'re essentially renting the vehicle.',
    'Compare the total cost of leasing vs. financing before making a decision.',
    'Read the lease agreement carefully, especially terms about wear and tear and mileage.',
  ],
}

export const learningContentMap: Record<string, LearningContent> = {
  financing: financeLearningContent,
  leasing: leaseLearningContent,
}
