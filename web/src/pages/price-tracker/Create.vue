<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import InputError from '@/components/InputError.vue'
import InputLabel from '@/components/InputLabel.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import { priceTrackerApi } from '@/api/price-tracker'

const router = useRouter()

const form = ref({
  product_url: '',
  target_price: '',
})

const loading = ref(false)
const validating = ref(false)
const errors = ref<Record<string, string[]>>({})
const validatedProduct = ref<{ product_name: string; price: number } | null>(null)

const validateUrl = async () => {
  if (!form.value.product_url) return

  validating.value = true
  errors.value = {}
  validatedProduct.value = null

  try {
    const result = await priceTrackerApi.validateProduct(form.value.product_url)
    if (result.valid && result.product_name) {
      validatedProduct.value = {
        product_name: result.product_name,
        price: result.price || 0,
      }
    } else {
      errors.value = { product_url: [result.error || 'Could not validate product URL'] }
    }
  } catch (error: any) {
    errors.value = { product_url: ['Failed to validate product URL'] }
  } finally {
    validating.value = false
  }
}

const submitForm = async () => {
  loading.value = true
  errors.value = {}

  try {
    await priceTrackerApi.create({
      product_url: form.value.product_url,
      target_price: form.value.target_price ? parseFloat(form.value.target_price) : undefined,
    })
    router.push('/price-tracker')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="py-12 flex-1">
    <div class="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <PageHeader
        title="Track New Product"
        description="Enter a product URL to start tracking its price"
        back-link="/price-tracker"
        back-label="Price Tracker"
      />

      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <InputLabel for="product_url" value="Product URL" />
            <div class="flex gap-2 mt-1">
              <TextInput
                id="product_url"
                v-model="form.product_url"
                type="url"
                class="block w-full"
                placeholder="https://www.amazon.com/dp/..."
                required
              />
              <button
                type="button"
                @click="validateUrl"
                :disabled="validating || !form.product_url"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {{ validating ? 'Checking...' : 'Validate' }}
              </button>
            </div>
            <InputError :message="errors.product_url?.[0]" class="mt-2" />
          </div>

          <!-- Validated Product Info -->
          <div v-if="validatedProduct" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-sm text-green-700 font-medium">Product found:</p>
            <p class="text-green-900 font-bold">{{ validatedProduct.product_name }}</p>
            <p v-if="validatedProduct.price" class="text-green-700">
              Current price: ${{ validatedProduct.price.toFixed(2) }}
            </p>
          </div>

          <div>
            <InputLabel for="target_price" value="Target Price (optional)" />
            <TextInput
              id="target_price"
              v-model="form.target_price"
              type="number"
              step="0.01"
              min="0"
              class="mt-1 block w-full"
              placeholder="50.00"
            />
            <p class="text-xs text-gray-500 mt-1">Get notified when the price drops to or below this amount</p>
            <InputError :message="errors.target_price?.[0]" class="mt-2" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4">
            <RouterLink to="/price-tracker">
              <button
                type="button"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </RouterLink>
            <PrimaryButton :disabled="loading || !form.product_url">
              {{ loading ? 'Adding...' : 'Start Tracking' }}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>
