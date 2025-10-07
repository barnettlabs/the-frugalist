<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import TermDefinition from '@/Components/Learning/TermDefinition.vue'
import KeywordTag from '@/Components/Learning/KeywordTag.vue'
import ContentSection from '@/Components/Learning/ContentSection.vue'
import { learningContentMap, type LearningContent } from '@/data/learningContent'
import {
  BookOpenIcon,
  LightBulbIcon,
  TagIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

interface Props {
  user: User
  tool: 'financing' | 'leasing'
}

const props = defineProps<Props>()

const content = computed<LearningContent | undefined>(() => {
  return learningContentMap[props.tool]
})

const breadcrumbs = computed(() => [
  { name: 'Learning Center', href: undefined, current: false },
  { name: content.value?.title || 'Unknown Tool', href: undefined, current: true },
])

const backLink = computed(() => {
  return props.tool === 'financing' ? '/estimates/financing' : '/estimates/leasing'
})
</script>

<template>
  <Head :title="`Learn About ${content?.title || 'Tool'}`" />

  <AuthenticatedLayout :user="user" :breadcrumbs="breadcrumbs">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Link
          :href="backLink"
          class="inline-flex items-center gap-2 text-primary hover:text-primary-shade-1 transition-colors mb-4"
        >
          <ArrowLeftIcon class="h-4 w-4" />
          <span>Back to Calculator</span>
        </Link>

        <div class="flex items-start gap-4">
          <div class="bg-primary/10 p-4 rounded-xl">
            <BookOpenIcon class="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ content?.title }}</h1>
            <p class="text-lg text-gray-600">{{ content?.description }}</p>
          </div>
        </div>
      </div>

      <!-- Keywords Section -->
      <ContentSection title="Key Terms at a Glance" :icon="TagIcon">
        <div class="flex flex-wrap gap-3">
          <KeywordTag
            v-for="keyword in content?.keywords"
            :key="keyword.keyword"
            :keyword="keyword.keyword"
            :description="keyword.description"
          />
        </div>
      </ContentSection>

      <!-- Terms & Definitions Section -->
      <ContentSection title="Detailed Definitions" :icon="BookOpenIcon">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TermDefinition
            v-for="term in content?.terms"
            :key="term.term"
            :term="term.term"
            :definition="term.definition"
            :example="term.example"
          />
        </div>
      </ContentSection>

      <!-- Tips Section -->
      <ContentSection v-if="content?.tips && content.tips.length > 0" title="Pro Tips" :icon="LightBulbIcon">
        <div class="bg-gradient-to-br from-primary/5 to-primary-tint-4/20 border border-primary/20 rounded-xl p-6">
          <ul class="space-y-3">
            <li
              v-for="(tip, index) in content.tips"
              :key="index"
              class="flex items-start gap-3 text-gray-700"
            >
              <span
                class="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5"
              >
                {{ index + 1 }}
              </span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>
      </ContentSection>

      <!-- Call to Action -->
      <div class="mt-12 bg-gradient-to-r from-primary to-primary-shade-1 rounded-xl p-8 text-white text-center">
        <h2 class="text-2xl font-bold mb-3">Ready to Get Started?</h2>
        <p class="text-white/90 mb-6 max-w-2xl mx-auto">
          Now that you understand the key terms, use our calculator to estimate your
          {{ tool === 'financing' ? 'financing' : 'leasing' }} costs and compare options.
        </p>
        <Link
          :href="backLink"
          class="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <span>Go to Calculator</span>
        </Link>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
