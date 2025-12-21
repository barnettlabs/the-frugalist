<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  TagIcon,
  BookOpenIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

const user = computed(() => authStore.user)
const fullName = computed(() => authStore.fullName)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, color: 'text-primary', bg: 'bg-primary/10' },
  { name: 'Finance Calculator', href: '/estimates/financing', icon: BanknotesIcon, color: 'text-primary', bg: 'bg-primary/10' },
  { name: 'Lease Calculator', href: '/estimates/leasing', icon: CurrencyDollarIcon, color: 'text-secondary', bg: 'bg-secondary/10' },
  { name: 'Price Tracker', href: '/price-tracker', icon: TagIcon, color: 'text-accent-dark', bg: 'bg-accent/10' },
  { name: 'Learn Financing', href: '/learning/financing', icon: BookOpenIcon, color: 'text-info', bg: 'bg-info/10' },
  { name: 'Learn Leasing', href: '/learning/leasing', icon: BookOpenIcon, color: 'text-info', bg: 'bg-info/10' },
]

const isActive = (href: string) => {
  if (href === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(href)
}

// Dynamic breadcrumb generation from route meta
const breadcrumbs = computed(() => {
  const crumbs: { name: string; href: string }[] = []

  // Helper to get breadcrumb label (handles string or function)
  const getLabel = (meta: any, currentRoute: any): string => {
    if (typeof meta.breadcrumb === 'function') {
      return meta.breadcrumb(currentRoute)
    }
    return meta.breadcrumb || ''
  }

  // Helper to find route by name
  const findRoute = (name: string) => {
    return router.getRoutes().find(r => r.name === name)
  }

  // Build breadcrumb chain by following parent references
  const buildChain = (routeName: string | symbol | null | undefined, currentRoute: any): { name: string; href: string }[] => {
    if (!routeName) return []

    const routeRecord = findRoute(routeName as string)
    if (!routeRecord) return []

    const chain: { name: string; href: string }[] = []

    // If this route has a parent, add parent's chain first
    if (routeRecord.meta?.parent) {
      chain.push(...buildChain(routeRecord.meta.parent as string, currentRoute))
    }

    // Add this route's breadcrumb
    if (routeRecord.meta?.breadcrumb) {
      chain.push({
        name: getLabel(routeRecord.meta, currentRoute),
        href: routeRecord.path.replace(/:\w+/g, (param) => {
          const paramName = param.slice(1)
          return currentRoute.params[paramName] || param
        }),
      })
    }

    return chain
  }

  // Don't show breadcrumbs on dashboard
  if (route.name === 'dashboard') {
    return []
  }

  // Always start with Dashboard
  crumbs.push({ name: 'Dashboard', href: '/dashboard' })

  // Build the chain from current route
  crumbs.push(...buildChain(route.name, route))

  return crumbs
})

const handleSignOut = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild
                as="template"
                enter="ease-in-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in-out duration-300"
                leave-from="opacity-100"
                leave-to="opacity-0"
              >
                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>

              <!-- Mobile sidebar content -->
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-white to-gray-50 px-6 pb-4">
                <div class="flex h-16 shrink-0 items-center">
                  <RouterLink to="/" class="flex items-center" @click="sidebarOpen = false">
                    <ApplicationLogo variant="primary" class="h-8 w-auto mr-2" />
                    <span class="text-lg font-bold text-primary">Sneaky Salesman</span>
                  </RouterLink>
                </div>

                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="item in navigation" :key="item.name">
                          <RouterLink
                            :to="item.href"
                            @click="sidebarOpen = false"
                            :class="[
                              isActive(item.href)
                                ? [item.bg, item.color, 'shadow-sm']
                                : 'text-gray-600 hover:bg-gray-100',
                              'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
                            ]"
                          >
                            <div
                              :class="[
                                isActive(item.href) ? [item.bg, item.color] : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200',
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                              ]"
                            >
                              <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
                            </div>
                            <span class="self-center">{{ item.name }}</span>
                          </RouterLink>
                        </li>
                      </ul>
                    </li>

                    <li class="mt-auto">
                      <!-- User card -->
                      <div class="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3">
                        <div class="flex items-center gap-x-3">
                          <div class="h-10 w-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                            <img
                              v-if="(user as any)?.avatar_url"
                              class="h-full w-full object-cover"
                              :src="(user as any)?.avatar_url"
                              :alt="fullName"
                            />
                            <UserIcon v-else class="h-5 w-5 text-primary" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-900 truncate">{{ fullName }}</p>
                            <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                          </div>
                        </div>
                      </div>

                      <RouterLink
                        to="/profile"
                        @click="sidebarOpen = false"
                        class="group -mx-2 flex gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition-all">
                          <UserIcon class="h-5 w-5" />
                        </div>
                        <span class="self-center">Profile Settings</span>
                      </RouterLink>

                      <button
                        @click="handleSignOut"
                        class="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
                          <ArrowRightOnRectangleIcon class="h-5 w-5" />
                        </div>
                        <span class="self-center">Sign out</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 px-6 pb-4">
        <!-- Logo -->
        <div class="flex h-16 shrink-0 items-center">
          <RouterLink to="/" class="flex items-center">
            <ApplicationLogo variant="primary" class="h-8 w-auto mr-2" />
            <span class="text-lg font-bold text-primary">Sneaky Salesman</span>
          </RouterLink>
        </div>

        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="item in navigation" :key="item.name">
                  <RouterLink
                    :to="item.href"
                    :class="[
                      isActive(item.href)
                        ? [item.bg, item.color, 'shadow-sm']
                        : 'text-gray-600 hover:bg-gray-100',
                      'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
                    ]"
                  >
                    <div
                      :class="[
                        isActive(item.href) ? [item.bg, item.color] : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200',
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                      ]"
                    >
                      <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span class="self-center">{{ item.name }}</span>
                  </RouterLink>
                </li>
              </ul>
            </li>

            <li class="mt-auto">
              <!-- User card -->
              <div class="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3">
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                    <img
                      v-if="(user as any)?.avatar_url"
                      class="h-full w-full object-cover"
                      :src="(user as any)?.avatar_url"
                      :alt="fullName"
                    />
                    <UserIcon v-else class="h-5 w-5 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ fullName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                  </div>
                </div>
              </div>

              <RouterLink
                to="/profile"
                class="group -mx-2 flex gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-gray-600 hover:bg-gray-100 transition-all"
              >
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition-all">
                  <UserIcon class="h-5 w-5" />
                </div>
                <span class="self-center">Profile Settings</span>
              </RouterLink>

              <button
                @click="handleSignOut"
                class="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
                  <ArrowRightOnRectangleIcon class="h-5 w-5" />
                </div>
                <span class="self-center">Sign out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-72">
      <!-- Top bar -->
      <div class="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

        <!-- Breadcrumbs -->
        <nav class="flex flex-1" aria-label="Breadcrumb">
          <ol role="list" class="flex items-center space-x-2">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.href" class="flex items-center">
              <ChevronRightIcon v-if="index > 0" class="h-4 w-4 flex-shrink-0 text-gray-400 mx-2" aria-hidden="true" />
              <RouterLink
                :to="crumb.href"
                :class="[
                  index === breadcrumbs.length - 1
                    ? 'text-gray-700 font-medium'
                    : 'text-gray-500 hover:text-gray-700',
                  'text-sm transition-colors'
                ]"
              >
                {{ crumb.name }}
              </RouterLink>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Page content -->
      <main class="min-h-screen">
        <RouterView />
      </main>
    </div>
  </div>
</template>
