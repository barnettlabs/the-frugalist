<script setup lang="ts">
import {
	ArrowTopRightOnSquareIcon,
	BellAlertIcon,
	BugAntIcon,
	BuildingStorefrontIcon,
	CheckCircleIcon,
	DevicePhoneMobileIcon,
	EnvelopeIcon,
	MagnifyingGlassIcon,
	TagIcon,
} from '@heroicons/vue/24/outline';
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { devicesApi } from '@/api/devices';
import {
	CHECK_INTERVAL_OPTIONS,
	type CheckInterval,
	type DebugInfo,
	getRetailers,
	type NotificationMethod,
	type Retailer,
	type ValidatedProduct,
	type ValidateProductResponse,
	WATCH_TYPE_OPTIONS,
	watchApi,
	watchDebugApi,
	type WatchType,
} from '@/api/watch';
import Alert from '@/components/Alert.vue';
import Badge from '@/components/Badge.vue';
import Checkbox from '@/components/Checkbox.vue';
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Spinner from '@/components/Spinner.vue';
import TextInput from '@/components/TextInput.vue';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

const form = ref({
	retailer_id: 0,
	sku_upc: '',
	target_price: '',
	start_date: today,
	end_date: '',
	notification_email: true,
	notification_push: false,
	watch_type: 'price' as WatchType,
	check_interval: 60 as CheckInterval,
});

const loading = ref(false);
const validating = ref(false);
const validatedProduct = ref<ValidateProductResponse | null>(null);
const validationError = ref('');
const errors = ref<Record<string, string[]>>({});

// Debug mode state
const canDebug = ref(false);
const debugEnabled = ref(false);
const debugInfo = ref<DebugInfo | null>(null);

// Retailers fetched from the database
const retailers = ref<Retailer[]>([]);
const retailersLoading = ref(true);

// Device registration status for push notifications
const hasActiveDevices = ref(false);

// Only show retailers that are active or coming soon
const visibleRetailers = computed(() => {
	return retailers.value.filter(r => r.is_active || r.coming_soon);
});

// Track the last validated SKU to avoid re-validating the same value
const lastValidatedSku = ref('');

const selectedRetailer = computed(() => {
	return retailers.value.find(r => r.id === form.value.retailer_id);
});

const notificationMethods = computed((): NotificationMethod[] => {
	const methods: NotificationMethod[] = [];
	if (form.value.notification_email) methods.push('email');
	if (form.value.notification_push) methods.push('push');
	return methods;
});

// Step completion checks
const isStoreSelected = computed(() => form.value.retailer_id > 0);
const isSkuEntered = computed(() => form.value.sku_upc.trim().length > 0);
const isProductValidated = computed(
	() => validatedProduct.value?.valid === true && validatedProduct.value?.product != null
);
const hasNotificationMethod = computed(() => notificationMethods.value.length > 0);

// Convenience accessor for the validated product data
const product = computed((): ValidatedProduct | null => {
	return validatedProduct.value?.product ?? null;
});

const targetPriceValue = computed(() => {
	const val = parseFloat(form.value.target_price);
	return isNaN(val) ? null : val;
});

const isTargetPriceValid = computed(() => {
	if (targetPriceValue.value === null) return false;
	if (targetPriceValue.value <= 0) return false;
	if (!product.value?.current_price) return true;
	return targetPriceValue.value < product.value.current_price;
});

const needsTargetPrice = computed(() => form.value.watch_type === 'price' || form.value.watch_type === 'both');

const targetPriceError = computed(() => {
	if (!needsTargetPrice.value) return '';
	if (!form.value.target_price) return 'Target price is required';
	if (targetPriceValue.value === null || targetPriceValue.value <= 0) return 'Enter a valid price';
	if (product.value?.current_price && targetPriceValue.value >= product.value.current_price) {
		return `Target price must be less than current price ($${formatCurrency(product.value.current_price)})`;
	}
	return '';
});

// Calculate savings percentage
const savingsPercent = computed(() => {
	if (!product.value?.retail_price || !product.value?.current_price) return null;
	if (product.value.retail_price <= product.value.current_price) return null;
	return Math.round((1 - product.value.current_price / product.value.retail_price) * 100);
});

const isFormValid = computed(() => {
	const targetPriceOk = needsTargetPrice.value ? isTargetPriceValid.value : true;
	return (
		isStoreSelected.value &&
		isSkuEntered.value &&
		isProductValidated.value &&
		targetPriceOk &&
		hasNotificationMethod.value
	);
});

