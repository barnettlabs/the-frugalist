<script setup>
import { Head, Link } from '@inertiajs/vue3';
import {
    BanknotesIcon,
    CurrencyDollarIcon,
    PhoneIcon,
    UserCircleIcon,
    BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid';

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
});

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
</script>

<template>
    <Head title="Welcome to Sneaky Salesman" />

    <div class="min-h-screen bg-gray-100">
        <!-- Header -->
        <header class="bg-animated-gradient relative overflow-hidden">
            <!-- Floating geometric shapes -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute -top-4 -right-4 w-72 h-72 bg-white opacity-5 rounded-full"></div>
                <div class="absolute top-20 -left-10 w-48 h-48 bg-white opacity-10 rounded-full"></div>
            </div>

            <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <!-- Navigation -->
                <nav class="flex items-center justify-between py-6">
                    <div class="flex flex-col items-start">
                        <span class="text-2xl font-bold text-white neon-text">
                            Sneaky Salesman
                        </span>
                        <span class="text-white/80 text-sm font-medium">
                            Your personal sales renegade
                        </span>
                    </div>

                    <div v-if="canLogin" class="flex items-center space-x-4">
                        <Link
                            v-if="$page.props.auth.user"
                            :href="route('dashboard')"
                            class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150"
                        >
                            Dashboard
                        </Link>
                        <template v-else>
                            <Link
                                :href="route('login')"
                                class="text-white hover:text-white/80 px-4 py-2 font-medium"
                            >
                                Log in
                            </Link>
                            <Link
                                v-if="canRegister"
                                :href="route('register')"
                                class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-150"
                            >
                                Register
                            </Link>
                        </template>
                    </div>
                </nav>

                <!-- Hero Section -->
                <div class="py-20 text-center">
                    <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
                        Smart Vehicle Finance
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                            Made Simple
                        </span>
                    </h1>
                    <p class="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                        Get the best deals on vehicle financing and leasing with our advanced calculators and expert insights.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            :href="$page.props.auth.user ? '/estimates/financing/create' : route('register')"
                            class="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-150 hover:neon-glow"
                        >
                            Start Calculating
                        </Link>
                        <Link
                            href="#applications"
                            class="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-150"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="py-16">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <!-- Applications Section -->
                <section id="applications" class="mb-16">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-gray-900 mb-4">Your Applications</h2>
                        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                            Access powerful tools and manage your vehicle calculations with our comprehensive suite of applications
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div v-for="action in actions" :key="action.name" class="group relative">
                            <Link :href="action.href">
                                <div class="futuristic-card p-8 cursor-pointer transition-all duration-150 hover:neon-glow">
                                    <!-- Icon Section -->
                                    <div class="flex items-center justify-between mb-6">
                                        <div class="p-4 rounded-xl" :class="[action.iconBackground]">
                                            <component
                                                :is="action.icon"
                                                class="h-8 w-8"
                                                :class="[action.iconForeground]"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div class="opacity-50 group-hover:opacity-100 transition-opacity">
                                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                            </svg>
                                        </div>
                                    </div>

                                    <!-- Content -->
                                    <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                        {{ action.name }}
                                    </h3>
                                    <p class="text-gray-600 text-sm leading-relaxed mb-4">
                                        {{ action.description }}
                                    </p>

                                    <!-- Status indicator -->
                                    <div class="flex items-center text-xs">
                                        <div class="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                                        <span class="text-gray-500">{{ action.href.includes('coming-soon') ? 'Coming Soon' : 'Available' }}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- System Status -->
                    <div class="futuristic-card p-8">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-2xl font-bold text-gray-900">System Status</h3>
                            <div class="w-4 h-4 bg-success rounded-full animate-pulse"></div>
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium">API Services</span>
                                <span class="text-sm px-3 py-1 bg-success/10 text-success rounded-full font-medium">Operational</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium">Database</span>
                                <span class="text-sm px-3 py-1 bg-success/10 text-success rounded-full font-medium">Healthy</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium">Cache System</span>
                                <span class="text-sm px-3 py-1 bg-success/10 text-success rounded-full font-medium">Active</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium">Security</span>
                                <span class="text-sm px-3 py-1 bg-success/10 text-success rounded-full font-medium">Protected</span>
                            </div>
                        </div>
                    </div>

                    <!-- Coming Soon Features -->
                    <div class="futuristic-card p-8">
                        <h3 class="text-2xl font-bold text-gray-900 mb-6">Coming Soon</h3>
                        <div class="space-y-4">
                            <div class="flex items-center p-4 rounded-lg bg-gray-50">
                                <div class="w-3 h-3 bg-warning rounded-full mr-4 animate-pulse"></div>
                                <div>
                                    <p class="font-medium text-gray-900">Dealer Reviews & Ratings</p>
                                    <p class="text-sm text-gray-600">Community-driven dealer insights</p>
                                </div>
                            </div>
                            <div class="flex items-center p-4 rounded-lg bg-gray-50">
                                <div class="w-3 h-3 bg-info rounded-full mr-4 animate-pulse"></div>
                                <div>
                                    <p class="font-medium text-gray-900">AI Vehicle Finder</p>
                                    <p class="text-sm text-gray-600">Smart vehicle recommendations</p>
                                </div>
                            </div>
                            <div class="flex items-center p-4 rounded-lg bg-gray-50">
                                <div class="w-3 h-3 bg-secondary rounded-full mr-4 animate-pulse"></div>
                                <div>
                                    <p class="font-medium text-gray-900">Mobile Application</p>
                                    <p class="text-sm text-gray-600">Calculate on the go</p>
                                </div>
                            </div>
                            <div class="flex items-center p-4 rounded-lg bg-gray-50">
                                <div class="w-3 h-3 bg-primary rounded-full mr-4 animate-pulse"></div>
                                <div>
                                    <p class="font-medium text-gray-900">Market Analytics</p>
                                    <p class="text-sm text-gray-600">Real-time pricing insights</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-12">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-xl font-bold mb-4 neon-text">Sneaky Salesman</h3>
                        <p class="text-gray-400">
                            Empowering consumers with transparent vehicle financing tools and expert insights.
                        </p>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li><Link href="/estimates/financing" class="hover:text-white transition-colors">Finance Calculator</Link></li>
                            <li><Link href="/estimates/leasing" class="hover:text-white transition-colors">Lease Calculator</Link></li>
                            <li><Link href="/coming-soon" class="hover:text-white transition-colors">Expert Support</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Contact</h4>
                        <p class="text-gray-400">
                            <a href="mailto:jason.barnett@jaytech.io" class="hover:text-white transition-colors">
                                jason.barnett@jaytech.io
                            </a>
                        </p>
                        <p class="text-gray-400 mt-2">
                            &copy; {{ new Date().getFullYear() }} JayTech LLC. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>
