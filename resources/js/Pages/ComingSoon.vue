<script setup>
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

const props = defineProps({
    user: Object,
    profile: Object,
})
</script>

<template>
    <Head title="Coming Soon" />

    <AuthenticatedLayout :user="user" :profile="profile">
        <main class="-mt-16 pb-8 flex-1">
            <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div class="flex items-center justify-center min-h-[60vh]">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h1>
                        <p class="text-xl text-gray-600 mb-8">This feature is under development.</p>
                        <Link
                            href="/dashboard"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
