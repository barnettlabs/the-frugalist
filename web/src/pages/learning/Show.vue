<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { learningContent } from '@/data/learningContent'

const route = useRoute()
const type = computed(() => route.params.type as string)

const content = computed(() => {
  return learningContent[type.value as keyof typeof learningContent] || null
})

const otherType = computed(() => {
  return type.value === 'financing' ? 'leasing' : 'financing'
})
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <template v-if="content">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 rounded-xl bg-primary/10">
              <BookOpenIcon class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ content.title }}</h1>
              <p class="text-gray-600">{{ content.description }}</p>
            </div>
          </div>
        </div>

        <!-- Content Sections -->
        <div class="space-y-8">
          <div
            v-for="(section, index) in content.sections"
            :key="index"
            class="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ section.title }}</h2>
            <div class="prose prose-sm max-w-none text-gray-600">
              <p v-for="(paragraph, pIndex) in section.content" :key="pIndex" class="mb-4">
                {{ paragraph }}
              </p>
            </div>

            <!-- Terms if available -->
            <div v-if="section.terms && section.terms.length > 0" class="mt-6 space-y-4">
              <div
                v-for="(term, tIndex) in section.terms"
                :key="tIndex"
                class="bg-gray-50 rounded-lg p-4"
              >
                <h3 class="font-semibold text-gray-900 mb-2">{{ term.term }}</h3>
                <p class="text-sm text-gray-600">{{ term.definition }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="mt-8 flex items-center justify-between">
          <RouterLink
            :to="`/estimates/${type}`"
            class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Go to {{ type === 'financing' ? 'Finance' : 'Lease' }} Calculator
          </RouterLink>

          <RouterLink
            :to="`/learning/${otherType}`"
            class="text-primary hover:text-primary-shade-1 font-medium"
          >
            Learn about {{ otherType }} →
          </RouterLink>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <BookOpenIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h2>
        <p class="text-gray-600 mb-6">The learning content you're looking for doesn't exist.</p>
        <RouterLink
          to="/dashboard"
          class="bg-primary hover:bg-primary-shade-1 text-white px-6 py-3 rounded-lg font-medium transition-all"
        >
          Back to Dashboard
        </RouterLink>
      </div>
    </div>
  </main>
</template>
