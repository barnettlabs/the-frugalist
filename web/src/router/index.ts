import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

// Layouts
const AuthenticatedLayout = () => import('@/layouts/AuthenticatedLayout.vue');
const GuestLayout = () => import('@/layouts/GuestLayout.vue');
const AuthLayout = () => import('@/layouts/AuthLayout.vue');
const AdminLayout = () => import('@/layouts/AdminLayout.vue');

// Admin Pages (lazy-loaded)
const AdminDashboard = () => import('@/pages/admin/Dashboard.vue');
const AdminRetailers = () => import('@/pages/admin/retailers/Index.vue');
const AdminAnnouncements = () => import('@/pages/admin/announcements/Index.vue');
const AdminUsers = () => import('@/pages/admin/users/Index.vue');
const AdminUserShow = () => import('@/pages/admin/users/Show.vue');
const AdminBugReports = () => import('@/pages/admin/bug-reports/Index.vue');
const AdminBugReportShow = () => import('@/pages/admin/bug-reports/Show.vue');
const AdminAiProviders = () => import('@/pages/admin/ai/Providers.vue');
const AdminAiAgents = () => import('@/pages/admin/ai/Agents.vue');
const AdminAiInvocations = () => import('@/pages/admin/ai/Invocations.vue');

// Auth Pages
const Login = () => import('@/pages/auth/Login.vue');
const Register = () => import('@/pages/auth/Register.vue');
const ForgotPassword = () => import('@/pages/auth/ForgotPassword.vue');
const ResetPassword = () => import('@/pages/auth/ResetPassword.vue');
const VerifyEmail = () => import('@/pages/auth/VerifyEmail.vue');

// Main Pages
const Dashboard = () => import('@/pages/Dashboard.vue');
const Welcome = () => import('@/pages/Welcome.vue');
const Profile = () => import('@/pages/profile/Edit.vue');

// Estimates
const EstimatesIndex = () => import('@/pages/estimates/Index.vue');

// Estimates - Finance
const FinanceIndex = () => import('@/pages/estimates/financing/Index.vue');
const FinanceDetails = () => import('@/pages/estimates/financing/Details.vue');
const FinanceCompare = () => import('@/pages/estimates/financing/Compare.vue');

// Estimates - Lease
const LeaseIndex = () => import('@/pages/estimates/leasing/Index.vue');
const LeaseDetails = () => import('@/pages/estimates/leasing/Details.vue');
const LeaseCompare = () => import('@/pages/estimates/leasing/Compare.vue');

// Learning
const LearningIndex = () => import('@/pages/learning/Index.vue');
const LearningShow = () => import('@/pages/learning/Show.vue');

// Watch (Price Tracker)
const WatchIndex = () => import('@/pages/watch/Index.vue');
const WatchCreate = () => import('@/pages/watch/Create.vue');
const WatchDetails = () => import('@/pages/watch/Details.vue');

// Playground (Dev/Admin only)
const PlaygroundEmail = () => import('@/pages/playground/Email.vue');

// Legal & Other
const Privacy = () => import('@/pages/Privacy.vue');
const Terms = () => import('@/pages/Terms.vue');
const Disclaimers = () => import('@/pages/Disclaimers.vue');
const ComingSoon = () => import('@/pages/ComingSoon.vue');
const Review = () => import('@/pages/Review.vue');

// Debug
const UiDebug = () => import('@/pages/debug/Ui.vue');

