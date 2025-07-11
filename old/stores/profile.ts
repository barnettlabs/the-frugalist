// import { defineStore } from 'pinia'

// export const useProfileStore = defineStore({
// 	id: 'profile-store',
// 	state: () => {
// 		return {
// 			profile: null,
// 		}
// 	},
// 	actions: {
// 		updateProfile(profile: any) {
// 			this.profile = profile
// 		},
// 	},
// 	getters: {
// 		profile: (state) => state.profile,
// 	},
// })

import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profileStore', () => {
	const profile = ref<any>(null)
	const loading = ref<boolean>(false)

	const user = useSupabaseUser()
	const supabase = useSupabaseClient()

	function updateProfile(newProfile: any) {
		profile.value = newProfile
	}

	async function refreshProfile() {
		loading.value = true

		if (user.value) {
			const { data, error } = await supabase
				.from('profiles')
				.select()
				.eq('id', user.value.id)
				.single()

			if (data) {
				updateProfile(data)
			}
		}

		loading.value = false
	}

	onMounted(() => {
		refreshProfile()
	})

	return {
		// values
		profile,
		loading,

		// actions
		updateProfile,
		refreshProfile,
	}
})
