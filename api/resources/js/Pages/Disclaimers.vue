<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { ExclamationTriangleIcon, ShieldCheckIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

interface Props {
  user?: any
}

defineProps<Props>()
</script>

<template>
  <Head title="Disclaimers - Smart Price Tracker" />

  <AuthenticatedLayout v-if="user">
    <div class="py-12">
      <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Disclaimers & Terms of Use</h1>
          <p class="mt-2 text-gray-600">
            Important information about using our price tracking tools
          </p>
        </div>

        <!-- Warning Banner -->
        <div class="futuristic-card p-6 mb-8 bg-amber-50 border-amber-200">
          <div class="flex items-start">
            <ExclamationTriangleIcon class="h-8 w-8 text-amber-600 mr-4 flex-shrink-0" />
            <div>
              <h2 class="text-lg font-semibold text-amber-900 mb-2">Important Notice</h2>
              <p class="text-amber-800">
                Please read this information carefully before using our price tracking services. By using this service, you acknowledge and accept these terms.
              </p>
            </div>
          </div>
        </div>

        <!-- General Disclaimer -->
        <div class="futuristic-card p-6 mb-6">
          <div class="flex items-start mb-4">
            <InformationCircleIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">General Information</h2>
          </div>

          <div class="space-y-4 text-gray-700">
            <p>
              Our price tracking tools are provided as informational aids to help you monitor product prices across various retailers. These tools are designed to assist you in making informed purchasing decisions.
            </p>

            <p>
              The information provided by our service, including but not limited to price data, product availability, and notifications, is collected from publicly available sources and third-party APIs. We make reasonable efforts to ensure accuracy, but we cannot guarantee that all information is current, complete, or error-free.
            </p>
          </div>
        </div>

        <!-- No Legal Liability -->
        <div class="futuristic-card p-6 mb-6">
          <div class="flex items-start mb-4">
            <ShieldCheckIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Limitation of Liability</h2>
          </div>

          <div class="space-y-4 text-gray-700">
            <p>
              <strong>BY USING THIS SERVICE, YOU AGREE THAT:</strong>
            </p>

            <ul class="list-disc pl-6 space-y-2">
              <li>
                The data and notifications provided by this service are for <strong>informational purposes only</strong> and should not be considered professional advice or a guarantee of any kind.
              </li>

              <li>
                We are <strong>not responsible</strong> for any decisions you make based on the information provided by our service, including but not limited to purchasing decisions, financial decisions, or timing of purchases.
              </li>

              <li>
                Price information may be <strong>delayed, inaccurate, or outdated</strong>. Actual prices, availability, and product details should always be verified directly with the retailer before making a purchase.
              </li>

              <li>
                We make <strong>no warranties</strong>, express or implied, regarding the accuracy, reliability, or completeness of the information provided through our service.
              </li>

              <li>
                We shall not be held liable for any <strong>direct, indirect, incidental, consequential, or punitive damages</strong> arising from your use of this service, including but not limited to:
                <ul class="list-circle pl-6 mt-2 space-y-1">
                  <li>Financial losses due to inaccurate price information</li>
                  <li>Missed opportunities or deals</li>
                  <li>Failed or delayed notifications</li>
                  <li>Service interruptions or technical issues</li>
                  <li>Third-party retailer errors or changes</li>
                </ul>
              </li>

              <li>
                This service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without any guarantees of uptime, accuracy, or continued availability.
              </li>
            </ul>
          </div>
        </div>

        <!-- Data Accuracy -->
        <div class="futuristic-card p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Data Accuracy & Updates</h2>

          <div class="space-y-4 text-gray-700">
            <p>
              Price and product information is collected from retailer websites and third-party data providers. We cannot control:
            </p>

            <ul class="list-disc pl-6 space-y-2">
              <li>The accuracy of data provided by retailers or their APIs</li>
              <li>The frequency of price updates or changes</li>
              <li>Product availability or stock levels</li>
              <li>Retailer pricing errors or discrepancies</li>
              <li>Regional price variations or restrictions</li>
            </ul>

            <p class="mt-4">
              <strong>Always verify prices and availability directly with the retailer before making a purchase.</strong>
            </p>
          </div>
        </div>

        <!-- Third-Party Services -->
        <div class="futuristic-card p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>

          <div class="space-y-4 text-gray-700">
            <p>
              Our service relies on third-party retailer websites and APIs to collect product and pricing information. We are not affiliated with, endorsed by, or responsible for any third-party retailers or their services.
            </p>

            <p>
              Changes to retailer websites, APIs, or policies may affect our ability to track prices accurately. We reserve the right to discontinue tracking for any retailer at any time without notice.
            </p>
          </div>
        </div>

        <!-- User Responsibility -->
        <div class="futuristic-card p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Your Responsibility</h2>

          <div class="space-y-4 text-gray-700">
            <p>
              As a user of this service, you are responsible for:
            </p>

            <ul class="list-disc pl-6 space-y-2">
              <li>Verifying all price and product information before making purchases</li>
              <li>Understanding that notifications are informational only</li>
              <li>Acknowledging that tracking may be automatically deactivated after target prices are reached</li>
              <li>Maintaining accurate contact information for notifications</li>
              <li>Using this service in accordance with all applicable laws and retailer terms of service</li>
            </ul>
          </div>
        </div>

        <!-- Changes to Service -->
        <div class="futuristic-card p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Service Changes</h2>

          <div class="space-y-4 text-gray-700">
            <p>
              We reserve the right to:
            </p>

            <ul class="list-disc pl-6 space-y-2">
              <li>Modify, suspend, or discontinue the service at any time</li>
              <li>Change tracking frequencies or notification methods</li>
              <li>Add or remove supported retailers</li>
              <li>Update these disclaimers without prior notice</li>
            </ul>
          </div>
        </div>

        <!-- Contact Footer -->
        <div class="futuristic-card p-6 bg-gray-50">
          <p class="text-sm text-gray-600">
            <strong>Last Updated:</strong> {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
          <p class="text-sm text-gray-600 mt-2">
            By continuing to use this service, you acknowledge that you have read, understood, and agree to be bound by these disclaimers and limitations of liability.
          </p>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>

  <div v-else class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
      <!-- Same content for non-authenticated users -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Disclaimers & Terms of Use</h1>
        <p class="mt-2 text-gray-600">
          Important information about using our price tracking tools
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-700">
          Please <a href="/login" class="text-primary hover:underline">log in</a> or
          <a href="/register" class="text-primary hover:underline">register</a> to view the full disclaimers.
        </p>
      </div>
    </div>
  </div>
</template>