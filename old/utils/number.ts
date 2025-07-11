import type { NumberOrString } from '~/types'

export const isNumeric = (str) => {
	return (
		!isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str))
	) // ...and ensure strings of whitespace fail
}

export const parseOrZero = (num: NumberOrString, fixedDecimals?: number) => {
	if (!num) return 0

	const float = parseFloat(
		typeof num === 'string' ? num.replace(/,/g, '') : (num as any)
	)

	if (fixedDecimals !== undefined) {
		return parseFloat(float.toFixed(fixedDecimals))
	}

	return float
}
