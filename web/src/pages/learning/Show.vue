<script setup lang="ts">
import { ArrowLeftIcon, ArrowUpRightIcon, BookOpenIcon, LightBulbIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import SectionHeader from '@/components/SectionHeader.vue';
import { learningContentMap } from '@/data/learningContent';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const type = computed(() => route.params.type as string);

// Guests have no saved-estimate list, so link them into the calculator itself.
const calculatorLink = computed(() =>
	authStore.isAuthenticated ? `/estimates/${type.value}` : `/estimates/${type.value}/create`
);

const content = computed(() => {
	return learningContentMap[type.value as keyof typeof learningContentMap] || null;
});

const otherType = computed(() => {
	return type.value === 'financing' ? 'leasing' : 'financing';
});

const eyebrowLabel = computed(() => {
	return type.value === 'financing' ? 'Field Guide · Financing' : 'Field Guide · Leasing';
});
</script>

<template>
	<div class="pb-16">
		<template v-if="content">
			<!-- Editorial breadcrumb -->
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
				<RouterLink
					to="/learning"
					class="inline-flex items-center gap-1.5 text-xs eyebrow hover:text-primary transition-colors"
				>
					<ArrowLeftIcon class="h-3 w-3" />
					All field guides
				</RouterLink>
			</div>

			<SectionHeader
				:eyebrow="eyebrowLabel"
				:title="content.title"
				:description="content.description"
				:icon="BookOpenIcon"
				variant="compact"
			/>

			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
				<article class="grid grid-cols-12 gap-8 lg:gap-12">
					<!-- Sidebar: editorial nav / contents -->
					<aside class="col-span-12 lg:col-span-3 lg:sticky lg:top-8 lg:self-start">
						<div class="border-t border-border-strong pt-4">
							<p class="eyebrow mb-4">In this guide</p>
							<ul class="space-y-2 text-sm">
								<li v-if="content.keywords?.length">
									<a href="#concepts" class="text-primary hover:text-accent-dark transition-colors">Key concepts</a>
								</li>
								<li v-if="content.terms?.length">
									<a href="#terms" class="text-primary hover:text-accent-dark transition-colors">Terms</a>
								</li>
								<li v-if="content.tips?.length">
									<a href="#tips" class="text-primary hover:text-accent-dark transition-colors">Field tips</a>
								</li>
							</ul>
						</div>
					</aside>

					<!-- Article body -->
					<div class="col-span-12 lg:col-span-9 space-y-14">
						<!-- Key Concepts -->
						<section v-if="content.keywords && content.keywords.length > 0" id="concepts">
							<div class="flex items-baseline justify-between mb-6">
								<h2 class="font-display font-medium text-primary tracking-tightest text-3xl">Key concepts</h2>
								<span class="numeral text-xs text-text-muted">{{ content.keywords.length }} entries</span>
							</div>
							<dl
								class="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-md overflow-hidden"
							>
								<div v-for="(kw, index) in content.keywords" :key="index" class="bg-surface p-5">
									<dt class="font-display text-lg text-primary tracking-tight">{{ kw.keyword }}</dt>
									<dd v-if="kw.description" class="mt-1 text-sm text-text-muted leading-relaxed">
										{{ kw.description }}
									</dd>
								</div>
							</dl>
						</section>

						<!-- Terms -->
						<section v-if="content.terms && content.terms.length > 0" id="terms">
							<div class="flex items-baseline justify-between mb-6">
								<h2 class="font-display font-medium text-primary tracking-tightest text-3xl">Terms</h2>
								<span class="numeral text-xs text-text-muted">{{ content.terms.length }} terms</span>
							</div>
							<dl class="divide-y divide-border border-y border-border">
								<div v-for="(term, index) in content.terms" :key="index" class="grid grid-cols-12 gap-4 py-6">
									<dt class="col-span-12 sm:col-span-3 font-display text-lg text-primary tracking-tight">
										<span class="numeral text-xs text-text-muted block mb-1">{{
											String(index + 1).padStart(2, '0')
										}}</span>
										{{ term.term }}
									</dt>
									<dd class="col-span-12 sm:col-span-9 text-sm text-primary leading-relaxed">
										{{ term.definition }}
										<p
											v-if="term.example"
											class="mt-3 italic font-display text-base text-text-muted border-l-2 border-accent pl-4"
										>
											&ldquo;{{ term.example }}&rdquo;
										</p>
									</dd>
								</div>
							</dl>
						</section>

						<!-- Tips -->
						<section v-if="content.tips && content.tips.length > 0" id="tips">
							<div class="flex items-baseline justify-between mb-6">
								<h2 class="font-display font-medium text-primary tracking-tightest text-3xl">Field tips</h2>
								<span class="numeral text-xs text-text-muted">{{ content.tips.length }} notes</span>
							</div>
							<ol class="space-y-4">
								<li
									v-for="(tip, index) in content.tips"
									:key="index"
									class="grid grid-cols-12 gap-4 items-start bg-surface border border-border rounded-md p-5"
								>
									<span class="col-span-2 sm:col-span-1 numeral text-xs text-text-muted"
										>№ {{ String(index + 1).padStart(2, '0') }}</span
									>
									<div class="col-span-1 flex justify-center pt-1">
										<LightBulbIcon class="h-4 w-4 text-signal" />
									</div>
									<p class="col-span-9 sm:col-span-10 text-sm text-primary leading-relaxed">{{ tip }}</p>
								</li>
							</ol>
						</section>

						<!-- Footer CTA -->
						<section class="border-t border-border-strong pt-10">
							<div class="grid grid-cols-12 gap-6 items-center">
								<div class="col-span-12 lg:col-span-7">
									<p class="eyebrow mb-3">Apply it</p>
									<h3 class="font-display font-medium text-primary tracking-tightest text-3xl leading-tight">
										Now run the numbers on a real offer.
									</h3>
									<p class="mt-3 text-sm text-text-muted leading-relaxed">
										Take the terms above and put them into the calculator. Watch what dealer levers do to the monthly.
									</p>
								</div>
								<div class="col-span-12 lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
									<RouterLink
										:to="calculatorLink"
										class="group inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
									>
										Open the calculator
										<ArrowUpRightIcon
											class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
										/>
									</RouterLink>
									<RouterLink
										:to="`/learning/${otherType}`"
										class="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/5 hover:border-primary/40 transition-colors"
									>
										Read the {{ otherType }} guide
									</RouterLink>
								</div>
							</div>
						</section>
					</div>
				</article>
			</div>
		</template>

		<!-- Not Found -->
		<div v-else class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 text-center">
			<BookOpenIcon class="h-16 w-16 text-text-muted/40 mx-auto mb-6" />
			<h2 class="font-display text-3xl text-primary tracking-tight mb-2">Content not found</h2>
			<p class="text-text-muted mb-8">The guide you&rsquo;re looking for doesn&rsquo;t exist.</p>
			<RouterLink
				to="/learning"
				class="inline-flex items-center gap-2 rounded-md px-5 py-3 bg-primary text-surface text-sm font-medium hover:bg-primary-light transition-colors"
			>
				Back to field guides
			</RouterLink>
		</div>
	</div>
</template>
