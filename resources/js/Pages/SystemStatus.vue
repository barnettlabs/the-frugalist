<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Head, Link } from "@inertiajs/vue3";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.vue";
import GuestLayout from "@/Layouts/GuestLayout.vue";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ClockIcon,
    CpuChipIcon,
    ServerIcon,
    ShieldCheckIcon,
    CircleStackIcon,
} from "@heroicons/vue/24/outline";
import type { Component } from 'vue';

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

type StatusType = 'operational' | 'degraded' | 'outage';

interface SystemMetric {
    name: string;
    status: StatusType;
    uptime: string;
    responseTime: string;
    icon: Component;
    lastUpdate: string;
    description: string;
}

interface Incident {
    title: string;
    status: 'resolved' | 'completed' | 'ongoing';
    date: string;
    duration: string;
    impact: string;
    description: string;
}

interface StatusColors {
    bg: string;
    text: string;
    border: string;
    icon: Component;
}

const systemMetrics = ref<SystemMetric[]>([
    {
        name: "API Services",
        status: "operational",
        uptime: "99.99%",
        responseTime: "45ms",
        icon: ServerIcon,
        lastUpdate: "2 minutes ago",
        description: "All API endpoints responding normally"
    },
    {
        name: "Database",
        status: "operational",
        uptime: "99.97%",
        responseTime: "12ms",
        icon: CircleStackIcon,
        lastUpdate: "1 minute ago",
        description: "Database queries executing within normal parameters"
    },
    {
        name: "Cache System",
        status: "operational",
        uptime: "99.95%",
        responseTime: "2ms",
        icon: CpuChipIcon,
        lastUpdate: "30 seconds ago",
        description: "Redis cache performing optimally"
    },
    {
        name: "Security",
        status: "operational",
        uptime: "100%",
        responseTime: "8ms",
        icon: ShieldCheckIcon,
        lastUpdate: "15 seconds ago",
        description: "All security protocols active and monitoring"
    },
]);

const recentIncidents = ref<Incident[]>([
    {
        title: "Database Connection Pool Optimization",
        status: "resolved",
        date: "2024-07-15 14:30",
        duration: "15 minutes",
        impact: "Low",
        description: "Temporary increased response times during database pool optimization. All services restored to normal performance."
    },
    {
        title: "Scheduled Maintenance - Cache Upgrade",
        status: "completed",
        date: "2024-07-14 02:00",
        duration: "2 hours",
        impact: "None",
        description: "Planned Redis cache upgrade completed successfully with zero downtime."
    },
]);

const getStatusColor = (status: StatusType): StatusColors => {
    switch (status) {
        case 'operational':
            return {
                bg: 'bg-success/10',
                text: 'text-success',
                border: 'border-success/20',
                icon: CheckCircleIcon
            };
        case 'degraded':
            return {
                bg: 'bg-warning/10',
                text: 'text-warning',
                border: 'border-warning/20',
                icon: ExclamationTriangleIcon
            };
        case 'outage':
            return {
                bg: 'bg-danger/10',
                text: 'text-danger',
                border: 'border-danger/20',
                icon: XCircleIcon
            };
        default:
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-600',
                border: 'border-gray-200',
                icon: ClockIcon
            };
    }
};

const overallStatus = computed((): { status: string; color: string } => {
    const statuses = systemMetrics.value.map(metric => metric.status);
    if (statuses.every(status => status === 'operational')) {
        return { status: 'All Systems Operational', color: 'text-success' };
    } else if (statuses.some(status => status === 'outage')) {
        return { status: 'System Outage Detected', color: 'text-danger' };
    } else {
        return { status: 'Degraded Performance', color: 'text-warning' };
    }
});
</script>

