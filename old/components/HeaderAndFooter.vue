<script setup>
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
import {
	Bars3Icon,
	XMarkIcon,
	PhoneIcon,
	EnvelopeIcon,
	UserIcon,
} from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

import ContactButton from './buttons/ContactButton.vue'
import NotificationsButton from './buttons/NotificationsButton.vue'
import AnnouncementsButton from './buttons/AnnouncementsButton.vue'
import Navlink from './links/Navlink.vue'

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const profileStore = storeToRefs(useProfileStore())
const { profile } = storeToRefs(profileStore)

const navigation = computed(() => [
	{ name: 'Dashboard', href: '/', exact: true, current: route.path === '/' },
	{
		name: 'Financing',
		href: '/estimates/financing',
		current: route.path === '/estimates/financing',
	},
	{
		name: 'Leasing',
		href: '/estimates/leasing',
		current: route.path === '/estimates/leasing',
	},
])

const userNavigation = ref([
	{ name: 'Profile', href: '/profile' },
	// { name: 'Settings', href: '/settings' },
	{
		name: 'Sign out',
		onClick: logOut,
	},
])

const fullName = computed(() =>
	`${user.value.user_metadata.firstName ?? ''} ${
		user.value.user_metadata?.lastName ?? ''
	}`.trim()
)

const currentRoute = computed(() => {
	return navigation.value.find((item) => {
		return route.path.indexOf(item.href) > -1
	})
})

async function logOut() {
	await router.push('/auth/login?ref=logout')
}
</script>

