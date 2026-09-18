import type { RouteRecordRaw } from 'vue-router';

import { learningContentMap } from '@/data/learningContent';
import {
	breadcrumbSchema,
	definedTermSetSchema,
	faqSchema,
	organizationSchema,
	webApplicationSchema,
	websiteSchema,
} from '@/utils/structured-data';

// Layouts
const AuthenticatedLayout = () => import('@/layouts/AuthenticatedLayout.vue');
const GuestLayout = () => import('@/layouts/GuestLayout.vue');
const AuthLayout = () => import('@/layouts/AuthLayout.vue');
const AdminLayout = () => import('@/layouts/AdminLayout.vue');
const PublicContentLayout = () => import('@/layouts/PublicContentLayout.vue');

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

// Estimates - Mortgage
const MortgageIndex = () => import('@/pages/estimates/mortgage/Index.vue');
const MortgageDetails = () => import('@/pages/estimates/mortgage/Details.vue');

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

/**
 * Routes carrying `meta.seo` are the public, indexable surface: they are
 * prerendered at build time and listed in `sitemap.xml`. Everything else
 * resolves to `noindex, nofollow` and is omitted from both — see
 * `resolveSeo` in `@/utils/seo`.
 *
 * Dynamic routes additionally declare `meta.seoPaths` so the build knows which
 * concrete URLs to render.
 */
