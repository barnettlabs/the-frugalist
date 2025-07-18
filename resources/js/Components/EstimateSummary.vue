<template>
    <div class="overflow-hidden rounded-lg bg-white shadow">
        <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-sm text-gray-500">
                        {{ estimateType === 'finance' ? 'Amount Financed:' : 'Capitalized Cost:' }}
                    </span>
                    <span class="text-sm font-medium">
                        ${{ calculatedValue || '0.00' }}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Monthly Payment:</span>
                    <span class="text-sm font-medium">${{ monthlyPayment || '0.00' }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    estimateType: {
        type: String,
        required: true,
        validator: (value) => ['finance', 'lease'].includes(value)
    },
    calculatedValue: {
        type: [String, Number],
        default: '0.00'
    },
    monthlyPayment: {
        type: [String, Number],
        default: '0.00'
    }
})
</script>