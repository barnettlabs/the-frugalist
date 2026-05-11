<script setup lang="ts">
import { ref } from 'vue'
import { SparklesIcon, ExclamationTriangleIcon, LightBulbIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { aiApi, calculatorsApi, type DealGradeResponse } from '@/api/ai'

const props = defineProps<{
  agentSlug: string
  calculatorType: 'finance' | 'lease'
  inputs: Record<string, unknown>
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<DealGradeResponse | null>(null)
const cached = ref(false)
const agentVersion = ref<number | null>(null)

const gradeColor = (grade: string) => {
  if (grade === 'A+' || grade === 'A') return 'bg-success/15 text-success border-success/30'
  if (grade === 'B') return 'bg-accent/15 text-accent-dark border-accent/30'
  if (grade === 'C') return 'bg-warning/15 text-warning border-warning/30'
  return 'bg-danger/15 text-danger border-danger/30'
}

const run = async () => {
  loading.value = true
  error.value = null
  try {
    const compute = props.calculatorType === 'finance'
      ? await calculatorsApi.finance(props.inputs, false)
      : await calculatorsApi.lease(props.inputs, false)

    const run = await aiApi.runAgent<DealGradeResponse>(
      props.agentSlug,
      { inputs: compute.inputs, computed: compute.computed },
      { contextKey: `calculator.${props.calculatorType}.deal-grade` },
    )
    result.value = run.response
    cached.value = run.cached
    agentVersion.value = run.agent.version
  } catch (e: any) {
    error.value = e.response?.data?.message
      ?? (e.response?.status === 429 ? 'Daily limit reached for this agent.' : null)
      ?? 'Could not grade this deal. Try again in a moment.'
  } finally {
    loading.value = false
  }
}

const reset = () => {
  result.value = null
  error.value = null
  cached.value = false
}
</script>

<template>
  <section class="card p-5">
    <header class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <SparklesIcon class="h-4 w-4 text-accent" />
        <h3 class="font-display text-primary tracking-tight text-lg">AI Deal Grade</h3>
      </div>
      <span v-if="agentVersion !== null" class="text-[10px] text-text-muted numeral">v{{ agentVersion }}</span>
    </header>

    <p v-if="!result && !loading && !error" class="text-sm text-text-muted">
      Get an AI take on whether this deal is strong, average, or one to walk away from.
    </p>

    <div v-if="loading" class="flex items-center gap-2 text-sm text-text-muted py-2">
      <ArrowPathIcon class="h-4 w-4 animate-spin" /> Grading…
    </div>

    <div v-if="error" class="text-sm text-danger bg-danger/10 rounded-md px-3 py-2 mb-3">
      {{ error }}
    </div>

    <div v-if="result" class="space-y-4">
      <div class="flex items-start gap-4">
        <div :class="['inline-flex items-center justify-center w-14 h-14 rounded-lg border font-display text-2xl tracking-tight', gradeColor(result.grade)]">
          {{ result.grade }}
        </div>
        <div class="flex-1">
          <p class="text-sm text-primary capitalize">{{ result.rating.replaceAll('_', ' ') }}</p>
          <p class="text-sm text-text-muted mt-1">{{ result.summary }}</p>
        </div>
      </div>

      <div v-if="result.red_flags?.length">
        <p class="eyebrow flex items-center gap-1.5 mb-1">
          <ExclamationTriangleIcon class="h-3.5 w-3.5" /> Watch out
        </p>
        <ul class="text-sm text-text-muted list-disc pl-5 space-y-0.5">
          <li v-for="f in result.red_flags" :key="f">{{ f }}</li>
        </ul>
      </div>

      <div v-if="result.tips?.length">
        <p class="eyebrow flex items-center gap-1.5 mb-1">
          <LightBulbIcon class="h-3.5 w-3.5" /> Tips
        </p>
        <ul class="text-sm text-text-muted list-disc pl-5 space-y-0.5">
          <li v-for="t in result.tips" :key="t">{{ t }}</li>
        </ul>
      </div>

      <p v-if="cached" class="text-[10px] text-text-muted">Cached response — identical inputs.</p>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <button @click="run" :disabled="loading"
        class="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-accent text-surface text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50">
        <SparklesIcon class="h-4 w-4" />
        {{ result ? 'Re-grade' : 'Grade this deal' }}
      </button>
      <button v-if="result" @click="reset" class="text-sm text-text-muted hover:text-primary transition-colors">
        Clear
      </button>
    </div>
  </section>
</template>
