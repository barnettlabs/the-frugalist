<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { BanknotesIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import axios from 'axios'
import type { Component } from 'vue'

interface User {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
}

interface VehicleFinanceSheet {
    id: number;
    sheet_name?: string;
    dealership_name?: string;
    msrp?: number;
    down_payment?: number;
    vehicle_year?: number;
    vehicle_make?: string;
    vehicle_model?: string;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    user: User;
    profile?: object;
}

const props = defineProps<Props>();

const vehicleFinanceSheets = ref<VehicleFinanceSheet[]>([])
const loading = ref(true)

const fetchSheets = async () => {
    try {
        const response = await axios.get('/api/vehicle-finance-sheets')
        vehicleFinanceSheets.value = response.data
    } catch (error) {
        console.error('Error fetching finance sheets:', error)
    } finally {
        loading.value = false
    }
}

const deleteSheet = async (sheetId: number) => {
    if (confirm('Are you sure you want to delete this estimate?')) {
        try {
            await axios.delete(`/api/vehicle-finance-sheets/${sheetId}`)
            await fetchSheets() // Refresh the list
        } catch (error) {
            console.error('Error deleting sheet:', error)
        }
    }
}

onMounted(() => {
    fetchSheets()
})
</script>

<template>
    <Head title="Finance Renegade" />

    <AuthenticatedLayout :user="user">
        <main class="-mt-24 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <!-- Hero Header -->
                <div class="mb-8">
                    <div class="glass rounded-2xl p-8 text-gray-900 bg-white/80 relative overflow-hidden">
                        <!-- Background decoration -->
                        <div class="absolute inset-0 overflow-hidden pointer-events-none">
                            <div class="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full"></div>
                            <div class="absolute bottom-0 -left-4 w-24 h-24 bg-primary/10 rounded-full"></div>
                        </div>

                        <div class="relative text-center lg:text-left">
                            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div class="flex items-center space-x-6 mb-6 lg:mb-0">
                                    <div class="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20">
                                        <BanknotesIcon class="h-12 w-12 text-primary" />
                                    </div>
                                    <div>
                                        <h1 class="text-4xl font-bold text-gray-900 mb-2">
                                            Finance Renegade
                                        </h1>
                                        <p class="text-lg text-gray-600">
                                            Break traditional financing rules with advanced calculations and real-time rates
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Link href="/estimates/financing/create">
                                        <button class="bg-primary hover:bg-primary-shade-1 px-6 py-3 rounded-xl font-medium text-white transition-all duration-150 hover:neon-glow flex items-center space-x-2">
                                            <PlusIcon class="h-5 w-5" />
                                            <span>New Estimate</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <div class="grid grid-cols-1 gap-2 lg:col-span-2">
                        <section aria-labelledby="finance-estimates-overview-title">
                            <div class="mb-6">
                                <h2 class="text-2xl font-bold text-gray-900 mb-2">Your Finance Estimates</h2>
                                <p class="text-gray-600">Manage your vehicle financing calculations and compare different scenarios</p>
                            </div>
                            <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <!-- Loading state -->
                                <div v-if="loading" class="col-span-full">
                                    <div class="flex items-center justify-center p-8">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                </div>

                                <!-- Empty state -->
                                <div v-else-if="!vehicleFinanceSheets.length" class="col-span-full">
                                    <div class="futuristic-card p-12 text-center">
                                        <div class="p-4 rounded-xl bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <BanknotesIcon class="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 class="text-lg font-bold text-gray-900 mb-2">No finance estimates yet</h3>
                                        <p class="text-gray-600 mb-6">Start your first vehicle financing calculation to outsmart dealers</p>
                                        <Link href="/estimates/financing/create">
                                            <button class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-xl font-medium transition-all duration-150 hover:neon-glow flex items-center space-x-2 mx-auto">
                                                <PlusIcon class="h-5 w-5" />
                                                <span>Create First Estimate</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>

                                <!-- Sheets list -->
                                <template v-else>
                                    <li
                                        v-for="(sheet, sheetIndex) in vehicleFinanceSheets"
                                        :key="sheet.id"
                                        class="list-none"
                                    >
                                        <div class="futuristic-card p-6 group hover:neon-glow transition-all duration-150">
                                            <div class="flex items-center justify-between mb-4">
                                                <div class="flex items-center space-x-3">
                                                    <div class="p-2 rounded-lg bg-primary/10">
                                                        <BanknotesIcon class="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                            {{ sheet.sheet_name || `Finance Estimate ${sheetIndex + 1}` }}
                                                        </h3>
                                                        <p class="text-sm text-gray-500">
                                                            {{ sheet.dealership_name || 'No dealership specified' }}
                                                        </p>
                                                        <p v-if="sheet.vehicle_year && sheet.vehicle_make && sheet.vehicle_model" class="text-xs text-gray-400">
                                                            {{ sheet.vehicle_year }} {{ sheet.vehicle_make }} {{ sheet.vehicle_model }}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="flex space-x-2">
                                                    <Link :href="`/estimates/financing/${sheet.id}/edit`">
                                                        <button class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors">
                                                            <PencilIcon class="h-4 w-4" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        @click="deleteSheet(sheet.id)"
                                                        class="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <TrashIcon class="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-3">
                                                <div>
                                                    <span class="text-gray-500 text-xs uppercase tracking-wide">MSRP</span>
                                                    <div class="font-bold text-gray-900">${{ sheet.msrp?.toLocaleString() || '0' }}</div>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500 text-xs uppercase tracking-wide">Down Payment</span>
                                                    <div class="font-bold text-gray-900">${{ sheet.down_payment?.toLocaleString() || '0' }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <!-- Add new sheet -->
                                    <li class="list-none">
                                        <Link href="/estimates/financing/create">
                                            <div class="futuristic-card p-8 text-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
                                                <div class="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                                                    <PlusIcon class="h-8 w-8 text-primary" />
                                                </div>
                                                <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Create New Estimate</h3>
                                                <p class="text-gray-600 text-sm">Start a new vehicle financing calculation</p>
                                            </div>
                                        </Link>
                                    </li>
                                </template>
                            </ul>
                        </section>
                    </div>

                    <div class="grid grid-cols-1 gap-6">
                        <!-- Quick Stats -->
                        <div class="futuristic-card p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Total Estimates</span>
                                    <span class="font-bold text-primary">{{ vehicleFinanceSheets.length }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Recent Activity</span>
                                    <span class="text-xs text-gray-500">{{ vehicleFinanceSheets.length ? 'Active' : 'No activity' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Pro Tips -->
                        <div class="futuristic-card p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">Renegade Tips</h3>
                            <div class="space-y-3">
                                <div class="flex items-start space-x-3">
                                    <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <p class="text-sm text-gray-600">Always negotiate the total price before discussing financing terms</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <p class="text-sm text-gray-600">Compare multiple financing scenarios to find the best deal</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <p class="text-sm text-gray-600">Know your credit score and get pre-approved before shopping</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
