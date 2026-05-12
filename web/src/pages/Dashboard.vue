<script setup lang="ts">
import {
	ArrowUpRightIcon,
	BanknotesIcon,
	CalculatorIcon,
	CurrencyDollarIcon,
	EyeIcon,
	PlusIcon,
} from '@heroicons/vue/24/outline';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { dashboardApi, type DashboardStats } from '@/api/dashboard';
import MastheadBar from '@/components/MastheadBar.vue';
import Spinner from '@/components/Spinner.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

interface VehicleSheet {
	id: number;
	vehicle_year: number;
	vehicle_make: string;
	vehicle_model: string;
	vehicle_price: number;
	loan_term_months?: number;
	lease_term_months?: number;
	updated_at?: string;
}

const loading = ref(true);
const stats = ref<DashboardStats | null>(null);
const vehicleFinanceSheets = ref<VehicleSheet[]>([]);
const vehicleLeaseSheets = ref<VehicleSheet[]>([]);

const fullName = computed(() => authStore.fullName);
const firstName = computed(() => fullName.value?.split(' ')[0] || '');

const totalEstimates = computed(() => {
	return (
		(stats.value?.finance_sheets_count ?? 0) +
		(stats.value?.lease_sheets_count ?? 0) +
		(stats.value?.mortgage_sheets_count ?? 0)
	);
});

const hasRecentActivity = computed(() => {
	return (vehicleFinanceSheets.value?.length ?? 0) + (vehicleLeaseSheets.value?.length ?? 0) > 0;
});

const totalActivity = computed(() => {
	return (stats.value?.tracked_products_count ?? 0) + totalEstimates.value;
});

const isFresh = computed(() => totalActivity.value === 0);

const todayLabel = computed(() => {
	return new Date().toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});
});

const greeting = computed(() => {
	const h = new Date().getHours();
	if (h < 5) return 'Still up';
	if (h < 12) return 'Good morning';
	if (h < 17) return 'Good afternoon';
	return 'Good evening';
});

const loadDashboard = async () => {
	try {
		const data = await dashboardApi.getStats();
		stats.value = data;
		vehicleFinanceSheets.value = data.recent_finance_sheets as VehicleSheet[];
		vehicleLeaseSheets.value = data.recent_lease_sheets as VehicleSheet[];
	} catch (error) {
		console.error('Failed to load dashboard:', error);
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadDashboard();
});
</script>