<template>
    <Head title="System Status - Sneaky Salesman" />

    <component :is="user ? AuthenticatedLayout : 'div'" :user="user">
        <div class="min-h-screen bg-gray-100" :class="{ 'pt-24': !user }">
            <!-- Header -->
            <div v-if="!user" class="bg-white shadow-sm">
                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between py-6">
                        <Link href="/" class="flex items-center space-x-3">
                            <span class="text-2xl font-bold text-gray-900">Sneaky Salesman</span>
                        </Link>
                        <div class="flex items-center space-x-4">
                            <Link href="/login" class="text-gray-600 hover:text-gray-900 font-medium">
                                Login
                            </Link>
                            <Link href="/register" class="bg-primary hover:bg-primary-shade-1 text-white px-4 py-2 rounded-lg font-medium transition-all">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <main class="py-12" :class="{ '-mt-24': user }">
                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <!-- Page Header -->
                    <div class="mb-8">
                        <div class="futuristic-card p-8 bg-white relative overflow-hidden">
                            <!-- Background decoration -->
                            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                                <div class="absolute -top-4 -right-4 w-32 h-32 bg-success/5 rounded-full"></div>
                                <div class="absolute bottom-0 -left-4 w-24 h-24 bg-primary/5 rounded-full"></div>
                            </div>

                            <div class="relative">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 class="text-4xl font-bold text-gray-900 mb-2">System Status</h1>
                                        <p class="text-lg text-gray-600">Real-time monitoring of all renegade systems</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="flex items-center justify-end mb-2">
                                            <CheckCircleIcon class="h-8 w-8 text-success mr-2" />
                                            <span class="text-2xl font-bold" :class="overallStatus.color">
                                                {{ overallStatus.status }}
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-500">Last updated: just now</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Metrics Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div v-for="metric in systemMetrics" :key="metric.name" class="futuristic-card p-6">
                            <div class="flex items-center justify-between mb-4">
                                <component :is="metric.icon" class="h-8 w-8 text-gray-600" />
                                <div class="flex items-center space-x-2">
                                    <div
                                        class="w-3 h-3 rounded-full animate-pulse"
                                        :class="getStatusColor(metric.status).bg.replace('/10', '')"
                                    ></div>
                                    <span
                                        class="text-sm font-medium capitalize"
                                        :class="getStatusColor(metric.status).text"
                                    >
                                        {{ metric.status }}
                                    </span>
                                </div>
                            </div>

                            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ metric.name }}</h3>
                            <p class="text-sm text-gray-600 mb-4">{{ metric.description }}</p>

                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Uptime</span>
                                    <span class="font-medium">{{ metric.uptime }}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Response Time</span>
                                    <span class="font-medium">{{ metric.responseTime }}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Last Check</span>
                                    <span class="font-medium">{{ metric.lastUpdate }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Incidents -->
                    <div class="mb-12">
                        <div class="futuristic-card p-8">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Recent Incidents</h2>
                                    <p class="text-gray-600">System incidents and maintenance windows from the past 30 days</p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div v-for="incident in recentIncidents" :key="incident.title" class="p-6 rounded-lg bg-gray-50 border border-gray-200">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center space-x-3">
                                            <div
                                                class="w-3 h-3 rounded-full"
                                                :class="incident.status === 'resolved' || incident.status === 'completed' ? 'bg-success' : 'bg-warning'"
                                            ></div>
                                            <h3 class="font-bold text-gray-900">{{ incident.title }}</h3>
                                        </div>
                                        <span
                                            class="text-xs px-2 py-1 rounded-full font-medium"
                                            :class="incident.status === 'resolved' || incident.status === 'completed'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-warning/10 text-warning'"
                                        >
                                            {{ incident.status }}
                                        </span>
                                    </div>

                                    <p class="text-gray-600 mb-3">{{ incident.description }}</p>

                                    <div class="flex items-center space-x-6 text-sm text-gray-500">
                                        <span><strong>Date:</strong> {{ incident.date }}</span>
                                        <span><strong>Duration:</strong> {{ incident.duration }}</span>
                                        <span><strong>Impact:</strong> {{ incident.impact }}</span>
                                    </div>
                                </div>

                                <div v-if="recentIncidents.length === 0" class="text-center py-8">
                                    <CheckCircleIcon class="h-12 w-12 text-success mx-auto mb-4" />
                                    <p class="text-gray-600">No incidents reported in the past 30 days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Charts Placeholder -->
                    <div class="mb-12">
                        <div class="futuristic-card p-8">
                            <h2 class="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div class="p-6 rounded-lg bg-gray-50 border border-gray-200">
                                    <h3 class="font-bold text-gray-900 mb-4">Response Time Trends</h3>
                                    <div class="h-48 flex items-center justify-center text-gray-500">
                                        <div class="text-center">
                                            <ClockIcon class="h-12 w-12 mx-auto mb-2" />
                                            <p>Response time charts coming soon</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-6 rounded-lg bg-gray-50 border border-gray-200">
                                    <h3 class="font-bold text-gray-900 mb-4">Uptime History</h3>
                                    <div class="h-48 flex items-center justify-center text-gray-500">
                                        <div class="text-center">
                                            <CheckCircleIcon class="h-12 w-12 mx-auto mb-2" />
                                            <p>Uptime history charts coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Back to Home -->
                    <div class="text-center">
                        <Link href="/" class="bg-primary hover:bg-primary-shade-1 text-white px-8 py-3 rounded-xl font-medium transition-all duration-150 hover:neon-glow">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    </component>
</template>
