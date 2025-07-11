import { PrismaClient } from '@prisma/client'
import protectRoute from '../../utils/protectRoute'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const { user } = await protectRoute(event)

	const id = getRouterParam(event, 'id')

	if (id === 'create') {
		return {}
	}

	const res = await prisma.vehicleLeaseSheets.findFirst({
		where: {
			AND: [
				{
					userId: user.id,
				},
				{
					id: Number(id),
				},
			],
		},
	})

	if (!res) {
		const error = new Error('Sheet not found')
		error.statusCode = 404
		throw error
	}

	return res
})
