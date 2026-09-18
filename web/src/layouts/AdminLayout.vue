<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import {
	ArrowLeftIcon,
	ArrowRightOnRectangleIcon,
	Bars3Icon,
	BugAntIcon,
	BuildingStorefrontIcon,
	ClipboardDocumentListIcon,
	CpuChipIcon,
	MegaphoneIcon,
	ShieldCheckIcon,
	SparklesIcon,
	UserIcon,
	UsersIcon,
	XMarkIcon,
} from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';

import ApplicationLogo from '@/components/ApplicationLogo.vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const sidebarOpen = ref(false);
const user = computed(() => authStore.user);
const fullName = computed(() => authStore.fullName);

const navigation = [
	{ name: 'Overview', href: '/admin', icon: ShieldCheckIcon, exact: true },
	{ name: 'Retailers', href: '/admin/retailers', icon: BuildingStorefrontIcon },
	{ name: 'Announcements', href: '/admin/announcements', icon: MegaphoneIcon },
	{ name: 'Users', href: '/admin/users', icon: UsersIcon },
	{ name: 'Bug Reports', href: '/admin/bug-reports', icon: BugAntIcon },
	{ name: 'AI Providers', href: '/admin/ai/providers', icon: CpuChipIcon },
	{ name: 'AI Agents', href: '/admin/ai/agents', icon: SparklesIcon },
	{ name: 'AI Invocations', href: '/admin/ai/invocations', icon: ClipboardDocumentListIcon },
];

const isActive = (href: string, exact = false) => {
	if (exact) return route.path === href;
	return route.path === href || route.path.startsWith(href + '/');
};

const handleSignOut = async () => {
	await authStore.logout();
	router.push('/login');
};
</script>

<template>
	<div class="min-h-screen">
		<!-- Mobile sidebar -->
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

							<div
								class="flex grow flex-col gap-y-5 overflow-y-auto bg-surface/95 backdrop-blur-xs px-6 pb-4 border-r border-border"
							>
								<div class="flex h-16 shrink-0 items-center gap-2">
									<RouterLink to="/admin" class="flex items-center gap-2" @click="sidebarOpen = false">
										<ApplicationLogo size="md" />
										<span class="text-lg font-medium text-accent tracking-tight">admin</span>
									</RouterLink>
								</div>
								<nav class="flex flex-1 flex-col">
									<ul role="list" class="flex flex-1 flex-col gap-y-7">
										<li>
											<ul role="list" class="-mx-2 space-y-1">
												<li v-for="item in navigation" :key="item.name">
													<RouterLink
														:to="item.href"
														:class="[
															isActive(item.href, item.exact)
																? 'bg-accent/10 text-accent-dark'
																: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
															'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
														]"
														@click="sidebarOpen = false"
													>
														<component
															:is="item.icon"
															:class="[
																isActive(item.href, item.exact)
																	? 'text-accent'
																	: 'text-text-muted group-hover:text-primary',
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

		<!-- Desktop sidebar -->
		<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
			<div
				class="flex grow flex-col gap-y-5 overflow-y-auto bg-surface/90 backdrop-blur-xs border-r border-border px-6 pb-4"
			>
				<div class="flex h-16 shrink-0 items-center gap-2">
					<RouterLink to="/admin" class="flex items-center gap-2">
						<ApplicationLogo size="md" />
						<span class="text-lg font-medium text-accent tracking-tight">admin</span>
					</RouterLink>
				</div>
				<nav class="flex flex-1 flex-col">
					<ul role="list" class="flex flex-1 flex-col gap-y-7">
						<li>
							<p class="eyebrow mb-2 px-2">Manage</p>
							<ul role="list" class="-mx-2 space-y-1">
								<li v-for="item in navigation" :key="item.name">
									<RouterLink
										:to="item.href"
										:class="[
											isActive(item.href, item.exact)
												? 'bg-accent/10 text-accent-dark'
												: 'text-text-muted hover:bg-neutral-100 hover:text-primary',
											'group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all',
										]"
									>
										<component
											:is="item.icon"
											:class="[
												isActive(item.href, item.exact) ? 'text-accent' : 'text-text-muted group-hover:text-primary',
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
			<div
				class="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border bg-surface/80 backdrop-blur-xs px-4 sm:gap-x-6 sm:px-6 lg:px-8"
			>
				<button type="button" class="-m-2.5 p-2.5 text-text-muted lg:hidden" @click="sidebarOpen = true">
					<span class="sr-only">Open sidebar</span>
					<Bars3Icon class="h-6 w-6" aria-hidden="true" />
				</button>
				<div class="flex flex-1 items-center gap-2 text-sm">
					<ShieldCheckIcon class="h-4 w-4 text-accent" />
					<span class="eyebrow">Admin Console</span>
				</div>

				<RouterLink
					to="/dashboard"
					title="Back to app"
					aria-label="Back to app"
					class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-text-muted hover:text-primary hover:bg-neutral-100 transition-colors"
				>
					<ArrowLeftIcon class="h-4 w-4" />
					<span class="hidden sm:inline">Back to app</span>
				</RouterLink>
			</div>

			<main class="min-h-[calc(100vh-3.5rem)] py-8 px-4 sm:px-6 lg:px-8">
				<RouterView />
			</main>
		</div>
	</div>
</template>
