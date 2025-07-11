import { addMonths } from 'date-fns'
import type { NumberOrString } from '~/types'
import { parseOrZero } from '../number'
import { FINANCE_FORM_FIELDS } from '~/enums/forms'
import { MONTHS } from '~/enums/months'

const calcPurchasePrice = (
	msrp: NumberOrString,
	discounts: NumberOrString,
	rebates: NumberOrString
) => {
	return (
		parseOrZero(msrp) -
		parseOrZero(discounts) -
		parseOrZero(rebates)
	).toFixed(2)
}

const calcSalesTaxAmount = (
	msrp: NumberOrString,
	discounts: NumberOrString,
	salesTaxPercent: NumberOrString
) => {
	let ta =
		(parseOrZero(msrp) - parseOrZero(discounts)) *
		(parseOrZero(salesTaxPercent) / 100)

	return ta.toFixed(2)
}

const calcSalesTaxPercent = (
	msrp: NumberOrString,
	discounts: NumberOrString,
	salesTaxAmount: NumberOrString
) => {
	let tp =
		(100 * parseOrZero(salesTaxAmount)) /
		(parseOrZero(msrp) - parseOrZero(discounts))

	return tp.toFixed(3)
}

const calcInterestAmount = (
	loanAmount: NumberOrString,
	months: NumberOrString,
	monthlyPayment: NumberOrString
) => {
	return Math.abs(
		parseOrZero(loanAmount) - parseOrZero(months) * parseOrZero(monthlyPayment)
	).toFixed(2)
}

const calcMonthlyPayment = (
	interestRate: NumberOrString,
	months: NumberOrString,
	loanAmount: NumberOrString
) => {
	const parsedInterestRate = parseOrZero(interestRate)

	const R = parsedInterestRate / 1200
	const n = parseOrZero(months)
	const pv = parseOrZero(loanAmount)

	if (!parsedInterestRate) {
		return (pv / n).toFixed(2)
	}

	const payment = ((pv * R) / (1 - Math.pow(1 + R, n * -1))).toFixed(2)

	return payment
}

const calcLoanAmount = (
	purchasePrice: NumberOrString,
	fees: NumberOrString,
	downPayment: NumberOrString,
	salesTaxAmount: NumberOrString
) => {
	return (
		parseOrZero(purchasePrice) +
		parseOrZero(fees) +
		parseOrZero(salesTaxAmount) -
		parseOrZero(downPayment)
	).toFixed(2)
}

const calcPaymentsTotal = (
	months: NumberOrString,
	monthlyPayment: NumberOrString
) => {
	return (parseOrZero(months) * parseOrZero(monthlyPayment)).toFixed(2)
}

const calcGrandTotal = (
	monthlyPayment: NumberOrString,
	months: NumberOrString,
	downPayment: NumberOrString
) => {
	return (
		parseOrZero(monthlyPayment) * parseOrZero(months) +
		parseOrZero(downPayment)
	).toFixed(2)
}

const calcMonthlyInterestAmount = (
	currentBalance: NumberOrString,
	interestRate: NumberOrString
) => {
	const interest =
		(parseOrZero(currentBalance) * parseOrZero(interestRate)) / 100 / 12
	const rounded = Math.round(interest * 100) / 100
	return rounded.toFixed(2)
}

const calcMonthlyPrincipalAmount = (
	monthlyInterestAmount: NumberOrString,
	totalPaidForMonth: NumberOrString
) => {
	const principal =
		parseOrZero(totalPaidForMonth) - parseOrZero(monthlyInterestAmount)
	const rounded = Math.round(principal * 100) / 100
	return rounded.toFixed(2)
}

