<script setup>
import { ref, computed, onMounted } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import {
    BanknotesIcon,
    CurrencyDollarIcon,
    PhoneIcon,
    UserCircleIcon,
    BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
    user: Object,
    vehicleFinanceSheets: Array,
    vehicleLeaseSheets: Array,
})

const stats = computed(() => [
    {
        label: 'total loan sheets',
        value: props.vehicleFinanceSheets?.length ?? '-',
    },
    {
        label: 'total lease sheets',
        value: props.vehicleLeaseSheets?.length ?? '-',
    },
    { label: 'dealers nearby (coming soon)', value: '??' },
])

const actions = [
    {
        icon: BanknotesIcon,
        name: 'My Purchase Estimates',
        description:
            'View your worksheets related to purchasing and financing a vehicle.',
        href: '/estimates/financing',
        iconForeground: 'text-teal-700',
        iconBackground: 'bg-teal-50',
    },
    {
        icon: CurrencyDollarIcon,
        name: 'My Leasing Estimates',
        description: 'View your worksheets related to leasing a vehicle.',
        href: '/estimates/leasing',
        iconForeground: 'text-cyan-700',
        iconBackground: 'bg-cyan-50',
    },
    {
        icon: MagnifyingGlassIcon,
        name: 'Find your perfect vehicle',
        description:
            'Need help narrowing down exactly what you need but also staying within budget? We got you!',
        href: '/coming-soon',
        iconForeground: 'text-sky-700',
        iconBackground: 'bg-sky-50',
    },
    {
        icon: PhoneIcon,
        name: 'Contact Us',
        description: 'Have a question? We are here to help!',
        href: '/coming-soon',
        iconForeground: 'text-indigo-700',
        iconBackground: 'bg-indigo-50',
    },
    {
        icon: BuildingStorefrontIcon,
        name: 'Submit a dealer review',
        description: 'Help others find the best dealers in your area.',
        href: '/coming-soon',
        iconForeground: 'text-yellow-700',
        iconBackground: 'bg-yellow-50',
    },
    {
        icon: UserCircleIcon,
        name: 'Submit a salesman review',
        description: 'Help others find the best salesmen in your area.',
        href: '/coming-soon',
        iconForeground: 'text-rose-700',
        iconBackground: 'bg-rose-50',
    },
]

const fullName = computed(() => {
    return `${props.user?.first_name ?? ''} ${props.user?.last_name ?? ''}`.trim()
})
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout :user="user">
        <main class="-mt-24 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 class="sr-only">Dashboard</h1>

                <!-- Main 3 column grid -->
                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <!-- Left column -->
                    <div class="grid grid-cols-1 gap-4 lg:col-span-2">
                        <!-- Welcome panel -->
                        <section aria-labelledby="profile-overview-title">
                            <div class="overflow-hidden rounded-lg bg-white shadow">
                                <h2
                                    class="sr-only"
                                    id="profile-overview-title"
                                >
                                    Profile Overview
                                </h2>
                                <div class="bg-white p-6">
                                    <div class="sm:flex sm:items-center sm:justify-between">
                                        <div class="sm:flex sm:space-x-5">
                                            <div class="flex-shrink-0">
                                                <img
                                                    class="mx-auto h-16 w-16 rounded-full"
                                                    :src="user?.avatar_url"
                                                    alt=""
                                                />
                                            </div>
                                            <div class="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                                                <p class="text-sm font-medium text-gray-600">Welcome,</p>
                                                <p class="text-xl font-bold text-gray-900 sm:text-2xl">
                                                    {{ fullName }}
                                                </p>
                                                <p class="text-sm font-medium text-gray-400">
                                                    {{ user?.email }}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="mt-5 flex justify-center sm:mt-0">
                                            <Link href="/profile">
                                                <button
                                                    type="button"
                                                    class="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                                >
                                                    View profile
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-y-0 sm:divide-x"
                                >
                                    <div
                                        v-for="stat in stats"
                                        :key="stat.label"
                                        class="px-6 py-5 text-center text-sm font-medium"
                                    >
                                        <span class="text-gray-900">{{ stat.value }}</span
                                        >&nbsp;
                                        <span class="text-gray-600">{{ stat.label }}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Actions panel -->
                        <section aria-labelledby="quick-links-title">
                            <div
                                class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0"
                            >
                                <h2
                                    class="sr-only"
                                    id="quick-links-title"
                                >
                                    Quick links
                                </h2>

                                <div
                                    v-for="(action, actionIdx) in actions"
                                    :key="action.name"
                                    class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-300"
                                    :class="{
                                        'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none':
                                            actionIdx === 0,
                                        'sm:rounded-tr-lg': actionIdx === 1,
                                        'sm:rounded-bl-lg': actionIdx === actions.length - 2,
                                        'rounded-bl-lg rounded-br-lg sm:rounded-bl-none':
                                            actionIdx === actions.length - 1,
                                    }"
                                >
                                    <div>
                                        <span
                                            class="rounded-lg inline-flex p-3 ring-4 ring-white"
                                            :class="[action.iconBackground, action.iconForeground]"
                                        >
                                            <component
                                                :is="action.icon"
                                                class="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </div>
                                    <div class="mt-4">
                                        <h3 class="text-lg font-medium">
                                            <Link :href="action.href">
                                                <button
                                                    type="button"
                                                    class="focus:outline-none"
                                                >
                                                    <!-- Extend touch target to entire panel -->
                                                    <span
                                                        class="absolute inset-0"
                                                        aria-hidden="true"
                                                    />
                                                    {{ action.name }}
                                                </button>
                                            </Link>
                                        </h3>
                                        <p
                                            v-if="action.description"
                                            class="mt-2 text-sm text-gray-500"
                                        >
                                            {{ action.description }}
                                        </p>
                                    </div>
                                    <span
                                        class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            class="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Right column -->
                    <div class="grid grid-cols-1 gap-4">
                        <!-- Placeholder for AnnouncementsCard and NearbyDealersCard -->
                        <div class="overflow-hidden rounded-lg bg-white shadow">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900">Announcements</h3>
                                <p class="mt-2 text-sm text-gray-500">Coming soon...</p>
                            </div>
                        </div>
                        <div class="overflow-hidden rounded-lg bg-white shadow">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900">Nearby Dealers</h3>
                                <p class="mt-2 text-sm text-gray-500">Coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
