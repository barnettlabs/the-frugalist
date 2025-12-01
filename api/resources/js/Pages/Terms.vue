<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import GuestLayout from '@/Layouts/GuestLayout.vue'
import { DocumentTextIcon, ExclamationTriangleIcon, ScaleIcon, NoSymbolIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <Head title="Terms & Conditions - Sneaky Salesman" />

  <GuestLayout>
    <div class="-mt-24 relative z-10">
      <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 py-12">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
          <p class="mt-2 text-gray-600">
            Last updated: December 1, 2025
          </p>
        </div>

        <!-- Introduction -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start mb-4">
            <DocumentTextIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Agreement to Terms</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p>
              By accessing or using Sneaky Salesman (the "Service"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
            </p>
            <p>
              The Service is operated by JayTech LLC ("we", "us", or "our").
            </p>
          </div>
        </div>

        <!-- Description of Service -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Description of Service</h2>
          <div class="space-y-4 text-gray-700">
            <p>Sneaky Salesman provides:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Vehicle Finance Calculator:</strong> Tools to estimate vehicle financing costs, monthly payments, and total loan amounts</li>
              <li><strong>Vehicle Lease Calculator:</strong> Tools to estimate vehicle leasing costs and compare lease options</li>
              <li><strong>Price Tracker:</strong> Monitor product prices across various retailers and receive notifications when prices drop</li>
            </ul>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-amber-500">
          <div class="flex items-start mb-4">
            <ExclamationTriangleIcon class="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Important Disclaimers</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p><strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</strong></p>
            <ul class="list-disc pl-6 space-y-2">
              <li>All calculations and estimates are for <strong>informational purposes only</strong> and should not be considered financial advice</li>
              <li>Actual financing terms, rates, and payments may vary based on your credit, the lender, and other factors</li>
              <li>Price tracking data may be delayed, inaccurate, or incomplete</li>
              <li>We are not responsible for pricing errors from third-party retailers</li>
              <li>You should always verify information directly with retailers or financial institutions before making decisions</li>
            </ul>
          </div>
        </div>

        <!-- User Accounts -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">User Accounts</h2>
          <div class="space-y-4 text-gray-700">
            <p>When you create an account, you agree to:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
            <p class="mt-4">
              You must be at least 18 years old to create an account and use our services.
            </p>
          </div>
        </div>

        <!-- Acceptable Use -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start mb-4">
            <NoSymbolIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Acceptable Use</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p>You agree not to:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated scripts or bots to access the Service excessively</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Resell or redistribute our services without permission</li>
              <li>Use the Service in a way that could harm us or other users</li>
            </ul>
          </div>
        </div>

        <!-- Intellectual Property -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              The Service and its original content, features, and functionality are owned by JayTech LLC and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, or create derivative works based on our Service without our explicit written permission.
            </p>
          </div>
        </div>

        <!-- Limitation of Liability -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-start mb-4">
            <ScaleIcon class="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
            <h2 class="text-xl font-semibold text-gray-900">Limitation of Liability</h2>
          </div>
          <div class="space-y-4 text-gray-700">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, JAYTECH LLC SHALL NOT BE LIABLE FOR:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Any loss of profits, revenue, data, or business opportunities</li>
              <li>Any damages arising from your reliance on information provided by the Service</li>
              <li>Any damages resulting from errors in calculations or price data</li>
              <li>Any third-party actions, products, or services</li>
            </ul>
            <p class="mt-4">
              Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the past 12 months, if any.
            </p>
          </div>
        </div>

        <!-- Third-Party Services -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              Our Service may contain links to or integrate with third-party websites and services. We are not responsible for the content, privacy policies, or practices of any third parties.
            </p>
            <p>
              Price tracking features rely on data from third-party retailers. We are not affiliated with these retailers and cannot guarantee the accuracy of their data.
            </p>
          </div>
        </div>

        <!-- Termination -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Termination</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. You may request deletion of your data by contacting us.
            </p>
          </div>
        </div>

        <!-- Changes to Terms -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on this page.
            </p>
            <p>
              Your continued use of the Service after changes are posted constitutes acceptance of the updated Terms.
            </p>
          </div>
        </div>

        <!-- Governing Law -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Governing Law</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>

        <!-- Contact -->
        <div class="bg-white rounded-lg shadow p-6 bg-gray-50">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <div class="space-y-4 text-gray-700">
            <p>
              If you have any questions about these Terms & Conditions, please contact us at:
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
