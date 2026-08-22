import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

interface Options {
	/** Where signed-in users list their saved estimates, e.g. `/estimates/financing`. */
	savedListPath: string;
	/** Label for the back link shown to signed-in users. */
	savedListLabel: string;
}

/**
 * Guest handling shared by the three calculator pages.
 *
 * The calculators are public so search engines can index them and visitors can
 * use them without an account — every figure is computed in the browser. Only
 * *saving* an estimate needs an account, so that is the one action that pushes
 * a guest to sign in.
 */
export function useEstimateAccess({ savedListPath, savedListLabel }: Options) {
	const authStore = useAuthStore();
	const router = useRouter();
	const route = useRoute();

	const isAuthenticated = computed(() => authStore.isAuthenticated);

	// Guests have no saved-estimate list, so their back link goes to the calculator index.
	const backUrl = computed(() => (isAuthenticated.value ? savedListPath : '/estimates'));
	const backLabel = computed(() => (isAuthenticated.value ? savedListLabel : 'All calculators'));

	/**
	 * Guards an action that hits the API. Returns false for guests, after
	 * sending them to sign in with a redirect back to the calculator they were
	 * using — their inputs are lost, but a 401 would lose them anyway.
	 */
	const ensureAccount = (): boolean => {
		if (isAuthenticated.value) return true;
		router.push({ name: 'login', query: { redirect: route.fullPath } });
		return false;
	};

	return { isAuthenticated, backUrl, backLabel, ensureAccount };
}
