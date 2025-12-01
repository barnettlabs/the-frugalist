<script setup lang="ts">
import { ref, computed } from 'vue'
import { Link, router, useForm } from '@inertiajs/vue3'
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
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import ApplicationLogo from '@/Components/ApplicationLogo.vue'
import {
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BugAntIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon, ChevronRightIcon, HomeIcon } from '@heroicons/vue/20/solid'

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

interface Props {
  user: User
  breadcrumbs?: BreadcrumbItem[]
}

const props = defineProps<Props>()

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

const userNavigation = ref<UserNavigationItem[]>([
  { name: 'Profile', href: '/profile' },
  {
    name: 'Sign out',
    onClick: () => router.post('/logout'),
  },
])

const fullName = computed((): string => {
  return `${props.user?.first_name ?? ''} ${props.user?.last_name ?? ''}`.trim()
})

// Bug report modal state
const showBugModal = ref(false)
const bugForm = useForm({
  subject: '',
  description: '',
  page_url: '',
  metadata: {} as Record<string, any>,
})

const openBugModal = () => {
  bugForm.page_url = window.location.href
  bugForm.metadata = {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timestamp: new Date().toISOString(),
  }
  showBugModal.value = true
}

const closeBugModal = () => {
  showBugModal.value = false
  bugForm.reset()
}

const submitBugReport = () => {
  bugForm.post(route('bug-reports.store'), {
    preserveScroll: true,
    onSuccess: () => {
      closeBugModal()
    },
  })
}
</script>

<template>
  <div class="flex-1 flex flex-col">
    <Popover
      as="header"
      class="bg-animated-gradient dotted-background-light relative"
      v-slot="{ open }"
    >
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 z-10">
        <div class="relative flex items-center justify-between py-3 lg:justify-between">
          <!-- Logo and Breadcrumbs -->
          <div class="flex-shrink-0">
            <div class="flex items-center space-x-6">
              <Link href="/" class="flex flex-row items-center">
                <span class="sr-only">SneakySalesman by JayTech LLC</span>

                <ApplicationLogo variant="white" class="h-8 w-auto mr-2" />

                <div class="flex flex-col">
                  <span class="text-white font-bold"> Sneaky Salesman </span>
                  <span class="text-white opacity-80 text-xs font-medium">
                    Your smart shopping companion
                  </span>
                </div>
              </Link>

              <!-- old breadcrumbs position -->
            </div>
          </div>

          <!-- Right section on desktop -->
          <div class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5 relative z-50">
            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-4 flex-shrink-0 z-50">
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
        <div v-if="breadcrumbs && breadcrumbs.length > 0" class="hidden pt-2 pb-5 lg:block">
          <!-- Breadcrumbs -->
          <nav class="hidden lg:flex flex-row !justify-start" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <Link
                  href="/dashboard"
                  class="flex items-center text-white/70 hover:text-white transition-colors text-sm"
                >
                  <HomeIcon class="h-4 w-4 mr-1" />
                  Dashboard
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
                    <div>
                      <!-- <img
                                                class="h-8 w-auto"
                                                src="https://tailwindui.com/img/logos/mark.svg?color=cyan&shade=600"
                                                alt="Your Company"
                                            /> -->
                    </div>
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
                <div class="pb-2 pt-4">
                  <div class="flex items-center px-5">
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
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </TransitionChild>
        </div>
      </TransitionRoot>
    </Popover>

    <div class="flex-1 dotted-background-dark">
      <slot />
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
                <Link href="/estimates/financing" class="hover:text-primary transition-colors">
                  Vehicle Finance Calculator
                </Link>
              </li>
              <li>
                <Link href="/learning/financing" class="hover:text-primary transition-colors">
                  Learn About Financing
                </Link>
              </li>
              <li>
                <Link href="/estimates/leasing" class="hover:text-primary transition-colors">
                  Vehicle Lease Calculator
                </Link>
              </li>
              <li>
                <Link href="/learning/leasing" class="hover:text-primary transition-colors">
                  Learn About Leasing
                </Link>
              </li>
              <li>
                <Link href="/price-tracker" class="hover:text-primary transition-colors">
                  Smart Price Tracker
                </Link>
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
            <button
              @click="openBugModal"
              class="mt-4 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <BugAntIcon class="h-5 w-5" />
              <span>Report a Bug</span>
            </button>
            <p class="text-gray-500 mt-4 text-sm">
              &copy; {{ new Date().getFullYear() }} JayTech LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>

    <!-- Bug Report Modal -->
    <TransitionRoot appear :show="showBugModal" as="template">
      <Dialog as="div" @close="closeBugModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <div class="flex items-start justify-between mb-4">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                  >
                    <BugAntIcon class="h-6 w-6 text-primary" />
                    Report a Bug
                  </DialogTitle>
                  <button
                    @click="closeBugModal"
                    class="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XCircleIcon class="h-6 w-6" />
                  </button>
                </div>

                <form @submit.prevent="submitBugReport" class="space-y-4">
                  <div>
                    <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      id="subject"
                      v-model="bugForm.subject"
                      type="text"
                      required
                      maxlength="255"
                      placeholder="Brief description of the issue"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      :class="{ 'border-danger': bugForm.errors.subject }"
                    />
                    <p v-if="bugForm.errors.subject" class="mt-1 text-sm text-danger">
                      {{ bugForm.errors.subject }}
                    </p>
                  </div>

                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      v-model="bugForm.description"
                      required
                      maxlength="2000"
                      rows="6"
                      placeholder="Please provide details about what happened, what you expected, and steps to reproduce..."
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                      :class="{ 'border-danger': bugForm.errors.description }"
                    />
                    <p v-if="bugForm.errors.description" class="mt-1 text-sm text-danger">
                      {{ bugForm.errors.description }}
                    </p>
                    <p class="mt-1 text-xs text-gray-500">
                      {{ bugForm.description.length }}/2000 characters
                    </p>
                  </div>

                  <div class="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                    <p class="font-medium mb-1">The following information will be included:</p>
                    <ul class="list-disc list-inside space-y-1">
                      <li>Current page URL</li>
                      <li>Browser information</li>
                      <li>Screen resolution</li>
                    </ul>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button
                      type="button"
                      @click="closeBugModal"
                      class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="bugForm.processing"
                      class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-shade-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ bugForm.processing ? 'Submitting...' : 'Submit Report' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: flex-end;
}
</style>
