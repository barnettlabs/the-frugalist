// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	devServer: {
		host: process.env.NUXT_PUBLIC_DEV_HOST ?? 'localhost',
		port: process.env.NUXT_PUBLIC_PORT ? parseInt(process.env.NUXT_PUBLIC_PORT) : 3000,
	},

	modules: [
		'@nuxtjs/supabase',
		'@nuxtjs/tailwindcss',
		'@nuxt/image',
		'@pinia/nuxt',
	],

	css: ['@/assets/css/tailwind.css'],

	supabase: {
		redirect: false,
	},

	build: {
		transpile: ['@vuepic/vue-datepicker'],
	},

	compatibilityDate: '2025-02-08',

	vite: {
		server: {
			allowedHosts: [process.env.NUXT_PUBLIC_DEV_HOST ?? 'localhost'],
		},
	},

	runtimeConfig: {
		public: {
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseKey: process.env.SUPABASE_KEY,
		},
	},
})
