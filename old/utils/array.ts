export const chunkArray = (array: any[], chunkSize: number) => {
	return [...new Array(Math.ceil(array.length / chunkSize))].map(
		(_, blockIndex) =>
			array.slice(blockIndex * chunkSize, (blockIndex + 1) * chunkSize)
	)
}
