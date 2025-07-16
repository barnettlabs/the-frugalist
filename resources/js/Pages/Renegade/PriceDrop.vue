<script setup lang="ts">
import { Head, Link } from "@inertiajs/vue3";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.vue";
import GuestLayout from "@/Layouts/GuestLayout.vue";
import {
    MagnifyingGlassIcon,
    BellIcon,
    ChartBarIcon,
    ShoppingCartIcon,
    ClockIcon,
    CheckCircleIcon,
    BuildingStorefrontIcon,
} from "@heroicons/vue/24/outline";

interface User {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
}

interface Props {
    user?: User;
}

const props = defineProps<Props>();

const features = [
    {
        icon: MagnifyingGlassIcon,
        title: "Smart SKU Monitoring",
        description:
            "Track unlimited products across multiple retailers with intelligent SKU recognition.",
    },
    {
        icon: BellIcon,
        title: "Instant Alerts",
        description:
            "Get notified immediately when prices drop below your set thresholds via email, SMS, or push notifications.",
    },
    {
        icon: ChartBarIcon,
        title: "Price History Analysis",
        description:
            "View detailed price trends and analytics to make informed purchasing decisions.",
    },
    {
        icon: ShoppingCartIcon,
        title: "Direct Purchase Links",
        description:
            "One-click access to purchase items at their lowest prices before deals expire.",
    },
    {
        icon: ClockIcon,
        title: "Flexible Monitoring",
        description:
            "Set custom monitoring periods, from flash sales to long-term seasonal patterns.",
    },
    {
        icon: CheckCircleIcon,
        title: "Deal Validation",
        description:
            "Automatically verify if deals are genuine and not just inflated original prices.",
    },
];

const supportedStores = [
    {
        name: "Amazon",
        description: "Electronics, books, home goods, and millions of products",
        logo: "🛒",
        categories: [
            "Electronics",
            "Books",
            "Home & Garden",
            "Fashion",
            "Groceries",
        ],
    },
    {
        name: "Best Buy",
        description: "Consumer electronics, appliances, and tech accessories",
        logo: "🔌",
        categories: [
            "Electronics",
            "Appliances",
            "Gaming",
            "Mobile",
            "Smart Home",
        ],
    },
    {
        name: "Target",
        description: "Retail essentials, home goods, fashion, and groceries",
        logo: "🎯",
        categories: ["Home & Garden", "Fashion", "Beauty", "Baby", "Groceries"],
    },
    {
        name: "Home Depot",
        description: "Home improvement, tools, hardware, and building supplies",
        logo: "🔨",
        categories: [
            "Tools",
            "Hardware",
            "Building Materials",
            "Garden",
            "Appliances",
        ],
    },
    {
        name: "Lowes",
        description:
            "Home improvement, appliances, tools, and outdoor equipment",
        logo: "🏠",
        categories: [
            "Home Improvement",
            "Tools",
            "Appliances",
            "Outdoor",
            "Hardware",
        ],
    },
];
</script>