<template>
	<div
		v-if="user"
		class="min-h-full flex flex-col"
	>
		<Popover
			as="header"
			class="bg-gradient-to-br from-primary-shade-5 to-primary-tint-1 pb-24"
			v-slot="{ open }"
		>
			<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
				<div
					class="relative flex items-center justify-center py-5 lg:justify-between"
				>
					<!-- Logo -->
					<div class="absolute left-0 flex-shrink-0 lg:static">
						<NuxtLink
							href="/"
							class="flex flex-row items-center"
						>
							<span class="sr-only">SneakySalesman by JayTech LLC</span>

							<img
								class="h-8 w-auto"
								src="https://tailwindui.com/img/logos/mark.svg?color=gray&shade=200"
								alt=""
							/>

							<div class="flex flex-col">
								<span
									class="text-gray-200 ml-4 hidden lg:inline-block"
									style="wordspacing: -2px"
								>
									Sneaky Salesman
								</span>
								<span
									class="text-white opacity-50 ml-4 hidden lg:inline-block text-xs"
								>
									Find your best offer
								</span>

								<span class="text-gray-200 ml-3 text-sm lg:hidden text-wrap">
									Sneaky
									<br />
									Salesman
								</span>
							</div>
						</NuxtLink>
					</div>

					<!-- Right section on desktop -->
					<div class="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5">
						<!-- <ContactButton /> -->
						<!-- <AnnouncementsButton /> -->
						<!-- <NotificationsButton /> -->

						<!-- Profile dropdown -->
						<Menu
							as="div"
							class="relative ml-4 flex-shrink-0"
						>
							<div>
								<MenuButton
									class="relative flex rounded-full text-sm ring-2 ring-white ring-opacity-50 focus:outline-none hover:ring-opacity-100"
								>
									<span class="absolute -inset-1.5" />
									<span class="sr-only">Open user menu</span>
									<!-- <UserIcon
										class="h-6 w-6 text-white"
										aria-hidden="true"
									/> -->
									<img
										class="h-8 w-8 rounded-full"
										:src="profile?.avatarUrl"
										alt=""
									/>
								</MenuButton>
							</div>

							<transition
								leave-active-class="transition ease-in duration-75"
								leave-from-class="transform opacity-100 scale-100"
								leave-to-class="transform opacity-0 scale-95"
							>
								<MenuItems
									class="absolute -right-2 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
								>
									<MenuItem
										v-for="item in userNavigation"
										:key="item.href"
										v-slot="{ active }"
									>
										<component
											:is="item.href ? 'a' : 'button'"
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

					<!-- Search -->
					<div class="min-w-0 min-h-10 flex-1 px-32 lg:hidden">
						<!-- <div class="mx-auto w-full max-w-xs">
							<label
								for="mobile-search"
								class="sr-only"
								>Search</label
							>
							<div class="relative text-white focus-within:text-gray-600">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
								>
									<MagnifyingGlassIcon
										class="h-5 w-5"
										aria-hidden="true"
									/>
								</div>
								<input
									id="mobile-search"
									class="peer block w-full rounded-md border border-transparent bg-white bg-opacity-20 py-2 pl-10 leading-5 text-white placeholder-white focus:border-transparent focus:bg-opacity-100 focus:text-gray-900 focus:placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm pr-0 focus:pr-2 sm:pr-10"
									placeholder="Search"
									type="search"
									name="search"
								/>

								<div
									class="hidden sm:flex absolute inset-y-0 right-0 py-1.5 pr-1.5 peer-focus:hidden"
								>
									<kbd
										class="inline-flex items-center rounded border border-gray-300 px-2 font-sans text-xs font-medium text-gray-300"
									>
										⌘K
									</kbd>
								</div>
							</div>
						</div> -->
					</div>

					<!-- Menu button -->
					<div class="absolute right-0 flex-shrink-0 lg:hidden">
						<!-- Mobile menu button -->
						<PopoverButton
							class="relative inline-flex items-center justify-center rounded-md bg-transparent p-2 text-indigo-200 hover:bg-white hover:bg-opacity-10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
						>
							<span class="absolute -inset-0.5" />
							<span class="sr-only">Open main menu</span>
							<Bars3Icon
								v-if="!open"
								class="block h-6 w-6"
								aria-hidden="true"
							/>
							<XMarkIcon
								v-else
								class="block h-6 w-6"
								aria-hidden="true"
							/>
						</PopoverButton>
					</div>
				</div>
				<div
					class="hidden border-t border-white border-opacity-20 py-5 lg:block"
				>
					<div class="grid grid-cols-3 items-center gap-8">
						<div class="col-span-2">
							<nav class="flex !justify-start space-x-4">
								<Navlink
									v-for="item in navigation"
									:key="item.name"
									:item="item"
								/>
							</nav>
						</div>
						<div>
							<!-- <div class="mx-auto w-full max-w-md">
								<label
									for="desktop-search"
									class="sr-only"
									>Search</label
								>
								<div class="relative text-white focus-within:text-gray-600">
									<div
										class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
									>
										<MagnifyingGlassIcon
											class="h-5 w-5"
											aria-hidden="true"
										/>
									</div>
									<input
										id="desktop-search"
										class="block w-full rounded-md border-0 bg-white/20 py-1.5 pl-10 pr-3 text-white placeholder:text-white focus:bg-white focus:text-gray-900 focus:ring-0 focus:placeholder:text-gray-500 sm:text-sm sm:leading-6"
										placeholder="Search"
										type="search"
										name="search"
									/>

									<div
										class="hidden sm:flex absolute inset-y-0 right-0 py-1.5 pr-1.5 peer-focus:hidden"
									>
										<kbd
											class="inline-flex items-center rounded border border-gray-300 px-2 font-sans text-xs font-medium text-gray-300"
										>
											⌘K
										</kbd>
									</div>
								</div>
							</div> -->
						</div>
					</div>
				</div>
			</div>

			<TransitionRoot
				as="template"
				:show="open"
			>
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
											<img
												class="h-8 w-auto"
												src="https://tailwindui.com/img/logos/mark.svg?color=cyan&shade=600"
												alt="Your Company"
											/>
										</div>
										<div class="-mr-2">
											<PopoverButton
												class="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
											>
												<span class="absolute -inset-0.5" />
												<span class="sr-only">Close menu</span>
												<XMarkIcon
													class="h-6 w-6"
													aria-hidden="true"
												/>
											</PopoverButton>
										</div>
									</div>
									<div class="mt-3 space-y-1 px-2">
										<NuxtLink
											v-for="item in navigation"
											:key="item.name"
											:href="item.href"
											class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-800"
										>
											{{ item.name }}
										</NuxtLink>
									</div>
								</div>
								<div class="pb-2 pt-4">
									<div class="flex items-center px-5">
										<div class="flex-shrink-0">
											<img
												class="h-10 w-10 rounded-full"
												:src="profile?.avatarUrl"
												alt=""
											/>
										</div>
										<div class="ml-3 min-w-0 flex-1">
											<div class="truncate text-base font-medium text-gray-800">
												{{ fullName ?? '-' }}
											</div>
											<div class="truncxzate text-sm font-medium text-gray-500">
												{{ user.email ?? '-' }}
											</div>
										</div>

										<!-- <ContactButton
											colorClass="text-gray-400"
											sizeClass="h-6 w-6"
										/> -->

										<!-- <AnnouncementsButton
											colorClass="text-gray-400"
											sizeClass="h-6 w-6"
										/> -->

										<!-- <NotificationsButton
											colorClass="text-gray-400"
											sizeClass="h-6 w-6"
										/> -->
									</div>
									<div class="mt-3 space-y-1 px-2">
										<component
											v-for="item in userNavigation"
											:is="item.href ? 'a' : 'button'"
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

		<slot></slot>

		<footer>
			<div
				class="py-8 border-t border-gray-200 mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 sm:flex sm:items-center sm:justify-between"
			>
				<div class="text-center text-sm text-gray-500 sm:text-left">
					<span class="block sm:inline"
						>&copy; {{ new Date().getFullYear() }} JayTech LLC.
					</span>
					&nbsp;
					<span class="block sm:inline">All rights reserved.</span>
				</div>

				<div class="flex justify-center space-x-6 mt-4 sm:mt-0">
					<!-- <div class="flex">
						<PhoneIcon
							class="h-6 w-6 text-gray-400"
							aria-hidden="true"
						/>

						<NuxtLink
							href="tel:+1-330-705-7994"
							class="ml-3 text-gray-400 hover:text-gray-500"
						>
							+1-330-705-7994
						</NuxtLink>
					</div> -->

					<NuxtLink
						href="mailto:jason.barnett@jaytech.io"
						class="flex text-gray-400 hover:text-gray-500"
					>
						<span class="">jason.barnett@jaytech.io</span>
						<EnvelopeIcon
							class="h-6 w-6 ml-3"
							aria-hidden="true"
						/>
					</NuxtLink>
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