const skuPlaceholder = computed(() => {
	if (!selectedRetailer.value) return 'Select a store first';
	switch (selectedRetailer.value.slug) {
		case 'amazon':
			return 'e.g., B08N5WRWNW (ASIN)';
		case 'bestbuy':
			return 'e.g., 6505727 (SKU)';
		case 'homedepot':
			return 'e.g., 312066362 (Internet #)';
		case 'lowes':
			return 'e.g., 1000123456 (Item #)';
		case 'walmart':
			return 'e.g., 123456789 (Item ID)';
		case 'target':
			return 'e.g., 12345678 (TCIN)';
		default:
			return 'Enter SKU or UPC';
	}
});

// Reset validation when store changes
watch(
	() => form.value.retailer_id,
	() => {
		validatedProduct.value = null;
		validationError.value = '';
		lastValidatedSku.value = '';
	}
);

// Validate product on blur
const validateProduct = async () => {
	const sku = form.value.sku_upc.trim();

	// Skip if empty, no store selected, or already validated this exact SKU
	if (!sku || !form.value.retailer_id) return;
	if (sku === lastValidatedSku.value && validatedProduct.value) return;

	validating.value = true;
	validationError.value = '';
	validatedProduct.value = null;
	debugInfo.value = null;

	try {
		if (debugEnabled.value) {
			// Use separate debug endpoint
			const result = await watchDebugApi.validateProduct(form.value.retailer_id, sku);
			lastValidatedSku.value = sku;
			debugInfo.value = result.debug;

			if (result.valid && result.product) {
				validatedProduct.value = { valid: true, product: result.product };
			} else {
				validationError.value = result.message || 'Product not found. Please check the SKU/UPC and try again.';
			}
		} else {
			// Use production endpoint
			const result = await watchApi.validateProduct(form.value.retailer_id, sku);
			lastValidatedSku.value = sku;

			if (result.valid && result.product) {
				validatedProduct.value = result;
			} else {
				validationError.value = result.message || 'Product not found. Please check the SKU/UPC and try again.';
			}
		}
	} catch (error: any) {
		validationError.value = error.response?.data?.message || 'Failed to validate product. Please try again.';
	} finally {
		validating.value = false;
	}
};

// Clear validation when SKU changes
watch(
	() => form.value.sku_upc,
	(newVal, oldVal) => {
		if (newVal !== oldVal) {
			// Only clear if the value actually changed from what was validated
			if (newVal.trim() !== lastValidatedSku.value) {
				validatedProduct.value = null;
				validationError.value = '';
			}
		}
	}
);

const submitForm = async () => {
	if (!isFormValid.value) return;

	loading.value = true;
	errors.value = {};

	try {
		// Use today if start_date is empty
		const startDate = form.value.start_date || today;

		const newProduct = await watchApi.create({
			retailer_id: form.value.retailer_id,
			sku_upc: form.value.sku_upc.trim(),
			target_price: needsTargetPrice.value ? targetPriceValue.value! : undefined,
			tracking_start_date: startDate,
			tracking_end_date: form.value.end_date || undefined,
			notification_methods: notificationMethods.value,
			watch_type: form.value.watch_type,
			check_interval: form.value.check_interval,
		});
		router.push(`/watch/${newProduct.id}`);
	} catch (error: any) {
		if (error.response?.data?.errors) {
			errors.value = error.response.data.errors;
		} else {
			errors.value = { general: ['Failed to create tracker. Please try again.'] };
		}
	} finally {
		loading.value = false;
	}
};

// Fetch retailers, debug access, and device status on mount
onMounted(async () => {
	try {
		const [fetchedRetailers, hasDebugAccess, hasDevices] = await Promise.all([
			getRetailers(),
			watchDebugApi.canDebug(),
			devicesApi.hasActiveDevices(),
		]);
		retailers.value = fetchedRetailers;
		canDebug.value = hasDebugAccess;
		hasActiveDevices.value = hasDevices;
	} catch (error) {
		console.error('Failed to load initial data:', error);
	} finally {
		retailersLoading.value = false;
	}
});
</script>

