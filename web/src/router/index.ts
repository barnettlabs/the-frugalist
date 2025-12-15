import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
const AuthenticatedLayout = () => import('@/layouts/AuthenticatedLayout.vue')
const GuestLayout = () => import('@/layouts/GuestLayout.vue')
const AuthLayout = () => import('@/layouts/AuthLayout.vue')

// Auth Pages
const Login = () => import('@/pages/auth/Login.vue')
const Register = () => import('@/pages/auth/Register.vue')
const ForgotPassword = () => import('@/pages/auth/ForgotPassword.vue')
const ResetPassword = () => import('@/pages/auth/ResetPassword.vue')
const VerifyEmail = () => import('@/pages/auth/VerifyEmail.vue')

// Main Pages
const Dashboard = () => import('@/pages/Dashboard.vue')
const Welcome = () => import('@/pages/Welcome.vue')
const Profile = () => import('@/pages/profile/Edit.vue')

// Estimates - Finance
const FinanceIndex = () => import('@/pages/estimates/financing/Index.vue')
const FinanceDetails = () => import('@/pages/estimates/financing/Details.vue')
const FinanceCompare = () => import('@/pages/estimates/financing/Compare.vue')

// Estimates - Lease
const LeaseIndex = () => import('@/pages/estimates/leasing/Index.vue')
const LeaseDetails = () => import('@/pages/estimates/leasing/Details.vue')
const LeaseCompare = () => import('@/pages/estimates/leasing/Compare.vue')

// Learning
const LearningShow = () => import('@/pages/learning/Show.vue')

// Price Tracker
const PriceTrackerIndex = () => import('@/pages/price-tracker/Index.vue')
const PriceTrackerCreate = () => import('@/pages/price-tracker/Create.vue')
const PriceTrackerDetails = () => import('@/pages/price-tracker/Details.vue')

// Legal & Other
const Privacy = () => import('@/pages/Privacy.vue')
const Terms = () => import('@/pages/Terms.vue')
const Disclaimers = () => import('@/pages/Disclaimers.vue')
const ComingSoon = () => import('@/pages/ComingSoon.vue')

const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    component: GuestLayout,
    children: [
      {
        path: '',
        name: 'welcome',
        component: Welcome,
        meta: { guest: true },
      },
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
      },
      {
        path: 'profile',
        name: 'profile.edit',
        component: Profile,
      },
      {
        path: 'verify-email',
        name: 'verification.notice',
        component: VerifyEmail,
      },
      {
        path: 'coming-soon',
        name: 'coming-soon',
        component: ComingSoon,
      },
      {
        path: 'disclaimers',
        name: 'disclaimers',
        component: Disclaimers,
      },

      // Estimates - Finance
      {
        path: 'estimates/financing',
        name: 'estimates.financing.index',
        component: FinanceIndex,
      },
      {
        path: 'estimates/financing/create',
        name: 'estimates.financing.create',
        component: FinanceDetails,
      },
      {
        path: 'estimates/financing/:id/edit',
        name: 'estimates.financing.edit',
        component: FinanceDetails,
        props: true,
      },
      {
        path: 'estimates/financing/compare',
        name: 'estimates.financing.compare',
        component: FinanceCompare,
      },

      // Estimates - Lease
      {
        path: 'estimates/leasing',
        name: 'estimates.leasing.index',
        component: LeaseIndex,
      },
      {
        path: 'estimates/leasing/create',
        name: 'estimates.leasing.create',
        component: LeaseDetails,
      },
      {
        path: 'estimates/leasing/:id/edit',
        name: 'estimates.leasing.edit',
        component: LeaseDetails,
        props: true,
      },
      {
        path: 'estimates/leasing/compare',
        name: 'estimates.leasing.compare',
        component: LeaseCompare,
      },

      // Learning
      {
        path: 'learning/:type',
        name: 'learning.show',
        component: LearningShow,
        props: true,
      },

      // Price Tracker
      {
        path: 'price-tracker',
        name: 'price-tracker.index',
        component: PriceTrackerIndex,
      },
      {
        path: 'price-tracker/create',
        name: 'price-tracker.create',
        component: PriceTrackerCreate,
      },
      {
        path: 'price-tracker/:id',
        name: 'price-tracker.show',
        component: PriceTrackerDetails,
        props: true,
      },
    ],
  },

  // Catch all - redirect to dashboard or welcome
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state if not done
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isGuestOnly = to.matched.some((record) => record.meta.guest)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if trying to access protected route
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (isGuestOnly && authStore.isAuthenticated && to.name !== 'welcome') {
    // Redirect to dashboard if authenticated user tries to access guest-only route
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