export const calculateAmortization = (
	v: any,
	useExtraPayments: boolean = false
) => {
	/**
	 * calculate:
	 *  * month (date of payment)
	 *  * payment amount (would be the same every month)
	 *  * extra amount
	 *  * total paid for month
	 *  * remaining balance
	 *  * amount going towards principal
	 *  * amount going towards interest
	 *  * LTV (loan-to-value)
	 */
	const months = parseOrZero(v[FINANCE_FORM_FIELDS.FINANCE_TERM])
	const monthlyPayment = parseOrZero(v[FINANCE_FORM_FIELDS.MONTHLY_PAYMENT])
	const loanAmount = parseOrZero(v[FINANCE_FORM_FIELDS.LOAN_AMOUNT])
	const startDateObj = v[FINANCE_FORM_FIELDS.START_DATE]
	const interestRate = parseOrZero(v[FINANCE_FORM_FIELDS.INTEREST_RATE])
	const purchasePrice = parseOrZero(v[FINANCE_FORM_FIELDS.PURCHASE_PRICE])
	const extraPayments = v[FINANCE_FORM_FIELDS.EXTRA_PAYMENTS] ?? []

	const startDateString = startDateObj?.toString() ?? new Date().toISOString()

	const newDate = new Date(startDateString)
	const startDate = new Date(
		newDate.valueOf() + newDate.getTimezoneOffset() * 60 * 1000
	)

	const payments = [...new Array(months)]
		.map((_, monthIndex: number) => monthIndex)
		.reduce((pastMonthlyPayments, currentPaymentMonthIndex) => {
			const currentBalance =
				currentPaymentMonthIndex === 0
					? loanAmount
					: pastMonthlyPayments.slice(-1)[0]?.remainingBalance ?? 0

			if (parseFloat(currentBalance) <= 0) {
				return pastMonthlyPayments
			}

			const paymentDate = addMonths(startDate, currentPaymentMonthIndex)
			const month = MONTHS[paymentDate.getMonth()]
			const year = paymentDate.getFullYear()

			let extraPaymentAmount = 0

			if (useExtraPayments) {
				const applicableExtraPayments = extraPayments
					.filter(
						(ep: any) =>
							ep.startMonth !== null &&
							ep.startMonth !== '' &&
							ep.endMonth !== null &&
							ep.endMonth !== ''
					)
					.filter(
						(ep: any) =>
							currentPaymentMonthIndex >= ep.startMonth - 1 &&
							currentPaymentMonthIndex <= ep.endMonth - 1
					)

				extraPaymentAmount = applicableExtraPayments.reduce(
					(acc: number, cur: any) => acc + parseOrZero(cur.paymentAmount),
					0
				)
			}

			const monthlyInterestAmount = calcMonthlyInterestAmount(
				currentBalance,
				interestRate
			)

			let totalPaidForMonth = (
				parseOrZero(monthlyPayment) + parseOrZero(extraPaymentAmount)
			).toFixed(2)

			if (
				parseOrZero(totalPaidForMonth) >
				parseOrZero(currentBalance) + parseOrZero(monthlyInterestAmount)
			) {
				totalPaidForMonth = (
					parseOrZero(currentBalance) + parseOrZero(monthlyInterestAmount)
				).toFixed(2)
			}

			const monthlyPrincipalAmount = calcMonthlyPrincipalAmount(
				monthlyInterestAmount,
				totalPaidForMonth
			)

			let remainingBalance = (
				parseOrZero(currentBalance) - parseOrZero(monthlyPrincipalAmount)
			).toFixed(2)

			if (parseFloat(remainingBalance) < 0) {
				remainingBalance = (0).toFixed(2)
			}

			const loanToValue = (
				(parseFloat(remainingBalance) / purchasePrice) *
				100
			).toFixed(2)

			const paymentDetails = {
				paymentNumber: currentPaymentMonthIndex + 1,
				month,
				year,
				paymentAmount: monthlyPayment,
				extraPaymentAmount,
				totalPaidForMonth,
				remainingBalance,
				monthlyInterestAmount,
				monthlyPrincipalAmount,
				loanToValue,
			}

			pastMonthlyPayments.push(paymentDetails as never)

			return pastMonthlyPayments
		}, [])

	return payments
}

const getTotalPrincipal = (amortization: any) => {
	return (
		Math.round(
			(!!amortization
				? amortization.reduce(
						(acc: number, cur: any) =>
							acc + parseOrZero(cur.monthlyPrincipalAmount),
						0
				  )
				: 0) * 100
		) / 100
	)
}

const getTotalInterest = (amortization: any) => {
	return (
		Math.round(
			(!!amortization
				? amortization.reduce(
						(acc: number, cur: any) =>
							acc + parseOrZero(cur.monthlyInterestAmount),
						0
				  )
				: 0) * 100
		) / 100
	)
}

const getTotalExtraPayments = (amortization: any) => {
	return (
		Math.round(
			amortization.reduce(
				(acc: number, cur: any) => acc + parseOrZero(cur.extraPaymentAmount),
				0
			) * 100
		) / 100
	)
}

const getGrandTotal = (amortization: any) => {
	return (
		Math.round(
			amortization.reduce(
				(acc: number, cur: any) => acc + parseOrZero(cur.totalPaidForMonth),
				0
			) * 100
		) / 100
	)
}

