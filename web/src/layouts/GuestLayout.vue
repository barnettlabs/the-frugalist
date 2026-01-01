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
      class="bg-surface/80 backdrop-blur-sm border-b border-border pb-24 relative overflow-hidden"
      v-slot="{ open }"
    >
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 z-10">
        <div class="relative flex items-center justify-center py-4 lg:justify-between">
          <!-- Logo -->
          <div class="absolute left-0 flex-shrink-0 lg:static">
            <div class="flex items-center space-x-6">
              <RouterLink to="/" class="flex flex-row items-center">
                <span class="sr-only">TheFrugalist by JayTech LLC</span>
                <ApplicationLogo variant="primary" size="xl" />
              </RouterLink>
            </div>
          </div>

          <!-- Right section on desktop - Login/Register buttons -->
          <div class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5 relative z-50">
            <div class="flex space-x-4">
              <RouterLink
                to="/login"
                class="text-text-muted hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Login
              </RouterLink>
              <RouterLink
                to="/register"
                class="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Register
              </RouterLink>
            </div>
          </div>

          <!-- Menu button -->
          <div class="absolute right-0 flex-shrink-0 lg:hidden">
            <!-- Mobile menu button -->
            <PopoverButton
              class="relative inline-flex items-center justify-center rounded-md bg-transparent p-2 text-text-muted hover:bg-border hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <span class="absolute -inset-0.5" />
              <span class="sr-only">Open main menu</span>
              <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
              <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
            </PopoverButton>
          </div>
        </div>
        <div class="hidden border-border pt-2 pb-5 lg:block">
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
                  class="flex items-center text-text-muted hover:text-primary transition-colors text-sm"
                >
                  <HomeIcon class="h-4 w-4 mr-1" />
                  Home
                </RouterLink>
              </li>
              <li v-for="(breadcrumb, index) in breadcrumbs" :key="index" class="flex items-center">
                <ChevronRightIcon class="h-4 w-4 text-text-muted mx-2" />
                <RouterLink
                  v-if="breadcrumb.href && !breadcrumb.current"
                  :to="breadcrumb.href"
                  class="text-text-muted hover:text-primary transition-colors text-sm"
                >
                  {{ breadcrumb.name }}
                </RouterLink>
                <span v-else class="text-primary font-medium text-sm">
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
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-muted hover:bg-border',
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
            <PopoverOverlay class="fixed inset-0 z-20 bg-black/25" />
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
                class="divide-y divide-border rounded-lg bg-surface shadow-lg ring-1 ring-black/5"
              >
                <div class="pb-2 pt-3">
                  <div class="flex items-center justify-between px-4">
                    <div></div>
                    <div class="-mr-2">
                      <PopoverButton
                        class="relative inline-flex items-center justify-center rounded-md bg-surface p-2 text-text-muted hover:bg-neutral-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
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
                      class="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-neutral-100"
                    >
                      {{ item.name }}
                    </RouterLink>
                  </div>
                </div>
                <div class="pb-2 pt-4">
                  <div class="mt-3 space-y-1 px-2">
                    <RouterLink
                      to="/login"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-neutral-100"
                    >
                      Login
                    </RouterLink>
                    <RouterLink
                      to="/register"
                      class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-neutral-100"
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

    <div class="flex-1">
      <RouterView />
    </div>

    <footer class="bg-surface/80 backdrop-blur-sm border-t border-border py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <ApplicationLogo variant="primary" size="lg" />
            </div>
            <p class="text-text-muted text-sm leading-relaxed">
              Helping you avoid overpaying by tracking price movement, explaining pricing tactics,
              and alerting you when buying actually makes sense.
            </p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-4 text-primary">Quick Links</h4>
            <ul class="space-y-2 text-sm text-text-muted">
              <li>
                <RouterLink to="/price-tracker" class="hover:text-accent transition-colors">
                  Watch
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/estimates" class="hover:text-accent transition-colors">
                  Compute
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/learning" class="hover:text-accent transition-colors">
                  Guides
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/privacy" class="hover:text-accent transition-colors">
                  Privacy Policy
                </RouterLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-4 text-primary">Contact</h4>
            <p class="text-text-muted text-sm">
              <a
                href="mailto:jason.barnett@jaytech.io"
                class="hover:text-accent transition-colors flex items-center"
              >
                <span>jason.barnett@jaytech.io</span>
                <EnvelopeIcon class="h-4 w-4 ml-2" aria-hidden="true" />
              </a>
            </p>
            <p class="text-text-muted mt-4 text-xs">
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
