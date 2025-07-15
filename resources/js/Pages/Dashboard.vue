<script setup>
import { ref, computed, onMounted } from "vue";
import { Head, Link } from "@inertiajs/vue3";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.vue";
import {
    BanknotesIcon,
    CurrencyDollarIcon,
    PhoneIcon,
    UserCircleIcon,
    BuildingStorefrontIcon,
} from "@heroicons/vue/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";

const props = defineProps({
    user: Object,
    vehicleFinanceSheets: Array,
    vehicleLeaseSheets: Array,
});

const stats = computed(() => [
    {
        label: "total loan sheets",
        value: props.vehicleFinanceSheets?.length ?? "-",
    },
    {
        label: "total lease sheets",
        value: props.vehicleLeaseSheets?.length ?? "-",
    },
    { label: "dealers nearby (coming soon)", value: "??" },
]);

const actions = [
    {
        icon: BanknotesIcon,
        name: "Purchase Calculator",
        description:
            "Advanced financing calculations with real-time rates and comprehensive payment analysis.",
        href: "/estimates/financing",
        iconForeground: "text-primary",
        iconBackground: "bg-gradient-to-br from-primary/10 to-primary/20",
    },
    {
        icon: CurrencyDollarIcon,
        name: "Lease Calculator",
        description:
            "Smart leasing calculations with tax benefits and residual value optimization.",
        href: "/estimates/leasing",
        iconForeground: "text-secondary",
        iconBackground: "bg-gradient-to-br from-secondary/10 to-secondary/20",
    },
    {
        icon: MagnifyingGlassIcon,
        name: "Vehicle Finder AI",
        description:
            "AI-powered vehicle recommendations based on your budget, preferences, and driving patterns.",
        href: "/coming-soon",
        iconForeground: "text-info",
        iconBackground: "bg-gradient-to-br from-info/10 to-info/20",
    },
    {
        icon: PhoneIcon,
        name: "Expert Support",
        description:
            "24/7 support from automotive finance experts and certified advisors.",
        href: "/coming-soon",
        iconForeground: "text-success",
        iconBackground: "bg-gradient-to-br from-success/10 to-success/20",
    },
    {
        icon: BuildingStorefrontIcon,
        name: "Dealer Intelligence",
        description:
            "Real-time dealer ratings, inventory tracking, and negotiation insights.",
        href: "/coming-soon",
        iconForeground: "text-warning",
        iconBackground: "bg-gradient-to-br from-warning/10 to-warning/20",
    },
    {
        icon: UserCircleIcon,
        name: "Salesperson Reviews",
        description:
            "Community-driven reviews and ratings to find trustworthy sales professionals.",
        href: "/coming-soon",
        iconForeground: "text-danger",
        iconBackground: "bg-gradient-to-br from-danger/10 to-danger/20",
    },
];

