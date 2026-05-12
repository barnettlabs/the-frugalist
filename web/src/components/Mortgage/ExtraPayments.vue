<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import TextInput from '@/components/TextInput.vue';
import { formatCurrency, parseOrZero } from '@/utils/formatters';
import { MortgageCalculator } from '@/utils/mortgageCalculator';

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
	},
	data: {
		type: Object,
		required: true,
	},
});

interface ExtraPayment {
	paymentAmount: string;
	startMonth: number | string;
	endMonth: number | string;
}

const emit = defineEmits(['update:modelValue']);

const extraPayments = ref<ExtraPayment[]>([]);
const termMonths = computed(() => (parseInt(props.data.loan_term_years as any) || 0) * 12);

watch(
	() => props.modelValue,
	newValue => {
		if (newValue) {
			try {
				const parsed = JSON.parse(newValue);
				extraPayments.value = Array.isArray(parsed) ? parsed : [];
			} catch {
				extraPayments.value = [];
			}
		} else {
			extraPayments.value = [];
		}
	},
	{ immediate: true }
);

const addExtraPayment = () => {
	extraPayments.value.push({
		paymentAmount: '',
		startMonth: 1,
		endMonth: '',
	});
	updateExtraPayments();
};

const removeExtraPayment = (index: number) => {
	extraPayments.value.splice(index, 1);
	updateExtraPayments();
};

const updateExtraPayments = () => {
	emit('update:modelValue', JSON.stringify(extraPayments.value));
};

const totalForPayment = (p: ExtraPayment) => {
	const amount = parseOrZero(p.paymentAmount);
	const start = parseOrZero(p.startMonth) || 1;
	const end = p.endMonth === '' || p.endMonth === null || p.endMonth === undefined
		? termMonths.value || start
		: parseOrZero(p.endMonth) || start;
	const months = Math.max(0, end - start + 1);
	return amount * months;
};

const totalExtra = () =>
	extraPayments.value.reduce((sum, p) => sum + totalForPayment(p), 0);

const interestSaved = () => {
	const without = new MortgageCalculator({ ...props.data, extra_payments_json: '' } as any).calculateAmortization(false);
	const withExtra = new MortgageCalculator({
		...props.data,
		extra_payments_json: JSON.stringify(extraPayments.value),
	} as any).calculateAmortization(true);
	if (!without || !withExtra) return 0;
	return Math.max(0, without.totalInterest - withExtra.totalInterest);
};

const timeSaved = () => {
	const without = new MortgageCalculator({ ...props.data, extra_payments_json: '' } as any).calculateAmortization(false);
	const withExtra = new MortgageCalculator({
		...props.data,
		extra_payments_json: JSON.stringify(extraPayments.value),
	} as any).calculateAmortization(true);
	if (!without || !withExtra) return 0;
	return Math.max(0, without.monthsPaid - withExtra.monthsPaid);
};
</script>

<template>
	<section class="card overflow-hidden">
		<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
			<span class="numeral text-xs text-text-muted">Optional</span>
			<h3 class="font-display text-xl text-primary tracking-tight">Extra principal payments</h3>
			<button
				class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary hover:bg-primary-light text-surface transition-colors"
				@click="addExtraPayment"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add payment
			</button>
		</div>

		<div class="p-5 sm:p-6 space-y-4">
			<div v-for="(payment, index) in extraPayments" :key="index" class="bg-tan/40 border border-border p-4 rounded-md">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">Monthly amount</label>
						<TextInput
							v-model="payment.paymentAmount"
							type="number"
							step="0.01"
							min="0"
							prefix="$"
							placeholder="0.00"
							@input="updateExtraPayments"
						/>
					</div>

					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">Start month</label>
						<input
							v-model="payment.startMonth"
							type="number"
							min="1"
							:max="termMonths || undefined"
							class="block w-full rounded-md border-border bg-surface shadow-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
							placeholder="1"
							@input="updateExtraPayments"
						/>
					</div>

					<div>
						<label class="eyebrow !text-[0.625rem] block mb-1.5">End month (blank = end of loan)</label>
						<input
							v-model="payment.endMonth"
							type="number"
							min="1"
							:max="termMonths || undefined"
							class="block w-full rounded-md border-border bg-surface shadow-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm"
							:placeholder="termMonths ? String(termMonths) : ''"
							@input="updateExtraPayments"
						/>
					</div>

					<div class="flex items-end">
						<button
							class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-border text-text-muted hover:border-danger/40 hover:text-danger hover:bg-danger/5 transition-colors"
							@click="removeExtraPayment(index)"
						>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Remove
						</button>
					</div>
				</div>

				<div class="mt-3 flex items-center gap-3 text-xs text-text-muted">
					<span class="numeral">
						Months {{ payment.startMonth || 1 }} –
						{{ payment.endMonth || (termMonths ? termMonths : payment.startMonth) }}
					</span>
					<span>·</span>
					<span class="numeral text-primary">Total ${{ formatCurrency(totalForPayment(payment)) }}</span>
				</div>
			</div>

			<div v-if="extraPayments.length === 0" class="text-center py-10 text-text-muted">
				<p class="font-display italic text-base text-primary tracking-tight mb-1">No extra payments yet.</p>
				<p class="text-xs">Pay extra each month to reduce your term and save on interest.</p>
			</div>

			<div v-if="extraPayments.length > 0" class="mt-2 pt-5 border-t border-border">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden">
					<div class="bg-surface p-4">
						<p class="eyebrow !text-[0.625rem] mb-1.5">Total extra</p>
						<p class="figure text-lg text-primary leading-none">${{ formatCurrency(totalExtra()) }}</p>
					</div>
					<div class="bg-surface p-4">
						<p class="eyebrow !text-[0.625rem] mb-1.5">Interest saved</p>
						<p class="figure text-lg text-success leading-none">${{ formatCurrency(interestSaved()) }}</p>
					</div>
					<div class="bg-surface p-4">
						<p class="eyebrow !text-[0.625rem] mb-1.5">Time saved</p>
						<p class="figure text-lg text-success leading-none">
							{{ timeSaved() }} <span class="text-text-muted text-sm">mo</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
