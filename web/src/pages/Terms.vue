<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
	<main class="py-6 flex-1">
		<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
			<div class="bg-surface rounded-lg border border-border p-6 sm:p-8">
				<h1 class="text-xl font-semibold text-primary mb-4">Terms of Service</h1>

				<div class="prose prose-neutral max-w-none">
					<p class="text-text-muted text-sm mb-4">Last updated: {{ new Date().toLocaleDateString() }}</p>

					<h2 class="text-base font-medium text-primary mt-6 mb-2">1. Acceptance of Terms</h2>
					<p class="text-text-muted text-sm mb-4 leading-relaxed">
						By accessing and using TheFrugalist, you agree to be bound by these Terms of Service and all applicable laws
						and regulations.
					</p>

					<h2 class="text-base font-medium text-primary mt-6 mb-2">2. Use of Services</h2>
					<p class="text-text-muted text-sm mb-4 leading-relaxed">
						Our vehicle finance and lease calculators are provided for informational purposes only. The calculations
						should not be considered financial advice.
					</p>

					<h2 class="text-base font-medium text-primary mt-6 mb-2">3. User Accounts</h2>
					<p class="text-text-muted text-sm mb-4 leading-relaxed">
						You are responsible for maintaining the confidentiality of your account credentials and for all activities
						that occur under your account.
					</p>

					<h2 class="text-base font-medium text-primary mt-6 mb-2">4. Disclaimer</h2>
					<p class="text-text-muted text-sm mb-4 leading-relaxed">
						The services are provided "as is" without warranties of any kind. We do not guarantee the accuracy of
						calculations or the availability of services.
					</p>

					<h2 class="text-base font-medium text-primary mt-6 mb-2">5. Limitation of Liability</h2>
					<p class="text-text-muted text-sm mb-4 leading-relaxed">
						We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use
						of our services.
					</p>

					<h2 class="text-base font-medium text-primary mt-6 mb-2">6. Contact</h2>
					<p class="text-text-muted text-sm mb-4 leading-relaxed">
						For questions about these Terms, please contact
						<a href="mailto:jason.barnett@jaytech.io" class="text-accent hover:text-accent-dark">
							jason.barnett@jaytech.io
						</a>
					</p>
				</div>

				<div class="mt-6 pt-4 border-t border-border">
					<RouterLink to="/" class="text-accent hover:text-accent-dark text-sm font-medium">
						← Back to Home
					</RouterLink>
				</div>
			</div>
		</div>
	</main>
</template>
