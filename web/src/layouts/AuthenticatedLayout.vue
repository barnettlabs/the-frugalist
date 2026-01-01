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
  EyeIcon,
  CalculatorIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

const user = computed(() => authStore.user)
const fullName = computed(() => authStore.fullName)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Watch', href: '/price-tracker', icon: EyeIcon },
  { name: 'Compute', href: '/estimates', icon: CalculatorIcon },
  { name: 'Guides', href: '/learning', icon: BookOpenIcon },
  { name: 'Review', href: '/review', icon: ClipboardDocumentCheckIcon },
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
  <div class="min-h-screen">
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
          <div class="fixed inset-0 bg-neutral-900/80" />
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
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-surface/95 backdrop-blur-sm px-6 pb-4 border-r border-border">
                <div class="flex h-16 shrink-0 items-center">
                  <RouterLink to="/dashboard" class="flex items-center" @click="sidebarOpen = false">
                    <ApplicationLogo variant="primary" size="lg" />
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
                                ? 'bg-accent/10 text-accent-dark'
                                : 'text-text-muted hover:bg-neutral-100 hover:text-primary',
                              'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
                            ]"
                          >
                            <component
                              :is="item.icon"
                              :class="[
                                isActive(item.href) ? 'text-accent' : 'text-text-muted group-hover:text-primary',
                                'h-5 w-5 shrink-0 transition-colors',
                              ]"
                              aria-hidden="true"
                            />
                            <span>{{ item.name }}</span>
                          </RouterLink>
                        </li>
                      </ul>
                    </li>

                    <li class="mt-auto">
                      <!-- User card -->
                      <div class="rounded-lg bg-neutral-100 border border-border p-3 mb-3">
                        <div class="flex items-center gap-x-3">
                          <div class="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center flex-shrink-0">
                            <img
                              v-if="(user as any)?.avatar_url"
                              class="h-full w-full object-cover"
                              :src="(user as any)?.avatar_url"
                              :alt="fullName"
                            />
                            <UserIcon v-else class="h-5 w-5 text-text-muted" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-primary truncate">{{ fullName }}</p>
                            <p class="text-xs text-text-muted truncate">{{ user?.email }}</p>
                          </div>
                        </div>
                      </div>

                      <RouterLink
                        to="/profile"
                        @click="sidebarOpen = false"
                        class="group -mx-2 flex gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-neutral-100 hover:text-primary transition-all"
                      >
                        <Cog6ToothIcon class="h-5 w-5 shrink-0 group-hover:text-primary transition-colors" />
                        <span>Settings</span>
                      </RouterLink>

                      <button
                        @click="handleSignOut"
                        class="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-danger/10 hover:text-danger transition-all"
                      >
                        <ArrowRightOnRectangleIcon class="h-5 w-5 shrink-0 group-hover:text-danger transition-colors" />
                        <span>Sign out</span>
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
    <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-surface/90 backdrop-blur-sm border-r border-border px-6 pb-4">
        <!-- Logo -->
        <div class="flex h-16 shrink-0 items-center">
          <RouterLink to="/dashboard" class="flex items-center">
            <ApplicationLogo variant="primary" size="lg" />
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
                        ? 'bg-accent/10 text-accent-dark'
                        : 'text-text-muted hover:bg-neutral-100 hover:text-primary',
                      'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
                    ]"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        isActive(item.href) ? 'text-accent' : 'text-text-muted group-hover:text-primary',
                        'h-5 w-5 shrink-0 transition-colors',
                      ]"
                      aria-hidden="true"
                    />
                    <span>{{ item.name }}</span>
                  </RouterLink>
                </li>
              </ul>
            </li>

            <li class="mt-auto">
              <!-- User card -->
              <div class="rounded-lg bg-neutral-100 border border-border p-3 mb-3">
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <img
                      v-if="(user as any)?.avatar_url"
                      class="h-full w-full object-cover"
                      :src="(user as any)?.avatar_url"
                      :alt="fullName"
                    />
                    <UserIcon v-else class="h-5 w-5 text-text-muted" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-primary truncate">{{ fullName }}</p>
                    <p class="text-xs text-text-muted truncate">{{ user?.email }}</p>
                  </div>
                </div>
              </div>

              <RouterLink
                to="/profile"
                class="group -mx-2 flex gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-neutral-100 hover:text-primary transition-all"
              >
                <Cog6ToothIcon class="h-5 w-5 shrink-0 group-hover:text-primary transition-colors" />
                <span>Settings</span>
              </RouterLink>

              <button
                @click="handleSignOut"
                class="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-danger/10 hover:text-danger transition-all"
              >
                <ArrowRightOnRectangleIcon class="h-5 w-5 shrink-0 group-hover:text-danger transition-colors" />
                <span>Sign out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar -->
      <div class="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border bg-surface/80 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          class="-m-2.5 p-2.5 text-text-muted lg:hidden"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>

        <!-- Separator -->
        <div class="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

        <!-- Breadcrumbs -->
        <nav class="flex flex-1" aria-label="Breadcrumb">
          <ol role="list" class="flex items-center space-x-2">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.href" class="flex items-center">
              <ChevronRightIcon v-if="index > 0" class="h-4 w-4 flex-shrink-0 text-text-muted mx-2" aria-hidden="true" />
              <RouterLink
                :to="crumb.href"
                :class="[
                  index === breadcrumbs.length - 1
                    ? 'text-primary font-medium'
                    : 'text-text-muted hover:text-primary',
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
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
