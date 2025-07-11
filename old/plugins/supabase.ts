import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
	const config = useRuntimeConfig()

	const { supabaseUrl, supabaseKey } = config.public

	createClient(supabaseUrl, supabaseKey)
})
