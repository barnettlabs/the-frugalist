<script setup>
import { ref } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import InputError from '@/Components/InputError.vue'
import InputLabel from '@/Components/InputLabel.vue'
import PrimaryButton from '@/Components/PrimaryButton.vue'
import SecondaryButton from '@/Components/SecondaryButton.vue'
import TextInput from '@/Components/TextInput.vue'

const props = defineProps({
  user: Object,
  mustVerifyEmail: Boolean,
  status: String,
})

const form = useForm({
  first_name: props.user?.first_name || '',
  last_name: props.user?.last_name || '',
})

const phoneForm = useForm({
  phone_number: props.user?.phone_number || '',
})

const verificationForm = useForm({
  phone_number: '',
  code: '',
})

const showVerificationInput = ref(false)
const verificationSent = ref(false)

const submit = () => {
  form.put('/api/profile', {
    preserveScroll: true,
    onSuccess: () => {
      // Refresh the page to get updated data
      window.location.reload()
    },
  })
}

const sendVerificationCode = () => {
  phoneForm.post('/phone-verification/send', {
    preserveScroll: true,
    onSuccess: () => {
      showVerificationInput.value = true
      verificationSent.value = true
      verificationForm.phone_number = phoneForm.phone_number
    },
  })
}

const verifyCode = () => {
  verificationForm.post('/phone-verification/verify', {
    preserveScroll: true,
    onSuccess: () => {
      showVerificationInput.value = false
      verificationSent.value = false
      verificationForm.reset()
      window.location.reload()
    },
  })
}

const resendCode = () => {
  phoneForm.post('/phone-verification/resend', {
    preserveScroll: true,
    onSuccess: () => {
      verificationSent.value = true
    },
  })
}

const sendEmailVerification = () => {
  router.post('/email/verification-notification', {}, {
    preserveScroll: true,
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
        <div class="flex items-center gap-2">
          <InputLabel for="email" value="Email" />
          <span
            v-if="user?.email_verified_at"
            class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
          >
            Verified
          </span>
          <span
            v-else
            class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
          >
            Unverified
          </span>
        </div>

        <TextInput
          id="email"
          type="email"
          class="mt-1 block w-full bg-gray-100"
          :model-value="user?.email"
          disabled
          autocomplete="email"
        />

        <div v-if="mustVerifyEmail && !user?.email_verified_at" class="mt-2">
          <p class="text-sm text-gray-600">
            Your email address is unverified. Click the button below to receive a verification link.
          </p>

          <div class="mt-3 flex items-center gap-4">
            <SecondaryButton @click="sendEmailVerification">
              Send Verification Email
            </SecondaryButton>

            <Transition
              enter-active-class="transition ease-in-out"
              enter-from-class="opacity-0"
              leave-active-class="transition ease-in-out"
              leave-to-class="opacity-0"
            >
              <p v-if="status === 'verification-link-sent'" class="text-sm text-gray-600">
                A new verification link has been sent to your email address.
              </p>
            </Transition>
          </div>
        </div>

        <p v-else class="mt-1 text-xs text-gray-500">Email cannot be changed at this time.</p>
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

    <!-- Phone Verification Section - TEMPORARILY DISABLED -->
    <!-- <div class="mt-8 pt-8 border-t border-gray-200">
      <header class="mb-6">
        <h3 class="text-lg font-medium text-gray-900">Phone Verification</h3>
        <p class="mt-1 text-sm text-gray-600">
          Add and verify your phone number to enable SMS notifications.
        </p>
      </header>

      <div v-if="user?.phone_verified_at" class="space-y-4">
        <div class="flex items-center gap-2">
          <InputLabel for="verified_phone" value="Phone Number" />
          <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Verified
          </span>
        </div>
        <TextInput
          id="verified_phone"
          type="tel"
          class="mt-1 block w-full bg-gray-100"
          :model-value="user?.phone_number"
          disabled
        />
      </div>

      <form v-else @submit.prevent="sendVerificationCode" class="space-y-4">
        <div>
          <InputLabel for="phone_number" value="Phone Number" />

          <TextInput
            id="phone_number"
            type="tel"
            class="mt-1 block w-full"
            v-model="phoneForm.phone_number"
            placeholder="+1 (555) 123-4567"
            autocomplete="tel"
          />

          <InputError class="mt-2" :message="phoneForm.errors.phone_number" />
        </div>

        <div v-if="showVerificationInput" class="space-y-4">
          <div>
            <InputLabel for="verification_code" value="Verification Code" />

            <TextInput
              id="verification_code"
              type="text"
              class="mt-1 block w-full"
              v-model="verificationForm.code"
              placeholder="123456"
              maxlength="6"
            />

            <InputError class="mt-2" :message="verificationForm.errors.code" />
            <p class="mt-1 text-xs text-gray-500">
              Enter the 6-digit code sent to your phone.
            </p>
          </div>

          <div class="flex items-center gap-4">
            <PrimaryButton
              type="button"
              @click="verifyCode"
              :disabled="verificationForm.processing || !verificationForm.code"
            >
              Verify Code
            </PrimaryButton>

            <SecondaryButton
              type="button"
              @click="resendCode"
              :disabled="phoneForm.processing"
            >
              Resend Code
            </SecondaryButton>
          </div>
        </div>

        <div v-else class="flex items-center gap-4">
          <PrimaryButton :disabled="phoneForm.processing || !phoneForm.phone_number">
            Send Verification Code
          </PrimaryButton>

          <Transition
            enter-active-class="transition ease-in-out"
            enter-from-class="opacity-0"
            leave-active-class="transition ease-in-out"
            leave-to-class="opacity-0"
          >
            <p v-if="status === 'verification-code-sent'" class="text-sm text-gray-600">
              Code sent!
            </p>
          </Transition>
        </div>
      </form>
    </div> -->
  </section>
</template>