<template>
	<div class="pb-16">
		<!-- Loading -->
		<div v-if="loading" class="flex items-center justify-center py-32">
			<Spinner size="lg" color="accent" />
		</div>

		<template v-else>
			<!-- Editorial masthead -->
			<div class="pt-8 lg:pt-12">
				<MastheadBar>
					<template #left>{{ todayLabel }}</template>
				</MastheadBar>
			</div>

			<header class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
				<div class="grid grid-cols-12 gap-6 lg:gap-12 items-end">
					<div class="col-span-12 lg:col-span-8 fade-up">
						<p class="eyebrow mb-4">{{ greeting }}</p>
						<h1
							class="font-display font-medium text-primary tracking-tightest text-4xl sm:text-5xl lg:text-[4.25rem] leading-[0.95]"
						>
							{{ firstName ? firstName : 'Welcome' }}.
							<span class="italic text-accent-dark">{{
								isFresh ? 'Let’s start small.' : 'Here’s where you stand.'
							}}</span>
						</h1>
					</div>
					<div class="col-span-12 lg:col-span-4 fade-up fade-up-1">
						<p class="text-sm text-text-muted leading-relaxed border-l border-border pl-4">
							{{
								isFresh
									? 'Your ledger is clean. Add a product to watch or run a financing estimate to begin tracking what things should cost.'
									: 'A snapshot of your watches, estimates, and recent decisions. Pull on any thread to dig deeper.'
							}}
						</p>
					</div>
				</div>
			</header>

			<!-- Big-numeral focus trio -->
			<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden">
					<RouterLink to="/watch" class="group relative bg-surface p-6 sm:p-8 hover:bg-surface-dark transition-colors">
						<div class="flex items-start justify-between mb-6">
							<p class="eyebrow">Watch</p>
							<EyeIcon class="h-4 w-4 text-text-muted group-hover:text-accent-dark transition-colors" />
						</div>
						<p class="figure text-5xl sm:text-6xl text-primary leading-none">
							{{ stats?.tracked_products_count ?? 0 }}
						</p>
						<div class="mt-4 flex items-center justify-between">
							<p class="text-xs text-text-muted">products on watch</p>
							<span
								class="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:text-accent-dark transition-colors"
							>
								Open <ArrowUpRightIcon class="h-3 w-3" />
							</span>
						</div>
					</RouterLink>

					<RouterLink
						to="/estimates/financing"
						class="group relative bg-surface p-6 sm:p-8 hover:bg-surface-dark transition-colors"
					>
						<div class="flex items-start justify-between mb-6">
							<p class="eyebrow">Finance</p>
							<BanknotesIcon class="h-4 w-4 text-text-muted group-hover:text-accent-dark transition-colors" />
						</div>
						<p class="figure text-5xl sm:text-6xl text-primary leading-none">{{ stats?.finance_sheets_count ?? 0 }}</p>
						<div class="mt-4 flex items-center justify-between">
							<p class="text-xs text-text-muted">loan estimates</p>
							<span
								class="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:text-accent-dark transition-colors"
							>
								Open <ArrowUpRightIcon class="h-3 w-3" />
							</span>
						</div>
					</RouterLink>

					<RouterLink
						to="/estimates/leasing"
						class="group relative bg-surface p-6 sm:p-8 hover:bg-surface-dark transition-colors"
					>
						<div class="flex items-start justify-between mb-6">
							<p class="eyebrow">Lease</p>
							<CurrencyDollarIcon class="h-4 w-4 text-text-muted group-hover:text-accent-dark transition-colors" />
						</div>
						<p class="figure text-5xl sm:text-6xl text-primary leading-none">{{ stats?.lease_sheets_count ?? 0 }}</p>
						<div class="mt-4 flex items-center justify-between">
							<p class="text-xs text-text-muted">lease estimates</p>
							<span
								class="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:text-accent-dark transition-colors"
							>
								Open <ArrowUpRightIcon class="h-3 w-3" />
							</span>
						</div>
					</RouterLink>
				</div>
			</section>

			<!-- Quick actions strip -->
			<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
				<div class="flex items-center gap-4 mb-4">
					<p class="eyebrow">Begin something</p>
					<div class="h-px flex-1 bg-border"></div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<RouterLink
						to="/watch/create"
						class="group flex items-center gap-4 p-4 rounded-md border border-border bg-surface hover:border-primary/40 hover:bg-surface-dark transition-colors"
					>
						<div class="w-10 h-10 rounded-md bg-primary text-surface flex items-center justify-center flex-shrink-0">
							<PlusIcon class="h-4 w-4" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-primary">Track a price</p>
							<p class="text-xs text-text-muted">Add a product, set a target</p>
						</div>
						<ArrowUpRightIcon class="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
					</RouterLink>
					<RouterLink
						to="/estimates/financing/create"
						class="group flex items-center gap-4 p-4 rounded-md border border-border bg-surface hover:border-primary/40 hover:bg-surface-dark transition-colors"
					>
						<div class="w-10 h-10 rounded-md bg-primary text-surface flex items-center justify-center flex-shrink-0">
							<CalculatorIcon class="h-4 w-4" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-primary">Run financing</p>
							<p class="text-xs text-text-muted">APR, amortization, total cost</p>
						</div>
						<ArrowUpRightIcon class="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
					</RouterLink>
					<RouterLink
						to="/estimates/leasing/create"
						class="group flex items-center gap-4 p-4 rounded-md border border-border bg-surface hover:border-primary/40 hover:bg-surface-dark transition-colors"
					>
						<div class="w-10 h-10 rounded-md bg-primary text-surface flex items-center justify-center flex-shrink-0">
							<CalculatorIcon class="h-4 w-4" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-primary">Run a lease</p>
							<p class="text-xs text-text-muted">Money factor, residual, true cost</p>
						</div>
						<ArrowUpRightIcon class="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
					</RouterLink>
				</div>
			</section>

			<!-- Recent activity timeline -->
			<section v-if="hasRecentActivity" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
				<div class="flex items-center gap-4 mb-6">
					<p class="eyebrow">Recently filed</p>
					<div class="h-px flex-1 bg-border"></div>
					<RouterLink to="/estimates" class="text-xs font-medium text-primary hover:text-accent-dark transition-colors">
						View all
					</RouterLink>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
					<!-- Finance column -->
					<div>
						<p class="eyebrow text-text-muted/70 mb-4">Finance ledger</p>
						<ul class="divide-y divide-border border-y border-border">
							<li v-for="sheet in vehicleFinanceSheets.slice(0, 4)" :key="'f-' + sheet.id">
								<RouterLink
									:to="`/estimates/financing/${sheet.id}/edit`"
									class="group grid grid-cols-12 items-baseline gap-3 py-4 hover:bg-surface-dark/40 transition-colors -mx-2 px-2 rounded"
								>
									<span class="col-span-2 numeral text-xs text-text-muted">{{ sheet.vehicle_year }}</span>
									<span
										class="col-span-7 font-display text-lg text-primary tracking-tight truncate group-hover:text-accent-dark transition-colors"
									>
										{{ sheet.vehicle_make }} <span class="italic text-text-muted/80">{{ sheet.vehicle_model }}</span>
									</span>
									<span class="col-span-3 numeral text-sm text-primary text-right"
										>${{ sheet.vehicle_price?.toLocaleString() }}</span
									>
								</RouterLink>
							</li>
							<li v-if="!vehicleFinanceSheets.length" class="py-4 text-sm text-text-muted">No finance sheets yet.</li>
						</ul>
					</div>

					<!-- Lease column -->
					<div>
						<p class="eyebrow text-text-muted/70 mb-4">Lease ledger</p>
						<ul class="divide-y divide-border border-y border-border">
							<li v-for="sheet in vehicleLeaseSheets.slice(0, 4)" :key="'l-' + sheet.id">
								<RouterLink
									:to="`/estimates/leasing/${sheet.id}/edit`"
									class="group grid grid-cols-12 items-baseline gap-3 py-4 hover:bg-surface-dark/40 transition-colors -mx-2 px-2 rounded"
								>
									<span class="col-span-2 numeral text-xs text-text-muted">{{ sheet.vehicle_year }}</span>
									<span
										class="col-span-7 font-display text-lg text-primary tracking-tight truncate group-hover:text-accent-dark transition-colors"
									>
										{{ sheet.vehicle_make }} <span class="italic text-text-muted/80">{{ sheet.vehicle_model }}</span>
									</span>
									<span class="col-span-3 numeral text-sm text-primary text-right"
										>${{ sheet.vehicle_price?.toLocaleString() }}</span
									>
								</RouterLink>
							</li>
							<li v-if="!vehicleLeaseSheets.length" class="py-4 text-sm text-text-muted">No lease sheets yet.</li>
						</ul>
					</div>
				</div>
			</section>

			<!-- Empty state -->
			<section v-else-if="isFresh" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
				<div
					class="surface-ink paper-grain rounded-md border border-primary-dark/40 p-8 sm:p-12 relative overflow-hidden"
				>
					<div class="grid grid-cols-12 gap-6 items-center relative z-10">
						<div class="col-span-12 lg:col-span-8">
							<p class="eyebrow text-white/60 mb-4">Your first entry</p>
							<h2 class="font-display font-medium text-white tracking-tightest text-3xl sm:text-5xl leading-[0.95]">
								Pick something you&rsquo;ve been<br />
								<span class="italic text-signal-light">eyeing</span>, and watch it for a while.
							</h2>
							<p class="mt-5 text-sm text-white/70 max-w-md">
								Track your first product. Set a target. Wait for the market to come to you instead of the other way
								around.
							</p>
						</div>
						<div class="col-span-12 lg:col-span-4 lg:text-right">
							<RouterLink
								to="/watch/create"
								class="group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 bg-surface text-primary text-sm font-medium hover:bg-tan transition-colors"
							>
								Track first product
								<ArrowUpRightIcon
									class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								/>
							</RouterLink>
						</div>
					</div>
				</div>
			</section>
		</template>
	</div>
</template>
