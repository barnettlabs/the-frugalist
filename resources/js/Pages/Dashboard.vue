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

                <!-- Main Apps Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left column - Apps -->
                    <div class="lg:col-span-2">
                        <div class="mb-6">
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">
                                Your Applications
                            </h2>
                            <p class="text-gray-600">
                                Access your tools and manage your vehicle
                                calculations
                            </p>
                        </div>

                        <!-- Futuristic Apps Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                v-for="(action, actionIdx) in actions"
                                :key="action.name"
                                class="group relative"
                            >
                                <Link :href="action.href">
                                    <div
                                        class="futuristic-card p-6 cursor-pointer transition-all duration-150 group-hover:neon-glow"
                                    >
                                        <!-- Icon Section -->
                                        <div
                                            class="flex items-center justify-between mb-4"
                                        >
                                            <div
                                                class="p-3 rounded-xl"
                                                :class="[action.iconBackground]"
                                            >
                                                <component
                                                    :is="action.icon"
                                                    class="h-8 w-8"
                                                    :class="[
                                                        action.iconForeground,
                                                    ]"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div
                                                class="opacity-50 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg
                                                    class="w-6 h-6 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                    ></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <!-- Content -->
                                        <h3
                                            class="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors"
                                        >
                                            {{ action.name }}
                                        </h3>
                                        <p
                                            class="text-gray-600 text-sm leading-relaxed"
                                        >
                                            {{ action.description }}
                                        </p>

                                        <!-- Status indicator -->
                                        <div
                                            class="mt-4 flex items-center text-xs"
                                        >
                                            <div
                                                class="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"
                                            ></div>
                                            <span class="text-gray-500">{{
                                                action.href.includes(
                                                    "coming-soon",
                                                )
                                                    ? "Coming Soon"
                                                    : "Available"
                                            }}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <!-- Right column - Information Panels -->
                    <div class="space-y-6">
                        <!-- System Status -->
                        <div class="futuristic-card p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-bold text-gray-900">
                                    System Status
                                </h3>
                                <div
                                    class="w-3 h-3 bg-success rounded-full animate-pulse"
                                ></div>
                            </div>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600"
                                        >API Services</span
                                    >
                                    <span
                                        class="text-xs px-2 py-1 bg-success/10 text-success rounded-full"
                                        >Operational</span
                                    >
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600"
                                        >Database</span
                                    >
                                    <span
                                        class="text-xs px-2 py-1 bg-success/10 text-success rounded-full"
                                        >Healthy</span
                                    >
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600"
                                        >Cache</span
                                    >
                                    <span
                                        class="text-xs px-2 py-1 bg-success/10 text-success rounded-full"
                                        >Active</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="futuristic-card p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div class="space-y-3">
                                <Link
                                    href="/estimates/financing/create"
                                    class="block"
                                >
                                    <button
                                        class="w-full text-left p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
                                    >
                                        <div class="flex items-center">
                                            <div
                                                class="w-2 h-2 bg-primary rounded-full mr-3"
                                            ></div>
                                            <span
                                                class="text-sm font-medium group-hover:text-primary"
                                                >New Finance Calculator</span
                                            >
                                        </div>
                                    </button>
                                </Link>
                                <Link
                                    href="/estimates/leasing/create"
                                    class="block"
                                >
                                    <button
                                        class="w-full text-left p-3 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors group"
                                    >
                                        <div class="flex items-center">
                                            <div
                                                class="w-2 h-2 bg-secondary rounded-full mr-3"
                                            ></div>
                                            <span
                                                class="text-sm font-medium group-hover:text-secondary"
                                                >New Lease Calculator</span
                                            >
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <!-- Coming Soon Features -->
                        <div class="futuristic-card p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">
                                Coming Soon
                            </h3>
                            <div class="space-y-3">
                                <div
                                    class="flex items-center p-3 rounded-lg bg-gray-50"
                                >
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mr-3 animate-pulse"
                                    ></div>
                                    <span class="text-sm text-gray-600"
                                        >Dealer Reviews</span
                                    >
                                </div>
                                <div
                                    class="flex items-center p-3 rounded-lg bg-gray-50"
                                >
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mr-3 animate-pulse"
                                    ></div>
                                    <span class="text-sm text-gray-600"
                                        >Vehicle Finder</span
                                    >
                                </div>
                                <div
                                    class="flex items-center p-3 rounded-lg bg-gray-50"
                                >
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mr-3 animate-pulse"
                                    ></div>
                                    <span class="text-sm text-gray-600"
                                        >Mobile App</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
