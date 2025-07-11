<script setup>
import { ref, onMounted } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import axios from 'axios'

const props = defineProps({
    user: Object,
    profile: Object,
})

const vehicleLeaseSheets = ref([])
const loading = ref(true)

const fetchSheets = async () => {
    try {
        const response = await axios.get('/api/vehicle-lease-sheets')
        vehicleLeaseSheets.value = response.data
    } catch (error) {
        console.error('Error fetching lease sheets:', error)
    } finally {
        loading.value = false
    }
}

const deleteSheet = async (sheetId) => {
    if (confirm('Are you sure you want to delete this estimate?')) {
        try {
            await axios.delete(`/api/vehicle-lease-sheets/${sheetId}`)
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
    <Head title="Lease Estimates" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-24 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
                    <div class="grid grid-cols-1 gap-2 lg:col-span-2">
                        <section aria-labelledby="lease-estimates-overview-title">
                            <ul class="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                <!-- Loading state -->
                                <div v-if="loading" class="col-span-full">
                                    <div class="flex items-center justify-center p-8">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                </div>

                                <!-- Empty state -->
                                <Link
                                    v-else-if="!vehicleLeaseSheets.length"
                                    href="/estimates/leasing/create"
                                    class="block"
                                >
                                    <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors shadow">
                                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 class="mt-2 text-sm font-medium text-gray-900">No lease estimates</h3>
                                        <p class="mt-1 text-sm text-gray-500">Get started by creating a new lease estimate.</p>
                                    </div>
                                </Link>

                                <!-- Sheets list -->
                                <template v-else>
                                    <li
                                        v-for="(sheet, sheetIndex) in vehicleLeaseSheets"
                                        :key="sheet.id"
                                        class="list-none"
                                    >
                                        <div class="bg-white overflow-hidden shadow rounded-lg">
                                            <div class="p-6">
                                                <div class="flex items-center justify-between">
                                                    <div>
                                                        <h3 class="text-lg font-medium text-gray-900">
                                                            {{ sheet.sheet_name || `Lease Estimate ${sheetIndex + 1}` }}
                                                        </h3>
                                                        <p class="text-sm text-gray-500">
                                                            {{ sheet.dealership_name || 'No dealership' }}
                                                        </p>
                                                    </div>
                                                    <div class="flex space-x-2">
                                                        <Link
                                                            :href="`/estimates/leasing/${sheet.id}/edit`"
                                                            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            @click="deleteSheet(sheet.id)"
                                                            class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span class="text-gray-500">MSRP:</span>
                                                        <span class="ml-2 font-medium">${{ sheet.msrp || '0' }}</span>
                                                    </div>
                                                    <div>
                                                        <span class="text-gray-500">Lease Term:</span>
                                                        <span class="ml-2 font-medium">{{ sheet.lease_term || '0' }} months</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <!-- Add new sheet -->
                                    <Link href="/estimates/leasing/create" class="list-none">
                                        <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors shadow">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <h3 class="mt-2 text-sm font-medium text-gray-900">Create new estimate</h3>
                                            <p class="mt-1 text-sm text-gray-500">Add a new lease estimate.</p>
                                        </div>
                                    </Link>
                                </template>
                            </ul>
                        </section>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <!-- Placeholder for notifications -->
                        <div class="overflow-hidden rounded-lg bg-white shadow">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
                                <p class="mt-2 text-sm text-gray-500">Coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