const routes: RouteRecordRaw[] = [
	// Welcome page (standalone - has its own header/footer)
	{
		path: '/',
		name: 'welcome',
		component: Welcome,
		meta: { guest: true },
	},

	// Public routes with GuestLayout
	{
		path: '/',
		component: GuestLayout,
		children: [
			{
				path: 'privacy',
				name: 'privacy',
				component: Privacy,
			},
			{
				path: 'terms',
				name: 'terms',
				component: Terms,
			},
		],
	},

	// Auth routes (guest only)
	{
		path: '/',
		component: AuthLayout,
		meta: { guest: true },
		children: [
			{
				path: 'login',
				name: 'login',
				component: Login,
			},
			{
				path: 'register',
				name: 'register',
				component: Register,
			},
			{
				path: 'forgot-password',
				name: 'password.request',
				component: ForgotPassword,
			},
			{
				path: 'reset-password/:token',
				name: 'password.reset',
				component: ResetPassword,
			},
		],
	},

	// Authenticated routes
	{
		path: '/',
		component: AuthenticatedLayout,
		meta: { requiresAuth: true },
		children: [
			{
				path: 'dashboard',
				name: 'dashboard',
				component: Dashboard,
				meta: { breadcrumb: 'Dashboard' },
			},
			{
				path: 'profile',
				name: 'profile.edit',
				component: Profile,
				meta: { breadcrumb: 'Profile' },
			},
			{
				path: 'verify-email',
				name: 'verification.notice',
				component: VerifyEmail,
				meta: { breadcrumb: 'Verify Email' },
			},
			{
				path: 'coming-soon',
				name: 'coming-soon',
				component: ComingSoon,
				meta: { breadcrumb: 'Coming Soon' },
			},
			{
				path: 'disclaimers',
				name: 'disclaimers',
				component: Disclaimers,
				meta: { breadcrumb: 'Disclaimers' },
			},

			// Compute Landing
			{
				path: 'estimates',
				name: 'estimates.index',
				component: EstimatesIndex,
				meta: { breadcrumb: 'Compute' },
			},

			// Compute - Finance
			{
				path: 'estimates/financing',
				name: 'estimates.financing.index',
				component: FinanceIndex,
				meta: { breadcrumb: 'Financing', parent: 'estimates.index' },
			},
			{
				path: 'estimates/financing/create',
				name: 'estimates.financing.create',
				component: FinanceDetails,
				meta: { breadcrumb: 'Create', parent: 'estimates.financing.index' },
			},
			{
				path: 'estimates/financing/:id/edit',
				name: 'estimates.financing.edit',
				component: FinanceDetails,
				props: true,
				meta: { breadcrumb: 'Edit', parent: 'estimates.financing.index' },
			},
			{
				path: 'estimates/financing/compare',
				name: 'estimates.financing.compare',
				component: FinanceCompare,
				meta: { breadcrumb: 'Compare', parent: 'estimates.financing.index' },
			},

			// Compute - Lease
			{
				path: 'estimates/leasing',
				name: 'estimates.leasing.index',
				component: LeaseIndex,
				meta: { breadcrumb: 'Leasing', parent: 'estimates.index' },
			},
			{
				path: 'estimates/leasing/create',
				name: 'estimates.leasing.create',
				component: LeaseDetails,
				meta: { breadcrumb: 'Create', parent: 'estimates.leasing.index' },
			},
			{
				path: 'estimates/leasing/:id/edit',
				name: 'estimates.leasing.edit',
				component: LeaseDetails,
				props: true,
				meta: { breadcrumb: 'Edit', parent: 'estimates.leasing.index' },
			},
			{
				path: 'estimates/leasing/compare',
				name: 'estimates.leasing.compare',
				component: LeaseCompare,
				meta: { breadcrumb: 'Compare', parent: 'estimates.leasing.index' },
			},

			// Guides Landing
			{
				path: 'learning',
				name: 'learning.index',
				component: LearningIndex,
				meta: { breadcrumb: 'Guides' },
			},

			// Guides
			{
				path: 'learning/:type',
				name: 'learning.show',
				component: LearningShow,
				props: true,
				meta: {
					breadcrumb: (route: any) => (route.params.type === 'financing' ? 'Financing' : 'Leasing'),
					parent: 'learning.index',
				},
			},

			// Watch
			{
				path: 'watch',
				name: 'watch.index',
				component: WatchIndex,
				meta: { breadcrumb: 'Watch' },
			},
			{
				path: 'watch/create',
				name: 'watch.create',
				component: WatchCreate,
				meta: { breadcrumb: 'Add Item', parent: 'watch.index' },
			},
			{
				path: 'watch/:id',
				name: 'watch.show',
				component: WatchDetails,
				props: true,
				meta: { breadcrumb: 'Details', parent: 'watch.index' },
			},

			// Review (Coming Soon)
			{
				path: 'review',
				name: 'review',
				component: Review,
				meta: { breadcrumb: 'Review' },
			},

			// Playground (Dev/Admin only)
			{
				path: 'playground/email',
				name: 'playground.email',
				component: PlaygroundEmail,
				meta: { breadcrumb: 'Email Playground' },
			},
		],
	},

	// Admin routes (auth + admin-gated)
	{
		path: '/admin',
		component: AdminLayout,
		meta: { requiresAuth: true, requiresAdmin: true },
		children: [
			{ path: '', name: 'admin.dashboard', component: AdminDashboard },
			{ path: 'retailers', name: 'admin.retailers', component: AdminRetailers },
			{ path: 'announcements', name: 'admin.announcements', component: AdminAnnouncements },
			{ path: 'users', name: 'admin.users', component: AdminUsers },
			{ path: 'users/:id', name: 'admin.users.show', component: AdminUserShow, props: true },
			{ path: 'bug-reports', name: 'admin.bug-reports', component: AdminBugReports },
			{ path: 'bug-reports/:id', name: 'admin.bug-reports.show', component: AdminBugReportShow, props: true },
			{ path: 'ai/providers', name: 'admin.ai.providers', component: AdminAiProviders },
			{ path: 'ai/agents', name: 'admin.ai.agents', component: AdminAiAgents },
			{ path: 'ai/invocations', name: 'admin.ai.invocations', component: AdminAiInvocations },
		],
	},

	// Debug UI page (excluded from sitemap)
	{
		path: '/__ui',
		name: 'debug.ui',
		component: UiDebug,
		meta: {
			excludeFromSitemap: true,
			robots: 'noindex, nofollow',
		},
	},

	// Catch all - redirect to dashboard or welcome
	{
		path: '/:pathMatch(.*)*',
		redirect: '/',
	},
];

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

export default router;