export const routes: RouteRecordRaw[] = [
	// Welcome page (standalone - has its own header/footer)
	{
		path: '/',
		name: 'welcome',
		component: Welcome,
		meta: {
			guest: true,
			seo: {
				title: 'TheFrugalist — Track prices, run the numbers, stop overpaying',
				description:
					'Free vehicle finance, lease, and mortgage calculators plus plain-language guides to dealer pricing tactics. Track price drops and know what a deal should actually cost.',
				jsonLd: [organizationSchema(), websiteSchema()],
			},
		},
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
				meta: {
					seo: {
						title: 'Privacy Policy | TheFrugalist',
						description: 'How TheFrugalist collects, uses, and protects your data across the web app and mobile apps.',
					},
				},
			},
			{
				path: 'terms',
				name: 'terms',
				component: Terms,
				meta: {
					seo: {
						title: 'Terms of Service | TheFrugalist',
						description: 'The terms that govern your use of TheFrugalist price tracking and estimate tools.',
					},
				},
			},
		],
	},

	/*
	 * Public content routes.
	 *
	 * The guides and the calculators are the site's entire organic search
	 * surface, so they must work signed-out. The calculators compute locally
	 * and only need an account to *save* an estimate; the saved-estimate lists
	 * stay behind auth in the group below.
	 */
	{
		path: '/',
		component: PublicContentLayout,
		children: [
			{
				path: 'estimates',
				name: 'estimates.index',
				component: EstimatesIndex,
				meta: {
					breadcrumb: 'Compute',
					seo: {
						title: 'Free Finance, Lease & Mortgage Calculators | TheFrugalist',
						description:
							'Run any vehicle loan, lease, or mortgage offer through a free calculator. Monthly payment, total interest, money factor to APR, amortization — no account required.',
						jsonLd: [
							breadcrumbSchema([
								{ name: 'Home', path: '/' },
								{ name: 'Calculators', path: '/estimates' },
							]),
						],
					},
				},
			},
			{
				path: 'estimates/financing/create',
				name: 'estimates.financing.create',
				component: FinanceDetails,
				meta: {
					breadcrumb: 'Create',
					parent: 'estimates.financing.index',
					seo: {
						title: 'Car Loan Calculator — Payment & Amortization | TheFrugalist',
						description:
							'Calculate a vehicle loan payment from MSRP, down payment, APR, term, taxes, and fees. See total interest, a full amortization schedule, and the impact of extra payments.',
						jsonLd: [
							webApplicationSchema({
								name: 'Car Loan Calculator',
								description:
									'Calculate vehicle financing payments, total interest, and amortization from MSRP, APR, term, trade-in, taxes, and dealer fees.',
								path: '/estimates/financing/create',
								features: [
									'Monthly payment breakdown',
									'Total interest cost',
									'Full amortization schedule',
									'Extra payment impact',
									'Trade-in and rebate handling',
								],
							}),
							breadcrumbSchema([
								{ name: 'Home', path: '/' },
								{ name: 'Calculators', path: '/estimates' },
								{ name: 'Car Loan Calculator', path: '/estimates/financing/create' },
							]),
						],
					},
				},
			},
			{
				path: 'estimates/leasing/create',
				name: 'estimates.leasing.create',
				component: LeaseDetails,
				meta: {
					breadcrumb: 'Create',
					parent: 'estimates.leasing.index',
					seo: {
						title: 'Car Lease Calculator — Money Factor to APR | TheFrugalist',
						description:
							'Work out a car lease payment from capitalized cost, residual value, and money factor. Convert money factor to APR and see the true total cost before you sign.',
						jsonLd: [
							webApplicationSchema({
								name: 'Car Lease Calculator',
								description:
									'Calculate lease payments from capitalized cost, residual value, money factor, and term, including the money factor to APR conversion.',
								path: '/estimates/leasing/create',
								features: [
									'Money factor to APR conversion',
									'Residual value analysis',
									'Total lease cost',
									'Buyout analysis',
									'Depreciation and rent charge split',
								],
							}),
							breadcrumbSchema([
								{ name: 'Home', path: '/' },
								{ name: 'Calculators', path: '/estimates' },
								{ name: 'Car Lease Calculator', path: '/estimates/leasing/create' },
							]),
						],
					},
				},
			},
			{
				path: 'estimates/mortgage/create',
				name: 'estimates.mortgage.create',
				component: MortgageDetails,
				meta: {
					breadcrumb: 'Create',
					parent: 'estimates.mortgage.index',
					seo: {
						title: 'Mortgage Calculator — Payment, Escrow & Extra Payments | TheFrugalist',
						description:
							'Estimate a full mortgage payment including principal, interest, property tax, insurance, and HOA. See how extra payments shorten the term and cut total interest.',
						jsonLd: [
							webApplicationSchema({
								name: 'Mortgage Calculator',
								description:
									'Estimate mortgage payments including principal, interest, taxes, insurance, and HOA, with extra payment and amortization analysis.',
								path: '/estimates/mortgage/create',
								features: [
									'Principal, interest, tax, and insurance',
									'Recurring and one-off expenses',
									'Extra payment impact',
									'Annual or monthly amortization',
									'Total cost of ownership',
								],
							}),
							breadcrumbSchema([
								{ name: 'Home', path: '/' },
								{ name: 'Calculators', path: '/estimates' },
								{ name: 'Mortgage Calculator', path: '/estimates/mortgage/create' },
							]),
						],
					},
				},
			},
			{
				path: 'learning',
				name: 'learning.index',
				component: LearningIndex,
				meta: {
					breadcrumb: 'Guides',
					seo: {
						title: 'Car Buying Guides — Financing & Leasing Explained | TheFrugalist',
						description:
							'Plain-language guides to vehicle financing and leasing: the terms, the dealer tactics, and the line items that quietly raise your monthly payment.',
						jsonLd: [
							breadcrumbSchema([
								{ name: 'Home', path: '/' },
								{ name: 'Guides', path: '/learning' },
							]),
						],
					},
				},
			},
			{
				path: 'learning/:type',
				name: 'learning.show',
				component: LearningShow,
				props: true,
				meta: {
					breadcrumb: (route: any) => (route.params.type === 'financing' ? 'Financing' : 'Leasing'),
					parent: 'learning.index',
					seoPaths: ['/learning/financing', '/learning/leasing'],
					seo: (route: any) => {
						const type = String(route.params.type);
						const content = learningContentMap[type];

						// Unknown guide slugs render an empty state — keep them out of the index.
						if (!content) {
							return { robots: 'noindex, follow' };
						}

						const path = `/learning/${type}`;
						const isFinancing = type === 'financing';

						return {
							type: 'article' as const,
							title: isFinancing
								? 'Vehicle Financing Guide — Terms & Dealer Tactics | TheFrugalist'
								: 'Vehicle Leasing Guide — Money Factor, Residual | TheFrugalist',
							description: isFinancing
								? 'Every vehicle financing term explained: APR, amortization, negative equity, LTV, dealer fees, and the add-ons that inflate your monthly payment.'
								: 'Every vehicle leasing term explained: money factor, residual value, capitalized cost, disposition fees, and mileage penalties — before you sign.',
							jsonLd: [
								definedTermSetSchema(content, path),
								faqSchema(content, path),
								breadcrumbSchema([
									{ name: 'Home', path: '/' },
									{ name: 'Guides', path: '/learning' },
									{ name: content.title, path },
								]),
							],
						};
					},
				},
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

			// Compute - Finance
			{
				path: 'estimates/financing',
				name: 'estimates.financing.index',
				component: FinanceIndex,
				meta: { breadcrumb: 'Financing', parent: 'estimates.index' },
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

			// Compute - Mortgage
			{
				path: 'estimates/mortgage',
				name: 'estimates.mortgage.index',
				component: MortgageIndex,
				meta: { breadcrumb: 'Mortgage', parent: 'estimates.index' },
			},
			{
				path: 'estimates/mortgage/:id/edit',
				name: 'estimates.mortgage.edit',
				component: MortgageDetails,
				props: true,
				meta: { breadcrumb: 'Edit', parent: 'estimates.mortgage.index' },
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

	// Debug UI page — no `meta.seo`, so it is noindex and absent from the sitemap
	{
		path: '/__ui',
		name: 'debug.ui',
		component: UiDebug,
	},

	// Catch all - redirect to dashboard or welcome
	{
		path: '/:pathMatch(.*)*',
		redirect: '/',
	},
];

/**
 * Every concrete URL that should be prerendered and listed in `sitemap.xml`.
 *
 * A route opts in by carrying `meta.seo`. Dynamic routes cannot be enumerated
 * from their pattern, so they declare their concrete URLs in `meta.seoPaths`.
 */
export function publicRoutePaths(): string[] {
	const paths: string[] = [];

	const join = (parent: string, child: string): string =>
		child.startsWith('/') ? child : `${parent.replace(/\/$/, '')}/${child}`;

	const walk = (records: readonly RouteRecordRaw[], parent: string): void => {
		for (const record of records) {
			const full = join(parent, record.path) || '/';

			if (record.meta?.seo) {
				const declared = record.meta.seoPaths as string[] | undefined;

				if (declared) {
					paths.push(...declared);
				} else if (!full.includes(':') && !full.includes('*')) {
					paths.push(full);
				}
			}

			if (record.children) walk(record.children, full);
		}
	};

	walk(routes, '');

	return [...new Set(paths)].sort();
}
