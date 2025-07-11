export const formatPhoneNumber = (phoneNumber) => {
	var phoneParts = phoneNumber
		.replace(/\D/g, '')
		.match(/(\d{0,3})(\d{0,3})(\d{0,4})/)

	const formatted = !phoneParts[2]
		? phoneParts[1]
		: '(' +
		  phoneParts[1] +
		  ') ' +
		  phoneParts[2] +
		  (phoneParts[3] ? '-' + phoneParts[3] : '')

	return formatted
}

// export const formatMoney = (amount) => {
// 	return amount.toLocaleString('en-US', {
// 		style: 'currency',
// 		currency: 'USD',
// 	})
// }

export const extractNumbers = (value) => {
	const stringValue = typeof value === 'number' ? value.toString() : value

	return stringValue ? stringValue.replace(/\D/g, '') : ''
}

export const insertThousandsSeparator = (value) => {
	const stringValue = typeof value === 'number' ? value.toString() : value

	return stringValue ? stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
}

export const formatNumberInput = (value) => {
	const stringValue = typeof value === 'number' ? value.toString() : value

	const hasDecimal = stringValue.includes('.')
	const [wholeNumber, decimalNumber] = stringValue.split('.')

	const formattedWholeNumber = insertThousandsSeparator(
		extractNumbers(wholeNumber)
	)
	const formattedDecimalNumber = extractNumbers(decimalNumber)

	const formatted = hasDecimal
		? formattedWholeNumber + '.' + formattedDecimalNumber
		: formattedWholeNumber

	return formatted
}
