<template>
    <div class="futuristic-card p-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900">Payment Analysis</h3>
            <div class="flex items-center space-x-2">
                <button
                    @click="chartType = 'line'"
                    :class="chartType === 'line' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'"
                    class="px-3 py-1 text-sm rounded-lg transition-colors"
                >
                    Line Chart
                </button>
                <button
                    @click="chartType = 'pie'"
                    :class="chartType === 'pie' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'"
                    class="px-3 py-1 text-sm rounded-lg transition-colors"
                >
                    Pie Chart
                </button>
            </div>
        </div>

        <div v-if="paymentBreakdown">
            <!-- Line Chart -->
            <div v-if="chartType === 'line'" class="mb-6">
                <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div class="text-center">
                        <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <p class="text-sm text-gray-500">Monthly Payment Breakdown</p>
                        <p class="text-xs text-gray-400">Chart visualization would go here</p>
                    </div>
                </div>
            </div>

            <!-- Pie Chart -->
            <div v-if="chartType === 'pie'" class="mb-6">
                <div class="h-64 flex items-center justify-center">
                    <div class="grid grid-cols-1 gap-4 w-full max-w-md">
                        <!-- Manual pie chart representation -->
                        <div class="relative">
                            <div class="flex items-center justify-center h-48">
                                <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                    <!-- Principal segment -->
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#3B82F6"
                                        stroke-width="20"
                                        :stroke-dasharray="`${principalPercentage * 2.51} 251`"
                                        stroke-dashoffset="0"
                                    />
                                    <!-- Interest segment -->
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#EF4444"
                                        stroke-width="20"
                                        :stroke-dasharray="`${interestPercentage * 2.51} 251`"
                                        :stroke-dashoffset="`-${principalPercentage * 2.51}`"
                                    />
                                    <!-- Extra payments segment -->
                                    <circle
                                        v-if="extraPaymentPercentage > 0"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#22C55E"
                                        stroke-width="20"
                                        :stroke-dasharray="`${extraPaymentPercentage * 2.51} 251`"
                                        :stroke-dashoffset="`-${(principalPercentage + interestPercentage) * 2.51}`"
                                    />
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Legend -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span class="text-sm text-gray-700">Principal</span>
                                </div>
                                <div class="text-sm font-medium">
                                    ${{ formatCurrency(paymentBreakdown.principal) }} ({{ principalPercentage.toFixed(1) }}%)
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span class="text-sm text-gray-700">Interest</span>
                                </div>
                                <div class="text-sm font-medium">
                                    ${{ formatCurrency(paymentBreakdown.interest) }} ({{ interestPercentage.toFixed(1) }}%)
                                </div>
                            </div>
                            <div v-if="paymentBreakdown.extraPayments > 0" class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span class="text-sm text-gray-700">Extra Payments</span>
                                </div>
                                <div class="text-sm font-medium">
                                    ${{ formatCurrency(paymentBreakdown.extraPayments) }} ({{ extraPaymentPercentage.toFixed(1) }}%)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="text-sm text-blue-600 font-medium">Total Principal</div>
                    <div class="text-lg font-bold text-blue-900">${{ formatCurrency(paymentBreakdown.principal) }}</div>
                </div>
                <div class="bg-red-50 p-4 rounded-lg">
                    <div class="text-sm text-red-600 font-medium">Total Interest</div>
                    <div class="text-lg font-bold text-red-900">${{ formatCurrency(paymentBreakdown.interest) }}</div>
                </div>
                <div v-if="paymentBreakdown.extraPayments > 0" class="bg-green-50 p-4 rounded-lg">
                    <div class="text-sm text-green-600 font-medium">Extra Payments</div>
                    <div class="text-lg font-bold text-green-900">${{ formatCurrency(paymentBreakdown.extraPayments) }}</div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
            <p>Enter loan details to see payment analysis</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { FinanceCalculator } from '../../utils/financeCalculator.js';

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

const chartType = ref('pie');

const paymentBreakdown = computed(() => {
    const calculator = new FinanceCalculator(props.data);
    return calculator.getPaymentBreakdown();
});

const totalAmount = computed(() => {
    if (!paymentBreakdown.value) return 0;
    return paymentBreakdown.value.principal + paymentBreakdown.value.interest + paymentBreakdown.value.extraPayments;
});

const principalPercentage = computed(() => {
    if (!paymentBreakdown.value || totalAmount.value === 0) return 0;
    return (paymentBreakdown.value.principal / totalAmount.value) * 100;
});

const interestPercentage = computed(() => {
    if (!paymentBreakdown.value || totalAmount.value === 0) return 0;
    return (paymentBreakdown.value.interest / totalAmount.value) * 100;
});

const extraPaymentPercentage = computed(() => {
    if (!paymentBreakdown.value || totalAmount.value === 0) return 0;
    return (paymentBreakdown.value.extraPayments / totalAmount.value) * 100;
});

import { formatCurrency } from '@/utils/formatters.js';
</script>