<template>
    <Head title="Price Drop Renegade - Coming Soon" />

    <component :is="user ? AuthenticatedLayout : GuestLayout" :user="user">
        <main class="py-12" :class="{ '-mt-24': user }">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <!-- Hero Section -->
                <div class="mb-16">
                    <div
                        class="glass rounded-2xl p-8 text-gray-900 bg-white/80 relative overflow-hidden"
                    >
                        <!-- Background decoration -->
                        <div
                            class="absolute inset-0 overflow-hidden pointer-events-none"
                        >
                            <div
                                class="absolute -top-4 -right-4 w-32 h-32 bg-warning/5 rounded-full"
                            ></div>
                            <div
                                class="absolute bottom-0 -left-4 w-24 h-24 bg-warning/10 rounded-full"
                            ></div>
                        </div>

                        <div class="relative text-center">
                            <div
                                class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/20 mb-6"
                            >
                                <MagnifyingGlassIcon
                                    class="h-10 w-10 text-warning"
                                />
                            </div>
                            <h1 class="text-5xl font-bold text-gray-900 mb-4">
                                Price Drop Renegade
                            </h1>
                            <div
                                class="inline-flex items-center px-4 py-2 rounded-full bg-warning/10 text-warning font-medium text-sm mb-6"
                            >
                                <ClockIcon class="h-4 w-4 mr-2" />
                                Coming Soon
                            </div>
                            <p
                                class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                            >
                                Turn the tables on retailers with intelligent
                                price monitoring. Get notified the moment prices
                                drop below your threshold and never miss a deal
                                again.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Features Grid -->
                <div class="mb-16">
                    <h2
                        class="text-3xl font-bold text-gray-900 text-center mb-12"
                    >
                        How It Works
                    </h2>
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <div
                            v-for="feature in features"
                            :key="feature.title"
                            class="futuristic-card p-6"
                        >
                            <div
                                class="p-3 rounded-xl bg-gradient-to-br from-warning/10 to-warning/20 w-fit mb-4"
                            >
                                <component
                                    :is="feature.icon"
                                    class="h-6 w-6 text-warning"
                                />
                            </div>
                            <h3 class="text-lg font-bold text-gray-900 mb-3">
                                {{ feature.title }}
                            </h3>
                            <p class="text-gray-600 text-sm leading-relaxed">
                                {{ feature.description }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Supported Stores -->
                <div class="mb-16">
                    <h2
                        class="text-3xl font-bold text-gray-900 text-center mb-12"
                    >
                        Supported Retailers
                    </h2>
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <div
                            v-for="store in supportedStores"
                            :key="store.name"
                            class="futuristic-card p-6"
                        >
                            <div class="flex items-center mb-4">
                                <div class="text-3xl mr-4">
                                    {{ store.logo }}
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-gray-900">
                                        {{ store.name }}
                                    </h3>
                                    <p class="text-gray-600 text-sm">
                                        {{ store.description }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="category in store.categories"
                                    :key="category"
                                    class="text-xs px-2 py-1 bg-warning/10 text-warning rounded-md font-medium"
                                >
                                    {{ category }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-8">
                        <p class="text-gray-600 text-sm">
                            <BuildingStorefrontIcon
                                class="h-4 w-4 inline mr-1"
                            />
                            More retailers will be added based on user demand
                            and API availability
                        </p>
                    </div>
                </div>

                <!-- Use Cases -->
                <div class="mb-16">
                    <div class="futuristic-card p-8">
                        <h2
                            class="text-3xl font-bold text-gray-900 text-center mb-8"
                        >
                            Perfect For
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="space-y-6">
                                <div class="flex items-start space-x-4">
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"
                                    ></div>
                                    <div>
                                        <h4
                                            class="font-bold text-gray-900 mb-1"
                                        >
                                            Tech Enthusiasts
                                        </h4>
                                        <p class="text-gray-600 text-sm">
                                            Monitor electronics, gadgets, and
                                            tech accessories for price drops
                                            during sales events.
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-4">
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"
                                    ></div>
                                    <div>
                                        <h4
                                            class="font-bold text-gray-900 mb-1"
                                        >
                                            Fashion Shoppers
                                        </h4>
                                        <p class="text-gray-600 text-sm">
                                            Track clothing, shoes, and
                                            accessories across multiple brands
                                            and retailers.
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-4">
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"
                                    ></div>
                                    <div>
                                        <h4
                                            class="font-bold text-gray-900 mb-1"
                                        >
                                            Home Improvement
                                        </h4>
                                        <p class="text-gray-600 text-sm">
                                            Monitor tools, appliances, and home
                                            goods for seasonal discounts.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-6">
                                <div class="flex items-start space-x-4">
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"
                                    ></div>
                                    <div>
                                        <h4
                                            class="font-bold text-gray-900 mb-1"
                                        >
                                            Gift Planners
                                        </h4>
                                        <p class="text-gray-600 text-sm">
                                            Set up monitoring for gifts months
                                            in advance and buy when prices are
                                            lowest.
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-4">
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"
                                    ></div>
                                    <div>
                                        <h4
                                            class="font-bold text-gray-900 mb-1"
                                        >
                                            Business Buyers
                                        </h4>
                                        <p class="text-gray-600 text-sm">
                                            Track office supplies, equipment,
                                            and bulk purchases for better profit
                                            margins.
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-4">
                                    <div
                                        class="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"
                                    ></div>
                                    <div>
                                        <h4
                                            class="font-bold text-gray-900 mb-1"
                                        >
                                            Bargain Hunters
                                        </h4>
                                        <p class="text-gray-600 text-sm">
                                            Anyone who wants to maximize savings
                                            and never pay full price again.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Call to Action -->
                <div class="text-center">
                    <div class="futuristic-card p-8 max-w-2xl mx-auto">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">
                            Be the First to Know
                        </h2>
                        <p class="text-gray-600 mb-6">
                            Price Drop Renegade is currently in development.
                            Join our waitlist to be notified when it launches
                            and get early access to beta features.
                        </p>
                        <div
                            class="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                href="/"
                                class="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-xl font-medium transition-all duration-150"
                            >
                                ← Back to Home
                            </Link>
                            <Link
                                href="/register"
                                class="bg-warning hover:bg-warning-shade-1 text-white px-8 py-3 rounded-xl font-medium transition-all duration-150 hover:neon-glow"
                            >
                                Join Waitlist
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </component>
</template>