<template>
	<div class="pb-16">
		<SectionHeader
			eyebrow="Watch · New tracker"
			title="Track a new product."
			description="Pick a retailer, drop in a SKU, set a target. We&rsquo;ll do the watching."
			:icon="BellAlertIcon"
			variant="compact"
		>
			<template #actions>
				<RouterLink
					to="/watch"
					class="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors"
				>
					← Back to all watches
				</RouterLink>
			</template>
		</SectionHeader>

		<main class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-2">
			<!-- General Error -->
			<Alert v-if="errors.general" variant="danger" class="mb-6">
				{{ errors.general[0] }}
			</Alert>

			<!-- Step 1: Store Selection -->
			<section class="card mb-4">
				<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
					<span class="numeral text-xs text-text-muted">№ 01</span>
					<h3 class="font-display text-xl text-primary tracking-tight">Select store</h3>
					<CheckCircleIcon v-if="isStoreSelected" class="h-4 w-4 text-success ml-auto" />
				</div>
				<div class="p-5 sm:p-6">
					<!-- Loading state -->
					<div v-if="retailersLoading" class="flex items-center justify-center py-8">
						<Spinner size="md" color="primary" />
					</div>

					<div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
						<button
							v-for="retailer in visibleRetailers"
							:key="retailer.id"
							type="button"
							:disabled="!retailer.is_active || retailer.coming_soon"
							:class="[
								'relative flex flex-col items-center justify-center p-4 rounded-md border transition-all',
								!retailer.is_active || retailer.coming_soon
									? 'border-border bg-tan/30 cursor-not-allowed opacity-60'
									: form.retailer_id === retailer.id
										? 'border-primary bg-primary/5 text-primary'
										: 'border-border hover:border-primary/50 text-text-muted hover:bg-tan/40 cursor-pointer',
							]"
							@click="retailer.is_active && !retailer.coming_soon ? (form.retailer_id = retailer.id) : null"
						>
							<BuildingStorefrontIcon class="h-5 w-5 mb-2" />
							<span class="text-sm font-medium text-center">{{ retailer.name }}</span>
							<Badge v-if="retailer.coming_soon" variant="warning" size="sm" class="absolute -top-2 -right-2">
								Soon
							</Badge>
							<div
								v-if="form.retailer_id === retailer.id"
								class="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
							>
								<svg class="w-2.5 h-2.5 text-surface" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						</button>
					</div>
					<InputError :message="errors.retailer_id?.[0]" class="mt-2" />
				</div>
			</section>

			<!-- Step 2: SKU/UPC Input -->
			<section
				class="card mb-4 transition-opacity duration-200"
				:class="{ 'opacity-50 pointer-events-none': !isStoreSelected }"
			>
				<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
					<span class="numeral text-xs text-text-muted">№ 02</span>
					<h3 :class="['font-display text-xl tracking-tight', isStoreSelected ? 'text-primary' : 'text-text-muted']">
						Product identifier
					</h3>
					<button
						v-if="canDebug && isStoreSelected"
						:class="[
							'flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ml-auto',
							debugEnabled ? 'bg-warning text-white' : 'bg-tan text-text-muted hover:bg-tan-dark',
						]"
						title="Toggle debug mode"
						@click="debugEnabled = !debugEnabled"
					>
						<BugAntIcon class="h-3.5 w-3.5" />
						<span>{{ debugEnabled ? 'Debug On' : 'Debug' }}</span>
					</button>
					<CheckCircleIcon
						v-if="isProductValidated"
						class="h-4 w-4 text-success"
						:class="{ 'ml-auto': !canDebug || !isStoreSelected }"
					/>
				</div>

				<div class="p-5 sm:p-6">
					<InputLabel for="sku_upc" value="SKU / UPC / Item number" />
					<div class="flex gap-2 mt-1">
						<div class="relative flex-1">
							<TextInput
								id="sku_upc"
								v-model="form.sku_upc"
								type="text"
								class="block w-full"
								:placeholder="skuPlaceholder"
								:disabled="!isStoreSelected"
								@keyup.enter="validateProduct"
							/>
						</div>
						<button
							type="button"
							:disabled="!isStoreSelected || !form.sku_upc.trim() || validating"
							:class="[
								'flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-sm',
								!isStoreSelected || !form.sku_upc.trim() || validating
									? 'bg-tan text-text-muted cursor-not-allowed'
									: 'bg-primary hover:bg-primary-light text-surface',
							]"
							@click="validateProduct"
						>
							<Spinner v-if="validating" size="sm" color="white" />
							<MagnifyingGlassIcon v-else class="h-4 w-4" />
							<span class="hidden sm:inline">{{ validating ? 'Searching…' : 'Search' }}</span>
						</button>
					</div>
					<InputError :message="errors.sku_upc?.[0]" class="mt-2" />

					<!-- Validation Error -->
					<Alert v-if="validationError" variant="danger" class="mt-4" :title="validationError" />

					<!-- Product Preview -->
					<div
						v-if="isProductValidated && product"
						class="mt-5 surface-ink paper-grain rounded-md border border-primary-dark/40 overflow-hidden"
					>
						<div class="flex items-center gap-2 px-5 py-3 border-b border-white/10 relative z-10">
							<CheckCircleIcon class="h-4 w-4 text-success shrink-0" />
							<span class="eyebrow text-white/80">Product found</span>
							<div class="flex items-center gap-2 ml-auto">
								<Badge v-if="product.metadata?.clearance" variant="warning" size="sm">Clearance</Badge>
								<Badge v-if="product.metadata?.on_sale" variant="accent" size="sm">On Sale</Badge>
								<Badge v-if="product.in_stock === false" variant="danger" size="sm">Out of Stock</Badge>
								<Badge v-else-if="product.in_stock === true" variant="success" size="sm">In Stock</Badge>
							</div>
						</div>

						<div class="flex flex-col sm:flex-row gap-5 p-5 sm:p-6 relative z-10">
							<div class="shrink-0">
								<div
									v-if="product.image_url"
									class="w-32 h-32 sm:w-40 sm:h-40 rounded-md bg-surface border border-white/10 overflow-hidden"
								>
									<img :src="product.image_url" :alt="product.name" class="w-full h-full object-contain p-2" />
								</div>
								<div
									v-else
									class="w-32 h-32 sm:w-40 sm:h-40 bg-white/5 rounded-md flex items-center justify-center border border-white/10"
								>
									<BuildingStorefrontIcon class="h-12 w-12 text-white/30" />
								</div>
							</div>

							<div class="flex-1 min-w-0">
								<h4 class="font-display text-xl text-white leading-tight tracking-tight">{{ product.name }}</h4>
								<p v-if="product.variant || product.metadata?.model_number" class="text-xs text-white/60 mt-1 numeral">
									Model: {{ product.variant || product.metadata?.model_number }}
								</p>
								<p v-if="product.description" class="text-sm text-white/70 mt-3 line-clamp-3">
									{{ product.description }}
								</p>

								<div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-xs text-white/60">
									<span class="flex items-center gap-1">
										<BuildingStorefrontIcon class="h-3.5 w-3.5" />
										{{ selectedRetailer?.name }}
									</span>
									<span class="flex items-center gap-1 numeral">
										<TagIcon class="h-3.5 w-3.5" />
										{{ product.sku_upc || form.sku_upc }}
									</span>
									<a
										v-if="product.retailer_url || product.metadata?.retailer_url"
										:href="product.retailer_url || product.metadata?.retailer_url"
										target="_blank"
										rel="noopener noreferrer"
										class="flex items-center gap-1 text-signal-light hover:text-signal transition-colors"
									>
										<ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
										View at retailer
									</a>
								</div>

								<div class="flex items-end gap-5 mt-5 pt-4 border-t border-white/10">
									<div v-if="product.current_price">
										<p class="eyebrow text-white/60 mb-0.5">Current</p>
										<p class="figure text-3xl text-white">${{ formatCurrency(product.current_price) }}</p>
									</div>
									<div v-if="product.retail_price && product.retail_price !== product.current_price">
										<p class="eyebrow text-white/60 mb-0.5">Retail</p>
										<p class="numeral text-base text-white/60 line-through">
											${{ formatCurrency(product.retail_price) }}
										</p>
									</div>
									<span
										v-if="savingsPercent"
										class="ml-auto inline-flex items-center px-2 py-0.5 rounded-xs bg-signal/20 text-signal-light text-xs numeral"
									>
										−{{ savingsPercent }}%
									</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Tips -->
					<div
						v-if="isStoreSelected && !isProductValidated && !validating"
						class="mt-4 p-3 bg-tan/40 border border-border rounded-md"
					>
						<p class="text-xs text-text-muted">
							<strong class="eyebrow">Tip ·</strong>
							<template v-if="selectedRetailer?.slug === 'bestbuy'">
								Look for "SKU" on the Best Buy product page.</template
							>
							<template v-else-if="selectedRetailer?.slug === 'homedepot'">
								Look for "Internet #" or "Store SKU" on the Home Depot product page.</template
							>
							<template v-else-if="selectedRetailer?.slug === 'lowes'">
								Look for "Item #" on the Lowe's product page.</template
							>
							<template v-else-if="selectedRetailer?.slug === 'amazon'">
								Use the ASIN from the Amazon product URL (e.g., B08N5WRWNW).</template
							>
							<template v-else-if="selectedRetailer?.slug === 'walmart'">
								Look for "Item ID" or use the number from the Walmart product URL.</template
							>
							<template v-else-if="selectedRetailer?.slug === 'target'">
								Look for "TCIN" on the Target product page.</template
							>
							<template v-else> Enter the product's SKU, UPC, or item number.</template>
						</p>
					</div>

					<!-- Debug Info Panel -->
					<div v-if="debugEnabled && debugInfo" class="mt-4 p-5 border border-warning/40 rounded-md bg-warning/5">
						<div class="flex items-center gap-2 mb-4 pb-3 border-b border-warning/20">
							<BugAntIcon class="h-4 w-4 text-warning" />
							<span class="eyebrow text-warning">Debug information</span>
						</div>

						<!-- Raw API Response -->
						<div v-if="debugInfo.raw_api_response" class="mb-6">
							<h4 class="text-xs font-semibold text-primary mb-2">Raw API Response</h4>
							<div class="text-xs text-text-muted mb-2">
								<span class="font-medium">Retailer:</span> {{ debugInfo.raw_api_response.retailer }}
							</div>
							<div class="text-xs text-text-muted mb-2">
								<span class="font-medium">Endpoint:</span> {{ debugInfo.raw_api_response.endpoint }}
							</div>
							<pre
								class="bg-surface-dark p-4 rounded-lg overflow-x-auto text-xs text-text-muted max-h-80 overflow-y-auto"
								>{{ JSON.stringify(debugInfo.raw_api_response.response, null, 2) }}</pre>
						</div>

						<!-- Parsed Data -->
						<div v-if="debugInfo.parsed_data">
							<h4 class="text-xs font-semibold text-primary mb-2">Parsed Data</h4>
							<pre
								class="bg-surface-dark p-4 rounded-lg overflow-x-auto text-xs text-text-muted max-h-48 overflow-y-auto"
								>{{ JSON.stringify(debugInfo.parsed_data, null, 2) }}</pre>
						</div>

						<!-- Error Info (if any) -->
						<div v-if="debugInfo.error" class="mt-4">
							<h4 class="eyebrow text-danger mb-2">Error</h4>
							<pre class="bg-danger/10 p-4 rounded-lg overflow-x-auto text-xs text-danger max-h-48 overflow-y-auto">{{
								debugInfo.error
							}}</pre>
						</div>
					</div>
				</div>
			</section>

			<!-- Step 3: Tracking Settings -->
			<section
				class="card mb-4 transition-opacity duration-200"
				:class="{ 'opacity-50 pointer-events-none': !isProductValidated }"
			>
				<div class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border">
					<span class="numeral text-xs text-text-muted">№ 03</span>
					<h3 :class="['font-display text-xl tracking-tight', isProductValidated ? 'text-primary' : 'text-text-muted']">
						Tracking settings
					</h3>
					<CheckCircleIcon v-if="isTargetPriceValid && hasNotificationMethod" class="h-4 w-4 text-success ml-auto" />
				</div>
				<div class="p-5 sm:p-6">
					<!-- Watch Type -->
					<div class="mb-6">
						<InputLabel value="What to watch for" class="mb-3" />
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<button
								v-for="option in WATCH_TYPE_OPTIONS"
								:key="option.value"
								type="button"
								:disabled="!isProductValidated"
								:class="[
									'flex flex-col items-start p-4 rounded-md border transition-all text-left',
									!isProductValidated ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
									form.watch_type === option.value
										? 'border-primary bg-primary/5'
										: 'border-border hover:border-primary/40 hover:bg-tan/40',
								]"
								@click="form.watch_type = option.value"
							>
								<span class="font-medium text-primary">{{ option.label }}</span>
								<span class="text-xs text-text-muted mt-1">{{ option.description }}</span>
							</button>
						</div>
					</div>

					<!-- Target Price (conditional) & Check Interval -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
						<div v-if="needsTargetPrice">
							<InputLabel for="target_price"> Target Price <span class="text-danger">*</span> </InputLabel>
							<TextInput
								id="target_price"
								v-model="form.target_price"
								type="number"
								step="0.01"
								min="0"
								prefix="$"
								class="mt-1"
								:placeholder="product?.current_price ? `Less than $${formatCurrency(product.current_price)}` : '0.00'"
								:disabled="!isProductValidated"
							/>
							<p class="text-xs text-text-muted mt-1">We'll notify you when the price drops to this amount</p>
							<p v-if="isProductValidated && form.target_price && targetPriceError" class="text-xs text-danger mt-1">
								{{ targetPriceError }}
							</p>
							<InputError :message="errors.target_price?.[0]" class="mt-2" />
						</div>

						<div>
							<InputLabel for="check_interval" value="Check frequency" />
							<select
								id="check_interval"
								v-model="form.check_interval"
								:disabled="!isProductValidated"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2"
							>
								<option v-for="option in CHECK_INTERVAL_OPTIONS" :key="option.value" :value="option.value">
									{{ option.label }}
								</option>
							</select>
							<p class="text-xs text-text-muted mt-1">How often to check for updates</p>
						</div>
					</div>

					<!-- Dates -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
						<div>
							<InputLabel for="start_date" value="Start Date" />
							<TextInput
								id="start_date"
								v-model="form.start_date"
								type="date"
								class="block w-full mt-1"
								:disabled="!isProductValidated"
							/>
							<p class="text-xs text-text-muted mt-1">When to begin tracking</p>
							<InputError :message="errors.start_date?.[0]" class="mt-2" />
						</div>

						<div>
							<InputLabel for="end_date" value="End Date (optional)" />
							<TextInput
								id="end_date"
								v-model="form.end_date"
								type="date"
								class="block w-full mt-1"
								:min="form.start_date"
								:disabled="!isProductValidated"
							/>
							<p class="text-xs text-text-muted mt-1">Auto-stop tracking</p>
							<InputError :message="errors.end_date?.[0]" class="mt-2" />
						</div>
					</div>

					<!-- Notification Preferences -->
					<div>
						<InputLabel value="Notification Preferences" class="mb-3" />
						<div class="space-y-3">
							<label
								:class="[
									'flex items-center gap-3 p-4 rounded-md border transition-all',
									!isProductValidated ? 'cursor-not-allowed' : 'cursor-pointer',
									form.notification_email && isProductValidated
										? 'border-primary bg-primary/5'
										: 'border-border hover:bg-tan/40 hover:border-primary/40',
								]"
							>
								<Checkbox v-model:checked="form.notification_email" :disabled="!isProductValidated" />
								<EnvelopeIcon class="h-5 w-5 text-text-muted" />
								<div>
									<span class="font-medium text-primary">Email</span>
									<p class="text-xs text-text-muted">Receive price drop alerts via email</p>
								</div>
							</label>

							<label
								:class="[
									'flex items-center gap-3 p-4 rounded-md border transition-all',
									!isProductValidated || !hasActiveDevices ? 'cursor-not-allowed' : 'cursor-pointer',
									!hasActiveDevices ? 'opacity-60' : '',
									form.notification_push && isProductValidated && hasActiveDevices
										? 'border-primary bg-primary/5'
										: 'border-border hover:bg-tan/40 hover:border-primary/40',
								]"
							>
								<Checkbox
									v-model:checked="form.notification_push"
									:disabled="!isProductValidated || !hasActiveDevices"
								/>
								<DevicePhoneMobileIcon class="h-5 w-5 text-text-muted" />
								<div class="flex-1">
									<span class="font-medium text-primary">Push Notification</span>
									<p v-if="hasActiveDevices" class="text-xs text-text-muted">Receive instant alerts on your device</p>
									<p v-else class="text-xs text-warning">
										No devices registered. Use the mobile app to enable push notifications.
									</p>
								</div>
							</label>
						</div>
						<p v-if="isProductValidated && !hasNotificationMethod" class="text-xs text-danger mt-2">
							Please select at least one notification method
						</p>
						<InputError :message="errors.notification_method?.[0]" class="mt-2" />
					</div>
				</div>
			</section>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-3 mt-6">
				<RouterLink
					to="/watch"
					class="px-5 py-2.5 rounded-md text-sm font-medium text-text-muted hover:text-primary hover:bg-tan/50 transition-colors"
				>
					Cancel
				</RouterLink>
				<button
					:disabled="loading || !isFormValid"
					:class="[
						'inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors',
						loading || !isFormValid
							? 'bg-tan text-text-muted cursor-not-allowed'
							: 'bg-primary hover:bg-primary-light text-surface',
					]"
					@click="submitForm"
				>
					<BellAlertIcon v-if="!loading" class="h-4 w-4" />
					<Spinner v-else size="sm" color="white" />
					{{ loading ? 'Creating…' : 'Start tracking' }}
				</button>
			</div>
		</main>
	</div>
</template>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.line-clamp-3 {
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
