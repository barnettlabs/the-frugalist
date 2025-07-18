<template>
    <div class="futuristic-card p-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900">Advanced Lease Calculations</h3>
            <button
                @click="expanded = !expanded"
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <svg class="w-5 h-5 text-gray-600" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
        </div>

        <div v-if="summary">
            <!-- Basic Summary (Always Visible) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-secondary/10 p-4 rounded-lg">
                    <div class="text-sm text-secondary font-medium">Monthly Lease Payment</div>
                    <div class="text-2xl font-bold text-secondary-shade-1">${{ formatCurrency(summary.leasePayment) }}</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-sm text-purple-600 font-medium">Cash Due at Signing</div>
                    <div class="text-2xl font-bold text-purple-900">${{ formatCurrency(summary.cashDueAtSigning) }}</div>
                </div>
            </div>

            <!-- Detailed Calculations (Expandable) -->
            <div v-if="expanded" class="space-y-6">
                <!-- Vehicle Pricing -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Vehicle Pricing</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">MSRP</span>
                            <span class="text-sm font-medium">${{ formatCurrency(data.msrp) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Dealer Contribution</span>
                            <span class="text-sm font-medium text-green-600">-${{ formatCurrency(data.dealer_contribution) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Trade-in Value</span>
                            <span class="text-sm font-medium text-green-600">-${{ formatCurrency(data.trade_in) }}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between">
                                <span class="text-sm font-medium text-gray-900">Final Dealer Price</span>
                                <span class="text-sm font-bold text-gray-900">${{ formatCurrency(summary.finalDealerPrice) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Capitalized Cost -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Capitalized Cost</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Final Dealer Price</span>
                            <span class="text-sm font-medium">${{ formatCurrency(summary.finalDealerPrice) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Doc Fee</span>
                            <span class="text-sm font-medium">${{ formatCurrency(data.doc_fee) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Acquisition Fee</span>
                            <span class="text-sm font-medium">${{ formatCurrency(data.acquisition_fee) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Misc Fees</span>
                            <span class="text-sm font-medium">${{ formatCurrency(data.misc_fees) }}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between">
                                <span class="text-sm font-medium text-gray-900">Gross Cap Cost</span>
                                <span class="text-sm font-bold text-gray-900">${{ formatCurrency(summary.grossCapCost) }}</span>
                            </div>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Down Payment</span>
                            <span class="text-sm font-medium text-green-600">-${{ formatCurrency(data.down_payment) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Lease Cash</span>
                            <span class="text-sm font-medium text-green-600">-${{ formatCurrency(data.lease_cash) }}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between">
                                <span class="text-sm font-medium text-gray-900">Net Cap Cost</span>
                                <span class="text-sm font-bold text-gray-900">${{ formatCurrency(summary.netCapCost) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Residual Value -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Residual Value</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">MSRP</span>
                            <span class="text-sm font-medium">${{ formatCurrency(data.msrp) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Residual Percentage</span>
                            <span class="text-sm font-medium">{{ data.residual_percent }}%</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between">
                                <span class="text-sm font-medium text-gray-900">Residual Amount</span>
                                <span class="text-sm font-bold text-gray-900">${{ formatCurrency(summary.residualAmount) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Breakdown -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Monthly Payment Breakdown</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Principal Payment</span>
                            <span class="text-sm font-medium text-blue-600">${{ formatCurrency(summary.monthlyPrincipalPayment) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Interest Payment</span>
                            <span class="text-sm font-medium text-red-600">${{ formatCurrency(summary.residualMonthlyInterestPayment) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Monthly Sales Tax</span>
                            <span class="text-sm font-medium text-orange-600">${{ formatCurrency(summary.monthlySalesTax) }}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between">
                                <span class="text-sm font-medium text-gray-900">Total Monthly Payment</span>
                                <span class="text-sm font-bold text-gray-900">${{ formatCurrency(summary.leasePayment) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Advanced Metrics -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Advanced Metrics</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Money Factor</span>
                                <span class="text-sm font-medium">{{ data.money_factor }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Equivalent APR</span>
                                <span class="text-sm font-medium">{{ summary.interestRate.toFixed(2) }}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Lease Term</span>
                                <span class="text-sm font-medium">{{ data.lease_term }} months</span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Total Lease Cost</span>
                                <span class="text-sm font-medium">${{ formatCurrency(summary.totalLeaseCost) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Cost per Mile</span>
                                <span class="text-sm font-medium">${{ costPerMile }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-sm text-gray-600">Depreciation Rate</span>
                                <span class="text-sm font-medium">{{ depreciationRate }}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Summary -->
                <div class="bg-secondary/10 p-4 rounded-lg">
                    <h4 class="font-semibold text-secondary-shade-1 mb-3">Total Lease Summary</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-secondary">Monthly Payment × {{ data.lease_term }}</span>
                            <span class="text-sm font-medium text-secondary-shade-1">${{ formatCurrency(summary.leasePayment * parseInt(data.lease_term || 0)) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-secondary">Cash Due at Signing</span>
                            <span class="text-sm font-medium text-secondary-shade-1">${{ formatCurrency(summary.cashDueAtSigning) }}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between">
                                <span class="text-sm font-medium text-secondary-shade-1">Total Lease Cost</span>
                                <span class="text-sm font-bold text-secondary-shade-1">${{ formatCurrency(summary.totalLeaseCost) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
            <p>Enter lease details to see advanced calculations</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { LeaseCalculator } from '../../utils/leaseCalculator.js';

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

const expanded = ref(false);

const summary = computed(() => {
    const calculator = new LeaseCalculator(props.data);
    return calculator.getSummary();
});

const costPerMile = computed(() => {
    if (!summary.value) return '0.00';
    const assumedMiles = 12000; // Typical annual mileage
    const leaseTerm = parseInt(props.data.lease_term || 0);
    const totalMiles = assumedMiles * (leaseTerm / 12);
    if (totalMiles === 0) return '0.00';
    return (summary.value.totalLeaseCost / totalMiles).toFixed(2);
});

const depreciationRate = computed(() => {
    const msrp = parseFloat(props.data.msrp || 0);
    const residualPercent = parseFloat(props.data.residual_percent || 0);
    if (msrp === 0) return '0.0';
    return (100 - residualPercent).toFixed(1);
});

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};
</script>