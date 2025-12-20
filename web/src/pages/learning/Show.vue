<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { learningContentMap } from '@/data/learningContent'

const route = useRoute()
const type = computed(() => route.params.type as string)

const content = computed(() => {
  return learningContentMap[type.value as keyof typeof learningContentMap] || null
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

        <!-- TLDR Section -->
        <div v-if="content.keywords && content.keywords.length > 0" class="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
          <h2 class="text-lg font-bold text-gray-900 mb-4">TL;DR - Key Concepts</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="(kw, index) in content.keywords"
              :key="index"
              class="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-sm"
            >
              <span class="font-semibold text-primary">{{ kw.keyword }}</span>
              <span v-if="kw.description" class="text-sm text-gray-500">- {{ kw.description }}</span>
            </div>
          </div>
        </div>

        <!-- Terms -->
        <div v-if="content.terms && content.terms.length > 0" class="mb-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Key Terms</h2>
          <div class="space-y-4">
            <div
              v-for="(term, index) in content.terms"
              :key="index"
              class="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
            >
              <h3 class="font-semibold text-gray-900 mb-2">{{ term.term }}</h3>
              <p class="text-sm text-gray-600">{{ term.definition }}</p>
              <p v-if="term.example" class="text-sm text-gray-500 mt-2 italic">
                Example: {{ term.example }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div v-if="content.tips && content.tips.length > 0">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Pro Tips</h2>
          <div class="space-y-3">
            <div
              v-for="(tip, index) in content.tips"
              :key="index"
              class="flex items-start gap-3 bg-primary/5 rounded-lg p-4 border border-primary/10"
            >
              <span class="text-xl">💡</span>
              <p class="text-sm text-gray-700">{{ tip }}</p>
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
