import { LEASE_FORM_FIELDS } from '~/enums/forms'
import type { NumberOrString } from '~/types'
import { parseOrZero } from '../number'

const calcResidualAmount = (
	msrp: NumberOrString,
	residualPercent: NumberOrString
) => {
	return (parseOrZero(msrp) * (parseOrZero(residualPercent) / 100)).toFixed(2)
}

const calcResidualInterestOnlyPayment = (v: any) => {
	return (
		(parseOrZero(v[LEASE_FORM_FIELDS.RESIDUAL_AMOUNT]) *
			parseOrZero(v[LEASE_FORM_FIELDS.INTEREST_RATE])) /
		1200
	).toFixed(2)
}

const calcFinalDealerPrice = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.MSRP]) -
		parseOrZero(v[LEASE_FORM_FIELDS.DEALER_CONTRIBUTION]) -
		parseOrZero(v[LEASE_FORM_FIELDS.TRADE_IN])
	).toFixed(2)
}

const calcGrossCapCost = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.FINAL_DEALER_PRICE]) +
		parseOrZero(v[LEASE_FORM_FIELDS.DOC_FEE]) +
		parseOrZero(v[LEASE_FORM_FIELDS.ACQUISITION_FEE]) +
		parseOrZero(v[LEASE_FORM_FIELDS.MISC_FEES])
	).toFixed(2)
}

const calcNetCapCost = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.GROSS_CAP_COST]) -
		parseOrZero(v[LEASE_FORM_FIELDS.LEASE_CASH]) -
		parseOrZero(v[LEASE_FORM_FIELDS.DOWN_PAYMENT])
	).toFixed(2)
}

const calcPrincipalAmount = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.NET_CAP_COST]) -
		parseOrZero(v[LEASE_FORM_FIELDS.RESIDUAL_AMOUNT])
	).toFixed(2)
}

const calcMonthlyPrincipalPayment = (v: any) => {
	const presentValue = parseOrZero(v[LEASE_FORM_FIELDS.PRINCIPAL_AMOUNT])
	const apr = parseOrZero(v[LEASE_FORM_FIELDS.INTEREST_RATE])
	const n = parseOrZero(v[LEASE_FORM_FIELDS.LEASE_TERM])

	if (!v[LEASE_FORM_FIELDS.INTEREST_RATE]) return 0
	if (!v[LEASE_FORM_FIELDS.LEASE_TERM]) return 0

	const R = apr / 1200
	const paymentPandI = (presentValue * R) / (1 - Math.pow(1 + R, n * -1))

	return (
		paymentPandI +
		parseOrZero(v[LEASE_FORM_FIELDS.RESIDUAL_MONTHLY_INTEREST_PAYMENT])
	).toFixed(2)
}

const calcTotalSalesTax = (v: any) => {
	const salesTaxMultiplier =
		parseOrZero(v[LEASE_FORM_FIELDS.SALES_TAX_PERCENT]) / 100

	const rebateSalesTax =
		parseOrZero(v[LEASE_FORM_FIELDS.LEASE_CASH]) * salesTaxMultiplier
	const downPaymentSalesTax =
		parseOrZero(v[LEASE_FORM_FIELDS.DOWN_PAYMENT]) * salesTaxMultiplier
	const residualAndLoanPaymentSalesTax =
		parseOrZero(v[LEASE_FORM_FIELDS.PRINCIPAL_PAYMENT]) *
		parseOrZero(v[LEASE_FORM_FIELDS.LEASE_TERM]) *
		salesTaxMultiplier

	return (
		rebateSalesTax +
		downPaymentSalesTax +
		residualAndLoanPaymentSalesTax
	).toFixed(2)
}

const calcMonthlySalesTax = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.TOTAL_SALES_TAX]) /
		parseOrZero(v[LEASE_FORM_FIELDS.LEASE_TERM])
	).toFixed(2)
}

const calcLeasePayment = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.PRINCIPAL_PAYMENT]) +
		parseOrZero(v[LEASE_FORM_FIELDS.MONTHLY_SALES_TAX])
	).toFixed(2)
}

const calcCashDueAtSigning = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.DOWN_PAYMENT]) +
		parseOrZero(v[LEASE_FORM_FIELDS.LEASE_PAYMENT])
	).toFixed(2)
}

