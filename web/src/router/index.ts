import { createRouter, createWebHistory } from 'vue-router';

import { routes } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';
import { applySeoToDocument, seoForRoute } from '@/utils/seo';

const router = createRouter({
	history: createWebHistory('/'),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		}
		return { top: 0 };
	},
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();

	// Initialize auth state if not done
	if (!authStore.initialized) {
		await authStore.initialize();
	}

	const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
	const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
	const isGuestOnly = to.matched.some(record => record.meta.guest);

	if (requiresAuth && !authStore.isAuthenticated) {
		// Redirect to login if trying to access protected route
		next({ name: 'login', query: { redirect: to.fullPath } });
	} else if (requiresAdmin && !authStore.isAdmin) {
		// Authenticated but not an admin — bounce to dashboard
		next({ name: 'dashboard' });
	} else if (isGuestOnly && authStore.isAuthenticated && to.name !== 'welcome') {
		// Redirect to dashboard if authenticated user tries to access guest-only route
		next({ name: 'dashboard' });
	} else {
		next();
	}
});

/*
 * Keep title, description, canonical, social cards, and JSON-LD in step with
 * the current route. Prerendered pages already ship these tags; this keeps them
 * correct once the SPA takes over navigation.
 */
router.afterEach(to => {
	applySeoToDocument(seoForRoute(to));
});

export default router;
