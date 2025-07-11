import { PrismaClient } from '@prisma/client'
// import protectRoute from '../../utils/protectRoute'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const { user } = await protectRoute(event)
	const body = await readBody(event)
	const data = JSON.parse(body)

	return prisma.vehicleFinanceSheets.create({
		data: {
			...data,
			userId: user.id,
		},
	})
})
