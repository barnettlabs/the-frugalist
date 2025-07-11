import { PrismaClient } from '@prisma/client'
// import protectRoute from '../../utils/protectRoute'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	// const { user } = await protectRoute(event)
	const sheetId = Number(getRouterParam(event, 'id'))
	const body = await readBody(event)
	const data = JSON.parse(body)

	if (data.id !== sheetId) {
		throw new Error('ID in request body does not match ID in URL')
	}

	return prisma.vehicleFinanceSheets.update({
		data,
		where: {
			id: sheetId,
		},
	})
})
