<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import GuestLayout from '@/Layouts/GuestLayout.vue'
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <Head title="Privacy Policy - Sneaky Salesman" />

  <GuestLayout>
    <div class="-mt-24 relative z-10">
      <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 py-12">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p class="mt-2 text-gray-600">
            Last updated: December 1, 2025
          </p>
        </div>

        <!-- Introduction -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start mb-4">
            <ShieldCheckIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Introduction</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p>
              Sneaky Salesman ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web services.
            </p>
            <p>
              By using Sneaky Salesman, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>
        </div>

        <!-- Information We Collect -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start mb-4">
            <EyeIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Information We Collect</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p><strong>Personal Information:</strong></p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Email address (required for account creation)</li>
              <li>Name (optional)</li>
              <li>Phone number (optional, for price alerts via SMS)</li>
            </ul>

            <p class="mt-4"><strong>Usage Information:</strong></p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Vehicle finance and lease calculations you create</li>
              <li>Products you track using our price tracker</li>
              <li>App usage patterns and preferences</li>
              <li>Device information (device type, operating system)</li>
            </ul>

            <p class="mt-4"><strong>Automatically Collected Information:</strong></p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Log data (IP address, browser type, access times)</li>
              <li>Analytics data to improve our services</li>
            </ul>
          </div>
        </div>

        <!-- How We Use Your Information -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start mb-4">
            <LockClosedIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">How We Use Your Information</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p>We use the information we collect to:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Send you price drop alerts and notifications you've requested</li>
              <li>Save your vehicle finance and lease calculations</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about updates or changes to our services</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>
          </div>
        </div>

        <!-- Data Sharing -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start mb-4">
            <UserGroupIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Data Sharing</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> We may share information with third-party service providers who assist in operating our services (e.g., email delivery, SMS notifications, analytics)</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
            </ul>
          </div>
        </div>

        <!-- Data Security -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </div>
        </div>

        <!-- Your Rights -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          <div class="space-y-4 text-gray-700">
            <p>You have the right to:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Disable price alert notifications</li>
            </ul>
            <p class="mt-4">
              To exercise any of these rights, please contact us at <a href="mailto:jason.barnett@jaytech.io" class="text-primary hover:underline">jason.barnett@jaytech.io</a>.
            </p>
          </div>
        </div>

        <!-- Children's Privacy -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </div>
        </div>

        <!-- Changes to This Policy -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>

        <!-- Contact -->
        <div class="bg-white rounded-lg shadow p-6 bg-gray-50">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <a href="mailto:jason.barnett@jaytech.io" class="text-primary hover:underline">jason.barnett@jaytech.io</a>
            </p>
            <p class="text-sm text-gray-500 mt-4">
              JayTech LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>
