import { serverSupabaseUser } from '#supabase/server'

// If the user does not exist on the request, throw a 401 error
export default async (event: any) => {
	const user = await serverSupabaseUser(event)

	if (!user) {
		throw createError({
			statusCode: 401,
			message: 'Unauthorized',
		})
	}

	return { user }
}