const fullName = computed(() => {
    return `${props.user?.first_name ?? ""} ${props.user?.last_name ?? ""}`.trim();
});
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout :user="user">
        <main class="-mt-24 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 class="sr-only">Dashboard</h1>

                <!-- Futuristic Dashboard Header -->
                <div class="mb-8">
                    <div
                        class="glass rounded-2xl p-8 text-gray-900 bg-white/80"
                    >
                        <div
                            class="flex flex-col lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div class="flex items-center space-x-6">
                                <div class="relative">
                                    <div
                                        class="h-20 w-20 rounded-full ring-4 ring-gray-200 overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                                    >
                                        <img
                                            v-if="user?.avatar_url"
                                            class="h-full w-full object-cover"
                                            :src="user?.avatar_url"
                                            :alt="fullName"
                                            @error="
                                                $event.target.style.display =
                                                    'none'
                                            "
                                        />
                                        <UserIcon
                                            v-else
                                            class="h-12 w-12 text-white"
                                        />
                                    </div>
                                    <div
                                        class="absolute -bottom-1 -right-1 h-6 w-6 bg-success rounded-full border-2 border-white"
                                    ></div>
                                </div>
                                <div>
                                    <p
                                        class="text-sm font-medium text-gray-600"
                                    >
                                        Welcome back,
                                    </p>
                                    <h1
                                        class="text-3xl font-bold text-gray-900"
                                    >
                                        {{ fullName }}
                                    </h1>
                                    <p class="text-sm text-gray-500">
                                        {{ user?.email }}
                                    </p>
                                </div>
                            </div>
                            <div class="mt-6 lg:mt-0">
                                <Link href="/profile">
                                    <button
                                        class="bg-primary hover:bg-primary-shade-1 px-6 py-3 rounded-xl font-medium text-white transition-all duration-100 hover:neon-glow"
                                    >
                                        Manage Profile
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <!-- Stats Row -->
                        <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div
                                v-for="stat in stats"
                                :key="stat.label"
                                class="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200"
                            >
                                <div class="text-2xl font-bold text-gray-900">
                                    {{ stat.value }}
                                </div>
                                <div
                                    class="text-sm text-gray-600 uppercase tracking-wide"
                                >
                                    {{ stat.label }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Dashboard Content -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Main Content Area -->
                    <div class="lg:col-span-2">
                        <!-- Quick Actions -->
                        <div class="mb-8">
                            <div class="mb-6">
                                <h2 class="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
                                <p class="text-gray-600">Start your calculation or access frequently used tools</p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link href="/estimates/financing/create" class="block">
                                    <div class="futuristic-card p-6 cursor-pointer transition-all duration-150 hover:neon-glow group">
                                        <div class="flex items-center justify-between mb-4">
                                            <div class="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20">
                                                <component :is="BanknotesIcon" class="h-8 w-8 text-primary" />
                                            </div>
                                            <div class="opacity-50 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">New Finance Calculator</h3>
                                        <p class="text-gray-600 text-sm">Start a new vehicle financing calculation</p>
                                    </div>
                                </Link>
                                <Link href="/estimates/leasing/create" class="block">
                                    <div class="futuristic-card p-6 cursor-pointer transition-all duration-150 hover:neon-glow group">
                                        <div class="flex items-center justify-between mb-4">
                                            <div class="p-3 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/20">
                                                <component :is="CurrencyDollarIcon" class="h-8 w-8 text-secondary" />
                                            </div>
                                            <div class="opacity-50 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-secondary transition-colors">New Lease Calculator</h3>
                                        <p class="text-gray-600 text-sm">Start a new vehicle leasing calculation</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <!-- Recent Calculations -->
                        <div class="mb-8">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-900">Recent Calculations</h2>
                                    <p class="text-gray-600">Your latest finance and lease estimates</p>
                                </div>
                                <Link href="/estimates/financing" class="text-primary hover:text-primary-shade-1 text-sm font-medium">
                                    View All →
                                </Link>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div v-if="vehicleFinanceSheets?.length > 0" v-for="sheet in vehicleFinanceSheets.slice(0, 2)" :key="sheet.id" class="futuristic-card p-6">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="p-2 rounded-lg bg-primary/10">
                                            <component :is="BanknotesIcon" class="h-5 w-5 text-primary" />
                                        </div>
                                        <span class="text-xs text-gray-500">Finance</span>
                                    </div>
                                    <h3 class="font-bold text-gray-900 mb-2">{{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}</h3>
                                    <p class="text-gray-600 text-sm mb-3">${{ sheet.vehicle_price?.toLocaleString() }} • {{ sheet.loan_term_months }} months</p>
                                    <Link :href="`/estimates/financing/${sheet.id}/edit`" class="text-primary hover:text-primary-shade-1 text-sm font-medium">
                                        Edit Calculation →
                                    </Link>
                                </div>
                                <div v-if="vehicleLeaseSheets?.length > 0" v-for="sheet in vehicleLeaseSheets.slice(0, 2)" :key="sheet.id" class="futuristic-card p-6">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="p-2 rounded-lg bg-secondary/10">
                                            <component :is="CurrencyDollarIcon" class="h-5 w-5 text-secondary" />
                                        </div>
                                        <span class="text-xs text-gray-500">Lease</span>
                                    </div>
                                    <h3 class="font-bold text-gray-900 mb-2">{{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}</h3>
                                    <p class="text-gray-600 text-sm mb-3">${{ sheet.vehicle_price?.toLocaleString() }} • {{ sheet.lease_term_months }} months</p>
                                    <Link :href="`/estimates/leasing/${sheet.id}/edit`" class="text-secondary hover:text-secondary-shade-1 text-sm font-medium">
                                        Edit Calculation →
                                    </Link>
                                </div>
                                <div v-if="(!vehicleFinanceSheets?.length && !vehicleLeaseSheets?.length)" class="col-span-2 futuristic-card p-8 text-center">
                                    <div class="p-4 rounded-xl bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    </div>
                                    <h3 class="text-lg font-bold text-gray-900 mb-2">No calculations yet</h3>
                                    <p class="text-gray-600 mb-4">Start your first vehicle calculation to see your estimates here</p>
                                    <Link href="/estimates/financing/create" class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150">
                                        Create First Calculation
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Sidebar -->
                    <div class="space-y-6">
                        <!-- Recent Activity -->
                        <div class="futuristic-card p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                            <div class="space-y-3">
                                <div class="flex items-start space-x-3">
                                    <div class="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div>
                                        <p class="text-sm text-gray-900 font-medium">Finance calculation</p>
                                        <p class="text-xs text-gray-500">2 minutes ago</p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                                    <div>
                                        <p class="text-sm text-gray-900 font-medium">Lease estimate updated</p>
                                        <p class="text-xs text-gray-500">1 hour ago</p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-2 h-2 bg-info rounded-full mt-2"></div>
                                    <div>
                                        <p class="text-sm text-gray-900 font-medium">Profile updated</p>
                                        <p class="text-xs text-gray-500">3 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Stats -->
                        <div class="futuristic-card p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">Overview</h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Total Calculations</span>
                                    <span class="font-bold text-gray-900">{{ (vehicleFinanceSheets?.length || 0) + (vehicleLeaseSheets?.length || 0) }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Finance Sheets</span>
                                    <span class="font-bold text-primary">{{ vehicleFinanceSheets?.length || 0 }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Lease Sheets</span>
                                    <span class="font-bold text-secondary">{{ vehicleLeaseSheets?.length || 0 }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div class="futuristic-card p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                            <div class="space-y-3">
                                <Link href="/estimates/financing" class="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center">
                                        <component :is="BanknotesIcon" class="h-5 w-5 text-primary mr-3" />
                                        <span class="text-sm font-medium">All Finance Estimates</span>
                                    </div>
                                </Link>
                                <Link href="/estimates/leasing" class="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center">
                                        <component :is="CurrencyDollarIcon" class="h-5 w-5 text-secondary mr-3" />
                                        <span class="text-sm font-medium">All Lease Estimates</span>
                                    </div>
                                </Link>
                                <Link href="/profile" class="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center">
                                        <component :is="UserCircleIcon" class="h-5 w-5 text-info mr-3" />
                                        <span class="text-sm font-medium">Profile Settings</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
