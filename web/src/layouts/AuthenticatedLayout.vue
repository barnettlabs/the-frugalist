<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import {
	ArrowRightOnRectangleIcon,
	BanknotesIcon,
	Bars3Icon,
	BookOpenIcon,
	CalculatorIcon,
	ChevronRightIcon,
	ClipboardDocumentCheckIcon,
	CurrencyDollarIcon,
	EyeIcon,
	HomeIcon,
	HomeModernIcon,
	ShieldCheckIcon,
	UserIcon,
	XMarkIcon,
} from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';

import ApplicationLogo from '@/components/ApplicationLogo.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import { useAuthStore } from '@/stores/auth';

interface NavChild {
	name: string;
	href: string;
	icon: any;
}

interface NavItem {
	name: string;
	href: string;
	icon: any;
	children?: NavChild[];
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const sidebarOpen = ref(false);

const user = computed(() => authStore.user);
const fullName = computed(() => authStore.fullName);
const isAdmin = computed(() => authStore.isAdmin);

const navigation: NavItem[] = [
	{ name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
	{ name: 'Watch', href: '/watch', icon: EyeIcon },
	{
		name: 'Compute',
		href: '/estimates',
		icon: CalculatorIcon,
		children: [
			{ name: 'Financing', href: '/estimates/financing', icon: BanknotesIcon },
			{ name: 'Leasing', href: '/estimates/leasing', icon: CurrencyDollarIcon },
			{ name: 'Mortgage', href: '/estimates/mortgage', icon: HomeModernIcon },
		],
	},
	{
		name: 'Guides',
		href: '/learning',
		icon: BookOpenIcon,
		children: [
			{ name: 'Financing', href: '/learning/financing', icon: BanknotesIcon },
			{ name: 'Leasing', href: '/learning/leasing', icon: CurrencyDollarIcon },
		],
	},
	{ name: 'Review', href: '/review', icon: ClipboardDocumentCheckIcon },
];

const isActive = (href: string) => {
	if (href === '/dashboard') {
		return route.path === '/dashboard';
	}
	if (href === '/estimates') {
		return route.path === '/estimates';
	}
	if (href === '/learning') {
		return route.path === '/learning';
	}
	return route.path.startsWith(href);
};

const isChildActive = (href: string) => {
	return route.path.startsWith(href);
};

const isInSection = (href: string) => {
	return route.path.startsWith(href);
};

// Dynamic breadcrumb generation from route meta
const breadcrumbs = computed(() => {
	const crumbs: { name: string; href: string }[] = [];

	// Helper to get breadcrumb label (handles string or function)
	const getLabel = (meta: any, currentRoute: any): string => {
		if (typeof meta.breadcrumb === 'function') {
			return meta.breadcrumb(currentRoute);
		}
		return meta.breadcrumb || '';
	};

	// Helper to find route by name
	const findRoute = (name: string) => {
		return router.getRoutes().find(r => r.name === name);
	};

	// Build breadcrumb chain by following parent references
	const buildChain = (
		routeName: string | symbol | null | undefined,
		currentRoute: any
	): { name: string; href: string }[] => {
		if (!routeName) return [];

		const routeRecord = findRoute(routeName as string);
		if (!routeRecord) return [];

		const chain: { name: string; href: string }[] = [];

		// If this route has a parent, add parent's chain first
		if (routeRecord.meta?.parent) {
			chain.push(...buildChain(routeRecord.meta.parent as string, currentRoute));
		}

		// Add this route's breadcrumb
		if (routeRecord.meta?.breadcrumb) {
			chain.push({
				name: getLabel(routeRecord.meta, currentRoute),
				href: routeRecord.path.replace(/:\w+/g, param => {
					const paramName = param.slice(1);
					return currentRoute.params[paramName] || param;
				}),
			});
		}

		return chain;
	};

	// Always start with Dashboard
	crumbs.push({ name: 'Dashboard', href: '/dashboard' });

	// Build the chain from current route (skip if we're on dashboard to avoid duplication)
	if (route.name !== 'dashboard') {
		crumbs.push(...buildChain(route.name, route));
	}

	return crumbs;
});

const handleSignOut = async () => {
	await authStore.logout();
	router.push('/login');
};
</script>

<template>
	<div class="min-h-screen">
		<!-- Mobile sidebar overlay -->
		<TransitionRoot as="template" :show="sidebarOpen">
			<Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
				<TransitionChild
					as="template"
					enter="transition-opacity ease-linear duration-300"
					enter-from="opacity-0"
					enter-to="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leave-from="opacity-100"
					leave-to="opacity-0"
				>
					<div class="fixed inset-0 bg-neutral-900/80" />
				</TransitionChild>

				<div class="fixed inset-0 flex">
					<TransitionChild
						as="template"
						enter="transition ease-in-out duration-300 transform"
						enter-from="-translate-x-full"
						enter-to="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leave-from="translate-x-0"
						leave-to="-translate-x-full"
					>
						<DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
							<TransitionChild
								as="template"
								enter="ease-in-out duration-300"
								enter-from="opacity-0"
								enter-to="opacity-100"
								leave="ease-in-out duration-300"
								leave-from="opacity-100"
								leave-to="opacity-0"
							>
								<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
									<button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
										<span class="sr-only">Close sidebar</span>
										<XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
									</button>
								</div>
							</TransitionChild>

							<!-- Mobile sidebar content -->
							<div
								class="flex grow flex-col gap-y-5 overflow-y-auto bg-surface/95 backdrop-blur-xs px-6 pb-4 border-r border-border"
							>
								<div class="flex h-16 shrink-0 items-center">
									<RouterLink to="/dashboard" class="flex items-center gap-2" @click="sidebarOpen = false">
										<ApplicationLogo size="md" />
										<span class="text-xl font-medium text-accent tracking-tight">thefrugalist</span>
									</RouterLink>
								</div>

								<nav class="flex flex-1 flex-col">
									<ul role="list" class="flex flex-1 flex-col gap-y-7">
										<li>
											<ul role="list" class="-mx-2 space-y-1">
												<li v-for="item in navigation" :key="item.name">
													<!-- Item with always-visible children -->
													<template v-if="item.children">
														<RouterLink
															:to="item.href"
															:class="[
																isActive(item.href)
																	? 'bg-accent/10 text-accent-dark'
																	: isInSection(item.href)
																		? 'text-primary'
																		: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
																'group flex w-full items-center gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
															]"
															@click="sidebarOpen = false"
														>
															<component
																:is="item.icon"
																:class="[
																	isActive(item.href) || isInSection(item.href)
																		? 'text-accent'
																		: 'text-text-muted group-hover:text-primary',
																	'h-5 w-5 shrink-0 transition-colors',
																]"
																aria-hidden="true"
															/>
															<span>{{ item.name }}</span>
														</RouterLink>
														<!-- Always visible children with tree lines -->
														<ul class="mt-1 ml-[18px]">
															<li v-for="(child, index) in item.children" :key="child.name" class="relative">
																<!-- Tree connector: vertical line + horizontal branch -->
																<div
																	class="absolute left-0 top-0 border-l border-border"
																	:class="index === item.children.length - 1 ? 'h-[18px] rounded-bl' : 'h-full'"
																></div>
																<div class="absolute left-0 top-[18px] w-4 border-t border-border"></div>
																<RouterLink
																	:to="child.href"
																	:class="[
																		isChildActive(child.href)
																			? 'bg-accent/10 text-accent-dark'
																			: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
																		'group flex items-center gap-x-2 rounded-lg py-2 px-2.5 ml-4 text-sm leading-6 font-medium transition-all',
																	]"
																	@click="sidebarOpen = false"
																>
																	<component
																		:is="child.icon"
																		:class="[
																			isChildActive(child.href)
																				? 'text-accent'
																				: 'text-text-muted group-hover:text-primary',
																			'h-4 w-4 shrink-0 transition-colors',
																		]"
																		aria-hidden="true"
																	/>
																	<span>{{ child.name }}</span>
																</RouterLink>
															</li>
														</ul>
													</template>
													<!-- Simple item without children -->
													<RouterLink
														v-else
														:to="item.href"
														:class="[
															isActive(item.href)
																? 'bg-accent/10 text-accent-dark'
																: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
															'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
														]"
														@click="sidebarOpen = false"
													>
														<component
															:is="item.icon"
															:class="[
																isActive(item.href) ? 'text-accent' : 'text-text-muted group-hover:text-primary',
																'h-5 w-5 shrink-0 transition-colors',
															]"
															aria-hidden="true"
														/>
														<span>{{ item.name }}</span>
													</RouterLink>
												</li>
											</ul>
										</li>

										<li class="mt-auto">
											<RouterLink
												to="/profile"
												class="group -mx-2 flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-neutral-100 hover:text-primary transition-all"
												@click="sidebarOpen = false"
											>
												<div
													class="h-8 w-8 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center shrink-0"
												>
													<img
														v-if="(user as any)?.avatar_url"
														class="h-full w-full object-cover"
														:src="(user as any)?.avatar_url"
														:alt="fullName"
													/>
													<UserIcon v-else class="h-4 w-4 text-text-muted" />
												</div>
												<span class="truncate">{{ fullName }}</span>
											</RouterLink>

											<button
												class="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-danger/10 hover:text-danger transition-all"
												@click="handleSignOut"
											>
												<ArrowRightOnRectangleIcon class="h-5 w-5 shrink-0 group-hover:text-danger transition-colors" />
												<span>Sign out</span>
											</button>
										</li>
									</ul>
								</nav>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</TransitionRoot>

		<!-- Static sidebar for desktop -->
		<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
			<div
				class="flex grow flex-col gap-y-5 overflow-y-auto bg-surface/90 backdrop-blur-xs border-r border-border px-6 pb-4"
			>
				<!-- Logo -->
				<div class="flex h-16 shrink-0 items-center">
					<RouterLink to="/dashboard" class="flex items-center gap-2">
						<ApplicationLogo size="md" />
						<span class="text-xl font-medium text-accent tracking-tight">thefrugalist</span>
					</RouterLink>
				</div>

				<nav class="flex flex-1 flex-col">
					<ul role="list" class="flex flex-1 flex-col gap-y-7">
						<li>
							<ul role="list" class="-mx-2 space-y-1">
								<li v-for="item in navigation" :key="item.name">
									<!-- Item with always-visible children -->
									<template v-if="item.children">
										<RouterLink
											:to="item.href"
											:class="[
												isActive(item.href)
													? 'bg-accent/10 text-accent-dark'
													: isInSection(item.href)
														? 'text-primary'
														: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
												'group flex w-full items-center gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
											]"
										>
											<component
												:is="item.icon"
												:class="[
													isActive(item.href) || isInSection(item.href)
														? 'text-accent'
														: 'text-text-muted group-hover:text-primary',
													'h-5 w-5 shrink-0 transition-colors',
												]"
												aria-hidden="true"
											/>
											<span>{{ item.name }}</span>
										</RouterLink>
										<!-- Always visible children with tree lines -->
										<ul class="mt-1 ml-[18px]">
											<li v-for="(child, index) in item.children" :key="child.name" class="relative">
												<!-- Tree connector: vertical line + horizontal branch -->
												<div
													class="absolute left-0 top-0 border-l border-border"
													:class="index === item.children.length - 1 ? 'h-[18px] rounded-bl' : 'h-full'"
												></div>
												<div class="absolute left-0 top-[18px] w-4 border-t border-border"></div>
												<RouterLink
													:to="child.href"
													:class="[
														isChildActive(child.href)
															? 'bg-accent/10 text-accent-dark'
															: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
														'group flex items-center gap-x-2 rounded-lg py-2 px-2.5 ml-4 text-sm leading-6 font-medium transition-all',
													]"
												>
													<component
														:is="child.icon"
														:class="[
															isChildActive(child.href) ? 'text-accent' : 'text-text-muted group-hover:text-primary',
															'h-4 w-4 shrink-0 transition-colors',
														]"
														aria-hidden="true"
													/>
													<span>{{ child.name }}</span>
												</RouterLink>
											</li>
										</ul>
									</template>
									<!-- Simple item without children -->
									<RouterLink
										v-else
										:to="item.href"
										:class="[
											isActive(item.href)
												? 'bg-accent/10 text-accent-dark'
												: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
											'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
										]"
									>
										<component
											:is="item.icon"
											:class="[
												isActive(item.href) ? 'text-accent' : 'text-text-muted group-hover:text-primary',
												'h-5 w-5 shrink-0 transition-colors',
											]"
											aria-hidden="true"
										/>
										<span>{{ item.name }}</span>
									</RouterLink>
								</li>
							</ul>
						</li>

						<li class="mt-auto">
							<RouterLink
								to="/profile"
								class="group -mx-2 flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-neutral-100 hover:text-primary transition-all"
							>
								<div
									class="h-8 w-8 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center shrink-0"
								>
									<img
										v-if="(user as any)?.avatar_url"
										class="h-full w-full object-cover"
										:src="(user as any)?.avatar_url"
										:alt="fullName"
									/>
									<UserIcon v-else class="h-4 w-4 text-text-muted" />
								</div>
								<span class="truncate">{{ fullName }}</span>
							</RouterLink>

							<button
								class="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 text-text-muted hover:bg-danger/10 hover:text-danger transition-all"
								@click="handleSignOut"
							>
								<ArrowRightOnRectangleIcon class="h-5 w-5 shrink-0 group-hover:text-danger transition-colors" />
								<span>Sign out</span>
							</button>
						</li>
					</ul>
				</nav>
			</div>
		</div>

		<!-- Main content -->
		<div class="lg:pl-64">
			<!-- Top bar -->
			<div
				class="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border bg-surface/80 backdrop-blur-xs px-4 sm:gap-x-6 sm:px-6 lg:px-8"
			>
				<button type="button" class="-m-2.5 p-2.5 text-text-muted lg:hidden" @click="sidebarOpen = true">
					<span class="sr-only">Open sidebar</span>
					<Bars3Icon class="h-6 w-6" aria-hidden="true" />
				</button>

				<!-- Separator -->
				<div class="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

				<!-- Breadcrumbs -->
				<nav class="flex flex-1" aria-label="Breadcrumb">
					<ol role="list" class="flex items-center space-x-2">
						<li v-for="(crumb, index) in breadcrumbs" :key="crumb.href" class="flex items-center">
							<ChevronRightIcon
								v-if="Number(index) > 0"
								class="h-4 w-4 shrink-0 text-text-muted mx-2"
								aria-hidden="true"
							/>
							<RouterLink
								:to="crumb.href"
								:class="[
									index === breadcrumbs.length - 1 ? 'text-primary font-medium' : 'text-text-muted hover:text-primary',
									'text-sm transition-colors',
								]"
							>
								{{ crumb.name }}
							</RouterLink>
						</li>
					</ol>
				</nav>

				<RouterLink
					v-if="isAdmin"
					to="/admin"
					title="Admin Console"
					aria-label="Admin Console"
					class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-text-muted hover:text-accent hover:bg-neutral-100 transition-colors"
				>
					<ShieldCheckIcon class="h-4 w-4" />
					<span class="hidden sm:inline">Admin</span>
				</RouterLink>
			</div>

			<!-- Page content -->
			<main class="min-h-[calc(100vh-3.5rem-4rem)]">
				<RouterView />
			</main>

			<!-- Footer -->
			<footer class="h-16 border-t border-border bg-surface/50 px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-text-muted">
					<p>&copy; {{ new Date().getFullYear() }} TheFrugalist. All rights reserved.</p>
					<nav class="flex items-center gap-4">
						<RouterLink to="/privacy" class="hover:text-primary transition-colors">Privacy Policy</RouterLink>
						<RouterLink to="/terms" class="hover:text-primary transition-colors">Terms of Service</RouterLink>
					</nav>
				</div>
			</footer>
		</div>

		<ToastContainer />
	</div>
</template>