export const runFinancingCalculations = (v: any) => {
	const purchasePrice = calcPurchasePrice(
		v[FINANCE_FORM_FIELDS.MSRP],
		v[FINANCE_FORM_FIELDS.DISCOUNTS],
		v[FINANCE_FORM_FIELDS.REBATES]
	)
	v[FINANCE_FORM_FIELDS.PURCHASE_PRICE] = purchasePrice

	const salesTaxAmount = calcSalesTaxAmount(
		v[FINANCE_FORM_FIELDS.MSRP],
		v[FINANCE_FORM_FIELDS.DISCOUNTS],
		v[FINANCE_FORM_FIELDS.SALES_TAX_PERCENT]
	)
	v[FINANCE_FORM_FIELDS.SALES_TAX_AMOUNT] = salesTaxAmount.toString()

	const loanAmount = calcLoanAmount(
		v[FINANCE_FORM_FIELDS.PURCHASE_PRICE],
		v[FINANCE_FORM_FIELDS.FEES],
		v[FINANCE_FORM_FIELDS.DOWN_PAYMENT],
		v[FINANCE_FORM_FIELDS.SALES_TAX_AMOUNT]
	)
	v[FINANCE_FORM_FIELDS.LOAN_AMOUNT] = loanAmount

	const monthlyPayment = calcMonthlyPayment(
		v[FINANCE_FORM_FIELDS.INTEREST_RATE],
		v[FINANCE_FORM_FIELDS.FINANCE_TERM],
		v[FINANCE_FORM_FIELDS.LOAN_AMOUNT]
	)
	v[FINANCE_FORM_FIELDS.MONTHLY_PAYMENT] = !isFinite(parseFloat(monthlyPayment))
		? null
		: monthlyPayment

	const interestAmount = calcInterestAmount(
		v[FINANCE_FORM_FIELDS.LOAN_AMOUNT],
		v[FINANCE_FORM_FIELDS.FINANCE_TERM],
		v[FINANCE_FORM_FIELDS.MONTHLY_PAYMENT]
	)
	v[FINANCE_FORM_FIELDS.INTEREST_AMOUNT] = interestAmount

	const paymentsTotal = calcPaymentsTotal(
		v[FINANCE_FORM_FIELDS.FINANCE_TERM],
		v[FINANCE_FORM_FIELDS.MONTHLY_PAYMENT]
	)
	v[FINANCE_FORM_FIELDS.PAYMENTS_TOTAL] = paymentsTotal

	v[FINANCE_FORM_FIELDS.BASE_AMORTIZATION] = calculateAmortization(v, false)
	v[FINANCE_FORM_FIELDS.REDUCED_AMORTIZATION] = calculateAmortization(v, true)

	let baseAmortizationDetails = {
		totalPrincipal: 0,
		totalInterest: 0,
		totalExtraPayments: 0,
		grandTotal: 0,
	}
	let reducedAmortizationDetails = {
		totalPrincipal: 0,
		totalInterest: 0,
		totalExtraPayments: 0,
		grandTotal: 0,
		termReductionInMonths: 0,
	}

	/**
	 * base amortization calcs
	 */
	baseAmortizationDetails.totalPrincipal = getTotalPrincipal(
		v[FINANCE_FORM_FIELDS.BASE_AMORTIZATION]
	)
	baseAmortizationDetails.totalInterest = getTotalInterest(
		v[FINANCE_FORM_FIELDS.BASE_AMORTIZATION]
	)
	// baseAmortizationDetails.totalExtraPayments = 0; // not needed as the base is calculated without extra payments
	baseAmortizationDetails.grandTotal = getGrandTotal(
		v[FINANCE_FORM_FIELDS.BASE_AMORTIZATION]
	)

	/**
	 * reduced amortization calcs
	 */
	reducedAmortizationDetails.totalPrincipal = getTotalPrincipal(
		v[FINANCE_FORM_FIELDS.REDUCED_AMORTIZATION]
	)
	reducedAmortizationDetails.totalInterest = getTotalInterest(
		v[FINANCE_FORM_FIELDS.REDUCED_AMORTIZATION]
	)
	reducedAmortizationDetails.totalExtraPayments = getTotalExtraPayments(
		v[FINANCE_FORM_FIELDS.REDUCED_AMORTIZATION]
	)
	reducedAmortizationDetails.grandTotal = getGrandTotal(
		v[FINANCE_FORM_FIELDS.REDUCED_AMORTIZATION]
	)
	reducedAmortizationDetails.termReductionInMonths =
		v[FINANCE_FORM_FIELDS.BASE_AMORTIZATION].length -
		v[FINANCE_FORM_FIELDS.REDUCED_AMORTIZATION].length

	v[FINANCE_FORM_FIELDS.BASE_AMORTIZATION_DETAILS] = baseAmortizationDetails
	v[FINANCE_FORM_FIELDS.REDUCED_AMORTIZATION_DETAILS] =
		reducedAmortizationDetails

	for (const key in v) {
		const isNum = !isNaN(v[key])

		if (!isNum) continue

		v[key] = parseOrZero(v[key], 2)
	}

	return v
}