const calcInterestRate = (moneyFactor: NumberOrString) => {
	const mf = parseOrZero(moneyFactor)

	return parseOrZero(mf * 2400)
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

const calcTotalLeaseCost = (v: any) => {
	return (
		parseOrZero(v[LEASE_FORM_FIELDS.LEASE_PAYMENT]) *
			parseOrZero(v[LEASE_FORM_FIELDS.LEASE_TERM]) +
		parseOrZero(v[LEASE_FORM_FIELDS.DOWN_PAYMENT])
	).toFixed(2)
}

export const runLeasingCalculations = (v: any) => {
	const debug = false

	debug && console.clear()

	v[LEASE_FORM_FIELDS.INTEREST_RATE] = calcInterestRate(
		v[LEASE_FORM_FIELDS.MONEY_FACTOR]
	)
	debug && console.log(`money factor: ${v[LEASE_FORM_FIELDS.MONEY_FACTOR]}`)
	debug && console.log(`interest rate: ${v[LEASE_FORM_FIELDS.INTEREST_RATE]}`)

	// RESIDUAL
	v[LEASE_FORM_FIELDS.RESIDUAL_AMOUNT] = calcResidualAmount(
		v[LEASE_FORM_FIELDS.MSRP],
		v[LEASE_FORM_FIELDS.RESIDUAL_PERCENT]
	)
	debug && console.log(`residual: ${v[LEASE_FORM_FIELDS.RESIDUAL_AMOUNT]}`)

	v[LEASE_FORM_FIELDS.RESIDUAL_MONTHLY_INTEREST_PAYMENT] =
		calcResidualInterestOnlyPayment(v)
	debug &&
		console.log(
			`residual monthly interest amount: ${
				v[LEASE_FORM_FIELDS.RESIDUAL_MONTHLY_INTEREST_PAYMENT]
			}`
		)

	v[LEASE_FORM_FIELDS.FINAL_DEALER_PRICE] = calcFinalDealerPrice(v)
	debug &&
		console.log(
			`final dealer price: ${v[LEASE_FORM_FIELDS.FINAL_DEALER_PRICE]}`
		)

	v[LEASE_FORM_FIELDS.GROSS_CAP_COST] = calcGrossCapCost(v)
	debug && console.log(`gross cap cost: ${v[LEASE_FORM_FIELDS.GROSS_CAP_COST]}`)

	v[LEASE_FORM_FIELDS.NET_CAP_COST] = calcNetCapCost(v)
	debug && console.log(`net cap cost: ${v[LEASE_FORM_FIELDS.NET_CAP_COST]}`)

	// LOAN AMOUNT
	v[LEASE_FORM_FIELDS.PRINCIPAL_AMOUNT] = calcPrincipalAmount(v)
	debug && console.log(`loan amount: ${v[LEASE_FORM_FIELDS.PRINCIPAL_AMOUNT]}`)

	v[LEASE_FORM_FIELDS.PRINCIPAL_PAYMENT] = calcMonthlyPrincipalPayment(v)
	debug &&
		console.log(`principal payment: ${v[LEASE_FORM_FIELDS.PRINCIPAL_PAYMENT]}`)

	v[LEASE_FORM_FIELDS.TOTAL_SALES_TAX] = calcTotalSalesTax(v)
	debug &&
		console.log(`total sales tax: ${v[LEASE_FORM_FIELDS.TOTAL_SALES_TAX]}`)

	v[LEASE_FORM_FIELDS.MONTHLY_SALES_TAX] = calcMonthlySalesTax(v)
	debug &&
		console.log(`monthly sales tax: ${v[LEASE_FORM_FIELDS.MONTHLY_SALES_TAX]}`)

	v[LEASE_FORM_FIELDS.LEASE_PAYMENT] = calcLeasePayment(v)
	debug &&
		console.log(`final monthly payment: ${v[LEASE_FORM_FIELDS.LEASE_PAYMENT]}`)

	v[LEASE_FORM_FIELDS.CASH_DUE_AT_SIGNING] = calcCashDueAtSigning(v)
	debug &&
		console.log(
			`cash due at signing: ${v[LEASE_FORM_FIELDS.CASH_DUE_AT_SIGNING]}`
		)

	v[LEASE_FORM_FIELDS.TOTAL_LEASE_COST] = calcTotalLeaseCost(v)
	debug &&
		console.log(`total lease cost: ${v[LEASE_FORM_FIELDS.TOTAL_LEASE_COST]}`)

	for (const key in v) {
		const isNum = !isNaN(v[key])

		if (!isNum) continue

		v[key] = parseOrZero(v[key], 2)
	}

	return v
}
