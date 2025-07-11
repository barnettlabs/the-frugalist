import { PrismaClient } from '@prisma/client'
import protectRoute from '../../utils/protectRoute'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const { user } = await protectRoute(event)

	return prisma.vehicleLeaseSheets.findMany({
		where: {
			userId: user.id,
		},
	})
})
