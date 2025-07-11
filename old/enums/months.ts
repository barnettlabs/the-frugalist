export const MONTHS = [...Array(12).keys()].map((key) =>
	new Date(0, key).toLocaleString('en', { month: 'long' })
)
