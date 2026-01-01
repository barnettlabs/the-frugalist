<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { BookOpenIcon, LightBulbIcon } from '@heroicons/vue/24/outline'
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
        <PageHeader
          :title="content.title"
          :description="content.description"
          back-link="/dashboard"
          back-label="Dashboard"
        />

        <!-- Key Concepts Section -->
        <div v-if="content.keywords && content.keywords.length > 0" class="mb-8 bg-surface/80 backdrop-blur-sm rounded-xl p-6 border border-border">
          <h2 class="text-lg font-medium text-primary mb-4">Key Concepts</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="(kw, index) in content.keywords"
              :key="index"
              class="flex items-center gap-2 bg-background rounded-lg px-4 py-3"
            >
              <span class="font-medium text-accent">{{ kw.keyword }}</span>
              <span v-if="kw.description" class="text-sm text-text-muted">- {{ kw.description }}</span>
            </div>
          </div>
        </div>

        <!-- Terms -->
        <div v-if="content.terms && content.terms.length > 0" class="mb-8">
          <h2 class="text-lg font-medium text-primary mb-4">Terms</h2>
          <div class="space-y-4">
            <div
              v-for="(term, index) in content.terms"
              :key="index"
              class="bg-surface/80 backdrop-blur-sm rounded-lg border border-border p-4"
            >
              <h3 class="font-medium text-primary mb-2">{{ term.term }}</h3>
              <p class="text-sm text-text-muted">{{ term.definition }}</p>
              <p v-if="term.example" class="text-sm text-text-muted mt-2 italic">
                Example: {{ term.example }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div v-if="content.tips && content.tips.length > 0">
          <h2 class="text-lg font-medium text-primary mb-4">Tips</h2>
          <div class="space-y-3">
            <div
              v-for="(tip, index) in content.tips"
              :key="index"
              class="flex items-start gap-3 bg-surface/80 backdrop-blur-sm rounded-lg p-4 border border-border"
            >
              <LightBulbIcon class="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p class="text-sm text-text-muted">{{ tip }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="mt-8 flex items-center justify-between">
          <RouterLink
            :to="`/estimates/${type}`"
            class="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Go to {{ type === 'financing' ? 'Finance' : 'Lease' }} Calculator
          </RouterLink>

          <RouterLink
            :to="`/learning/${otherType}`"
            class="text-accent hover:text-accent-dark font-medium"
          >
            Learn about {{ otherType }} →
          </RouterLink>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <BookOpenIcon class="h-16 w-16 text-text-muted mx-auto mb-4" />
        <h2 class="text-2xl font-medium text-primary mb-2">Content Not Found</h2>
        <p class="text-text-muted mb-6">The content you're looking for doesn't exist.</p>
        <RouterLink
          to="/dashboard"
          class="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-all"
        >
          Back to Dashboard
        </RouterLink>
      </div>
    </div>
  </main>
</template>
