<script setup>
import { useForm } from '@inertiajs/vue3'
import InputError from '@/Components/InputError.vue'
import InputLabel from '@/Components/InputLabel.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import TextInput from '@/Components/TextInput.vue'

const props = defineProps({
  user: Object,
  mustVerifyEmail: Boolean,
  status: String,
})

const form = useForm({
  username: props.user?.username || '',
  avatar_url: props.user?.avatar_url || '',
  website: props.user?.website || '',
  first_name: props.user?.first_name || '',
  last_name: props.user?.last_name || '',
})

const submit = () => {
  form.put('/api/profile', {
    preserveScroll: true,
    onSuccess: () => {
      // Refresh the page to get updated data
      window.location.reload()
    },
  })
}
</script>

<template>
  <section>
    <header>
      <h2 class="text-lg font-medium text-gray-900">Profile Information</h2>

      <p class="mt-1 text-sm text-gray-600">
        Update your account's profile information and email address.
      </p>
    </header>

    <form @submit.prevent="submit" class="mt-6 space-y-6">
      <div>
        <InputLabel for="username" value="Username" />

        <TextInput
          id="username"
          type="text"
          class="mt-1 block w-full"
          v-model="form.username"
          required
          autocomplete="username"
        />

        <InputError class="mt-2" :message="form.errors.username" />
      </div>

      <div>
        <InputLabel for="first_name" value="First Name" />

        <TextInput
          id="first_name"
          type="text"
          class="mt-1 block w-full"
          v-model="form.first_name"
          autocomplete="given-name"
        />

        <InputError class="mt-2" :message="form.errors.first_name" />
      </div>

      <div>
        <InputLabel for="last_name" value="Last Name" />

        <TextInput
          id="last_name"
          type="text"
          class="mt-1 block w-full"
          v-model="form.last_name"
          autocomplete="family-name"
        />

        <InputError class="mt-2" :message="form.errors.last_name" />
      </div>

      <div>
        <InputLabel for="avatar_url" value="Avatar URL" />

        <TextInput
          id="avatar_url"
          type="url"
          class="mt-1 block w-full"
          v-model="form.avatar_url"
          autocomplete="url"
        />

        <InputError class="mt-2" :message="form.errors.avatar_url" />
      </div>

      <div>
        <InputLabel for="website" value="Website" />

        <TextInput
          id="website"
          type="url"
          class="mt-1 block w-full"
          v-model="form.website"
          autocomplete="url"
        />

        <InputError class="mt-2" :message="form.errors.website" />
      </div>

      <div class="flex items-center gap-4">
        <PrimaryButton :disabled="form.processing">Save</PrimaryButton>

        <Transition
          enter-active-class="transition ease-in-out"
          enter-from-class="opacity-0"
          leave-active-class="transition ease-in-out"
          leave-to-class="opacity-0"
        >
          <p v-if="form.recentlySuccessful" class="text-sm text-gray-600">Saved.</p>
        </Transition>
      </div>
    </form>
  </section>
</template>
