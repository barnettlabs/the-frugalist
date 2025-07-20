<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverOverlay,
  PopoverPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import ApplicationLogo from '@/Components/ApplicationLogo.vue'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/vue/24/outline'
import { ChevronRightIcon, HomeIcon } from '@heroicons/vue/20/solid'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

interface NavigationItem {
  name: string
  href: string
  current?: boolean
}

interface UserNavigationItem {
  name: string
  href?: string
  onClick?: () => void
}

interface Props {
  user?: User
  breadcrumbs?: BreadcrumbItem[]
  navigation?: NavigationItem[]
  userNavigation?: UserNavigationItem[]
  isAuthenticated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  navigation: () => [],
  userNavigation: () => [],
  isAuthenticated: false
})

const fullName = computed((): string => {
  if (!props.user) return ''
  return `${props.user?.first_name ?? ''} ${props.user?.last_name ?? ''}`.trim()
})
</script>

<template>
  <Popover
    as="header"
    class="bg-animated-gradient dotted-background-light pb-24 relative overflow-hidden"
    v-slot="{ open }"
  >
    <!-- Floating geometric shapes for visual interest -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-4 -right-4 w-72 h-72 bg-white opacity-5 rounded-full"></div>
      <div class="absolute top-20 -left-10 w-48 h-48 bg-white opacity-10 rounded-full"></div>
    </div>

    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 z-10">
      <div class="relative flex items-center justify-center py-3 lg:justify-between">
        <!-- Logo -->
        <div class="absolute left-0 flex-shrink-0 lg:static">
          <div class="flex items-center space-x-6">
            <Link href="/" class="flex flex-row items-center">
              <span class="sr-only">SneakySalesman by JayTech LLC</span>

              <ApplicationLogo variant="white" class="h-8 w-auto mr-2" />

              <div class="flex flex-col">
                <span class="text-white font-bold hidden lg:inline-block"> Sneaky Salesman </span>
                <span class="text-white opacity-80 hidden lg:inline-block text-xs font-medium">
                  Your personal sales renegade
                </span>

                <span class="text-white font-bold text-sm lg:hidden text-wrap">
                  Sneaky
                  <br />
                  Salesman
                </span>
              </div>
            </Link>
          </div>
        </div>

        <!-- Right section on desktop -->
        <div class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5 relative z-50">
          <!-- Auth buttons for guests -->
          <div v-if="!isAuthenticated" class="flex space-x-4">
            <Link 
              href="/login" 
              class="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Register
            </Link>
          </div>

          <!-- Profile dropdown for authenticated users -->
          <Menu v-else as="div" class="relative ml-4 flex-shrink-0 z-50">
            <div>
              <MenuButton
                class="relative flex rounded-full text-sm ring-2 ring-white ring-opacity-50 focus:outline-none hover:ring-opacity-100"
              >
                <span class="absolute -inset-1.5" />
                <span class="sr-only">Open user menu</span>
                <div
                  class="h-8 w-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center"
                >
                  <img
                    v-if="user?.avatar_url"
                    class="h-full w-full object-cover"
                    :src="user?.avatar_url"
                    :alt="fullName"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <UserIcon v-else class="h-5 w-5 text-white" />
                </div>
              </MenuButton>
            </div>

            <transition
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="absolute -right-2 z-[100] mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none profile-dropdown"
              >
                <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                  <component
                    :is="item.href ? Link : 'button'"
                    :href="item.href"
                    @click="item.onClick"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'block w-full text-left px-4 py-2 text-sm text-gray-700',
                    ]"
                  >
                    {{ item.name }}
                  </component>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>

        <!-- Menu button -->
        <div class="absolute right-0 flex-shrink-0 lg:hidden">
          <PopoverButton
            class="relative inline-flex items-center justify-center rounded-md bg-transparent p-2 text-indigo-200 hover:bg-white hover:bg-opacity-10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span class="absolute -inset-0.5" />
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
            <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </PopoverButton>
        </div>
      </div>
      
      <div class="hidden border- border-white border-opacity-20 pt-2 pb-5 lg:block">
        <!-- Breadcrumbs -->
        <nav
          v-if="breadcrumbs && breadcrumbs.length > 0"
          class="hidden lg:flex flex-row !justify-start"
          aria-label="Breadcrumb"
        >
          <ol class="flex items-center space-x-2">
            <li>
              <Link
                :href="isAuthenticated ? '/dashboard' : '/'"
                class="flex items-center text-white/70 hover:text-white transition-colors text-sm"
              >
                <HomeIcon class="h-4 w-4 mr-1" />
                {{ isAuthenticated ? 'Dashboard' : 'Home' }}
              </Link>
            </li>
            <li v-for="(breadcrumb, index) in breadcrumbs" :key="index" class="flex items-center">
              <ChevronRightIcon class="h-4 w-4 text-white/50 mx-2" />
              <Link
                v-if="breadcrumb.href && !breadcrumb.current"
                :href="breadcrumb.href"
                class="text-white/70 hover:text-white transition-colors text-sm"
              >
                {{ breadcrumb.name }}
              </Link>
              <span v-else class="text-white font-medium text-sm">
                {{ breadcrumb.name }}
              </span>
            </li>
          </ol>
        </nav>

        <div class="grid grid-cols-3 items-center gap-8">
          <div class="col-span-2">
            <nav class="flex !justify-start space-x-4">
              <Link
                v-for="item in navigation"
                :key="item.name"
                :href="item.href"
                :class="[
                  item.current
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10',
                  'rounded-md px-3 py-2 text-sm font-medium',
                ]"
              >
                {{ item.name }}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <TransitionRoot as="template" :show="open">
      <div class="lg:hidden">
        <TransitionChild
          as="template"
          enter="duration-150 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <PopoverOverlay class="fixed inset-0 z-20 bg-black bg-opacity-25" />
        </TransitionChild>

        <TransitionChild
          as="template"
          enter="duration-150 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <PopoverPanel
            focus
            class="absolute inset-x-0 top-0 z-30 mx-auto w-full max-w-3xl origin-top transform p-2 transition"
          >
            <div
              class="divide-y divide-gray-200 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
            >
              <div class="pb-2 pt-3">
                <div class="flex items-center justify-between px-4">
                  <div></div>
                  <div class="-mr-2">
                    <PopoverButton
                      class="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    >
                      <span class="absolute -inset-0.5" />
                      <span class="sr-only">Close menu</span>
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </PopoverButton>
                  </div>
                </div>
                <div class="mt-3 space-y-1 px-2">
                  <Link
                    v-for="item in navigation"
                    :key="item.name"
                    :href="item.href"
                    class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                  >
                    {{ item.name }}
                  </Link>
                </div>
              </div>
              
              <!-- Mobile auth section -->
              <div class="pb-2 pt-4">
                <div v-if="isAuthenticated && user" class="flex items-center px-5">
                  <div class="flex-shrink-0">
                    <div
                      class="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
                    >
                      <img
                        v-if="user?.avatar_url"
                        class="h-full w-full object-cover"
                        :src="user?.avatar_url"
                        :alt="fullName"
                        @error="($event.target as HTMLImageElement).style.display = 'none'"
                      />
                      <UserIcon v-else class="h-6 w-6 text-gray-500" />
                    </div>
                  </div>
                  <div class="ml-3 min-w-0 flex-1">
                    <div class="truncate text-base font-medium text-gray-800">
                      {{ fullName ?? '-' }}
                    </div>
                    <div class="truncate text-sm font-medium text-gray-500">
                      {{ user?.email ?? '-' }}
                    </div>
                  </div>
                </div>
                
                <div class="mt-3 space-y-1 px-2">
                  <template v-if="isAuthenticated">
                    <component
                      v-for="item in userNavigation"
                      :is="item.href ? Link : 'button'"
                      :key="item.name"
                      :href="item.href"
                      @click="item.onClick"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {{ item.name }}
                    </component>
                  </template>
                  <template v-else>
                    <Link
                      href="/login"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Register
                    </Link>
                  </template>
                </div>
              </div>
            </div>
          </PopoverPanel>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </Popover>
</template>