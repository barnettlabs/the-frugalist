<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Popover,
  PopoverButton,
  PopoverOverlay,
  PopoverPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import { Bars3Icon, XMarkIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'
import { ChevronRightIcon, HomeIcon } from '@heroicons/vue/20/solid'

interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

interface Props {
  breadcrumbs?: BreadcrumbItem[]
}

defineProps<Props>()

interface NavigationItem {
  name: string
  href: string
  current?: boolean
}

const navigation = computed((): NavigationItem[] => [
  // Navigation items can be added here if needed for guest users
])
</script>

<template>
  <div class="flex-1 flex flex-col">
    <Popover
      as="header"
      class="bg-animated-gradient dotted-background-light pb-24 relative overflow-hidden"
      v-slot="{ open }"
    >
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 z-10">
        <div class="relative flex items-center justify-center py-3 lg:justify-between">
          <!-- Logo and Breadcrumbs -->
          <div class="absolute left-0 flex-shrink-0 lg:static">
            <div class="flex items-center space-x-6">
              <RouterLink to="/" class="flex flex-row items-center">
                <span class="sr-only">SneakySalesman by JayTech LLC</span>

                <ApplicationLogo variant="white" class="h-8 w-auto mr-2" />

                <div class="flex flex-col">
                  <span class="text-white font-bold hidden lg:inline-block"> Sneaky Salesman </span>
                  <span class="text-white opacity-80 hidden lg:inline-block text-xs font-medium">
                    Your smart shopping companion
                  </span>

                  <span class="text-white font-bold text-sm lg:hidden text-wrap">
                    Sneaky
                    <br />
                    Salesman
                  </span>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- Right section on desktop - Login/Register buttons -->
          <div class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5 relative z-50">
            <div class="flex space-x-4">
              <RouterLink
                to="/login"
                class="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Login
              </RouterLink>
              <RouterLink
                to="/register"
                class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Register
              </RouterLink>
            </div>
          </div>

          <!-- Menu button -->
          <div class="absolute right-0 flex-shrink-0 lg:hidden">
            <!-- Mobile menu button -->
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
                <RouterLink
                  to="/"
                  class="flex items-center text-white/70 hover:text-white transition-colors text-sm"
                >
                  <HomeIcon class="h-4 w-4 mr-1" />
                  Home
                </RouterLink>
              </li>
              <li v-for="(breadcrumb, index) in breadcrumbs" :key="index" class="flex items-center">
                <ChevronRightIcon class="h-4 w-4 text-white/50 mx-2" />
                <RouterLink
                  v-if="breadcrumb.href && !breadcrumb.current"
                  :to="breadcrumb.href"
                  class="text-white/70 hover:text-white transition-colors text-sm"
                >
                  {{ breadcrumb.name }}
                </RouterLink>
                <span v-else class="text-white font-medium text-sm">
                  {{ breadcrumb.name }}
                </span>
              </li>
            </ol>
          </nav>

          <div class="grid grid-cols-3 items-center gap-8">
            <div class="col-span-2">
              <nav class="flex !justify-start space-x-4">
                <RouterLink
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.href"
                  :class="[
                    item.current
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white hover:bg-white hover:bg-opacity-10',
                    'rounded-md px-3 py-2 text-sm font-medium',
                  ]"
                >
                  {{ item.name }}
                </RouterLink>
              </nav>
            </div>
          </div>
        </div>
      </div>

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
                    <RouterLink
                      v-for="item in navigation"
                      :key="item.name"
                      :to="item.href"
                      class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {{ item.name }}
                    </RouterLink>
                  </div>
                </div>
                <div class="pb-2 pt-4">
                  <div class="mt-3 space-y-1 px-2">
                    <RouterLink
                      to="/login"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Login
                    </RouterLink>
                    <RouterLink
                      to="/register"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Register
                    </RouterLink>
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </TransitionChild>
        </div>
      </TransitionRoot>
    </Popover>

    <div class="flex-1 dotted-background-dark">
      <RouterView />
    </div>

    <footer class="bg-gray-100 relative dotted-background py-12 border-t border-gray-200">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <ApplicationLogo variant="black" class="h-8 w-auto" />
              <h3 class="text-xl font-bold text-gray-900">Sneaky Salesman</h3>
            </div>
            <p class="text-gray-600">
              Empowering consumers with transparent financing tools and expert insights.
            </p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4 text-gray-900">Quick Links</h4>
            <ul class="space-y-2 text-gray-600">
              <li>
                <RouterLink to="/estimates/financing" class="hover:text-primary transition-colors">
                  Vehicle Finance Calculator
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/estimates/leasing" class="hover:text-primary transition-colors">
                  Vehicle Lease Calculator
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/price-tracker" class="hover:text-primary transition-colors">
                  Smart Price Tracker
                </RouterLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4 text-gray-900">Contact</h4>
            <p class="text-gray-600">
              <a
                href="mailto:jason.barnett@jaytech.io"
                class="hover:text-primary transition-colors flex items-center"
              >
                <span class="">jason.barnett@jaytech.io</span>
                <EnvelopeIcon class="h-4 w-4 ml-2" aria-hidden="true" />
              </a>
            </p>
            <p class="text-gray-500 mt-4 text-sm">
              &copy; {{ new Date().getFullYear() }} JayTech LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: flex-end;
}
</style>
