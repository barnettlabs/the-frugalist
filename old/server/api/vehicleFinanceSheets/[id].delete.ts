import { PrismaClient } from '@prisma/client'
// import protectRoute from '../../utils/protectRoute'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	// const { user } = await protectRoute(event)
	const sheetId = Number(getRouterParam(event, 'id'))

	return prisma.vehicleFinanceSheets.delete({
		where: {
			id: sheetId,
		},
	})
})
