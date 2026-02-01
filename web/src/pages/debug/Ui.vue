<script setup lang="ts">
import { ref } from 'vue'

// Real components from the codebase
import ApplicationLogo from '@/components/ApplicationLogo.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import DangerButton from '@/components/DangerButton.vue'
import TextInput from '@/components/TextInput.vue'
import InputLabel from '@/components/InputLabel.vue'
import InputError from '@/components/InputError.vue'
import Alert from '@/components/Alert.vue'
import Badge from '@/components/Badge.vue'
import Card from '@/components/Card.vue'
import Spinner from '@/components/Spinner.vue'
import Checkbox from '@/components/Checkbox.vue'
import Modal from '@/components/Modal.vue'

import {
  HomeIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  TagIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const sampleInput = ref('')
const sampleCheckbox = ref(false)
const showModal = ref(false)
const sampleError = 'This is an example error message'

const primaryColors = [
  { name: 'primary', class: 'bg-primary', hex: '#235892' },
  { name: 'primary-light', class: 'bg-primary-light', hex: '#3B75B8' },
  { name: 'primary-dark', class: 'bg-primary-dark', hex: '#193E66' },
]

const primaryShades = [
  { name: 'primary-shade-1', class: 'bg-primary-shade-1', hex: '#1F4F83' },
  { name: 'primary-shade-2', class: 'bg-primary-shade-2', hex: '#1C4675' },
  { name: 'primary-shade-3', class: 'bg-primary-shade-3', hex: '#193E66' },
  { name: 'primary-shade-4', class: 'bg-primary-shade-4', hex: '#153558' },
  { name: 'primary-shade-5', class: 'bg-primary-shade-5', hex: '#122C49' },
  { name: 'primary-shade-6', class: 'bg-primary-shade-6', hex: '#0E233A' },
]

const primaryTints = [
  { name: 'primary-tint-1', class: 'bg-primary-tint-1', hex: '#3B75B8' },
  { name: 'primary-tint-2', class: 'bg-primary-tint-2', hex: '#5D88B2' },
  { name: 'primary-tint-3', class: 'bg-primary-tint-3', hex: '#7AA0C2' },
  { name: 'primary-tint-4', class: 'bg-primary-tint-4', hex: '#97B8D2' },
  { name: 'primary-tint-5', class: 'bg-primary-tint-5', hex: '#B4D0E2' },
  { name: 'primary-tint-6', class: 'bg-primary-tint-6', hex: '#D1E8F2' },
]

const secondaryColors = [
  { name: 'secondary', class: 'bg-secondary', hex: '#2FA4A9' },
  { name: 'secondary-light', class: 'bg-secondary-light', hex: '#40BABF' },
  { name: 'secondary-dark', class: 'bg-secondary-dark', hex: '#268387' },
]

const accentColors = [
  { name: 'accent', class: 'bg-accent', hex: '#F2A541' },
  { name: 'accent-soft', class: 'bg-accent-soft', hex: '#F7C97A' },
  { name: 'accent-dark', class: 'bg-accent-dark', hex: '#D98B29' },
]

const neutralColors = [
  { name: 'background', class: 'bg-background', hex: '#F5F7FA' },
  { name: 'surface', class: 'bg-surface', hex: '#FFFFFF' },
  { name: 'border', class: 'bg-border', hex: '#D6DEE8' },
]

const semanticColors = [
  { name: 'success', class: 'bg-success', hex: '#2EAD7D' },
  { name: 'warning', class: 'bg-warning', hex: '#E6A23C' },
  { name: 'danger', class: 'bg-danger', hex: '#D64545' },
  { name: 'info', class: 'bg-info', hex: '#4A90E2' },
]

const legacyColors = [
  { name: 'light', class: 'bg-light', hex: '#FFFFFF' },
  { name: 'dark', class: 'bg-dark', hex: '#1F2933' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">UI Debug Page</h1>
        <p class="text-gray-600">Design system reference for TheFrugalist</p>
        <p class="text-xs text-gray-400 mt-2">This page is excluded from sitemaps and search indexing.</p>
      </div>

      <!-- Logo Variants -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Logo Variants</h2>
        <p class="text-sm text-gray-500 mb-4">Component: <code class="bg-gray-100 px-1 rounded">ApplicationLogo</code>
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <p class="text-sm text-gray-500 mb-4">variant="default"</p>
            <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <ApplicationLogo variant="default" size="xl" />
            </div>
          </Card>
          <Card variant="gradient-primary">
            <p class="text-sm text-white/70 mb-4">variant="white"</p>
            <div class="flex items-center justify-center p-4">
              <ApplicationLogo variant="white" size="xl" />
            </div>
          </Card>
        </div>
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Sizes</h3>
          <div class="flex items-end gap-6 p-4 bg-gray-50 rounded-lg">
            <div class="text-center">
              <ApplicationLogo size="sm" />
              <p class="text-xs text-gray-500 mt-2">sm</p>
            </div>
            <div class="text-center">
              <ApplicationLogo size="md" />
              <p class="text-xs text-gray-500 mt-2">md</p>
            </div>
            <div class="text-center">
              <ApplicationLogo size="lg" />
              <p class="text-xs text-gray-500 mt-2">lg</p>
            </div>
            <div class="text-center">
              <ApplicationLogo size="xl" />
              <p class="text-xs text-gray-500 mt-2">xl</p>
            </div>
            <div class="text-center">
              <ApplicationLogo size="2xl" />
              <p class="text-xs text-gray-500 mt-2">2xl</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Color Palette -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Color Palette</h2>
        <p class="text-sm text-gray-500 mb-4">Defined in: <code
            class="bg-gray-100 px-1 rounded">src/assets/css/app.css</code></p>

        <!-- Primary -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Primary (Deep Blue)</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card v-for="color in primaryColors" :key="color.name" padding="none" class="overflow-hidden">
              <div :class="[color.class, 'h-20']"></div>
              <div class="p-3">
                <p class="font-mono text-sm font-medium">{{ color.name }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Primary Shades -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Primary Shades (Darker)</h3>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
            <Card v-for="color in primaryShades" :key="color.name" padding="none" class="overflow-hidden">
              <div :class="[color.class, 'h-16']"></div>
              <div class="p-2">
                <p class="font-mono text-xs font-medium truncate">{{ color.name.replace('primary-', '') }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Primary Tints -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Primary Tints (Lighter)</h3>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
            <Card v-for="color in primaryTints" :key="color.name" padding="none" class="overflow-hidden">
              <div :class="[color.class, 'h-16']"></div>
              <div class="p-2">
                <p class="font-mono text-xs font-medium truncate">{{ color.name.replace('primary-', '') }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Secondary -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Secondary (Teal)</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card v-for="color in secondaryColors" :key="color.name" padding="none" class="overflow-hidden">
              <div :class="[color.class, 'h-20']"></div>
              <div class="p-3">
                <p class="font-mono text-sm font-medium">{{ color.name }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Accent -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Accent (Warm Amber)</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card v-for="color in accentColors" :key="color.name" padding="none" class="overflow-hidden">
              <div :class="[color.class, 'h-20']"></div>
              <div class="p-3">
                <p class="font-mono text-sm font-medium">{{ color.name }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Neutrals -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Neutrals</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="color in neutralColors" :key="color.name"
              class="bg-white rounded-lg shadow-sm overflow-hidden border">
              <div :class="[color.class, 'h-20 border-b']"></div>
              <div class="p-3">
                <p class="font-mono text-sm font-medium">{{ color.name }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Semantic -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Semantic Colors</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card v-for="color in semanticColors" :key="color.name" padding="none" class="overflow-hidden">
              <div :class="[color.class, 'h-20']"></div>
              <div class="p-3">
                <p class="font-mono text-sm font-medium">{{ color.name }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Legacy -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Legacy Colors</h3>
          <div class="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-md">
            <div v-for="color in legacyColors" :key="color.name"
              class="bg-white rounded-lg shadow-sm overflow-hidden border">
              <div :class="[color.class, 'h-20 border-b']"></div>
              <div class="p-3">
                <p class="font-mono text-sm font-medium">{{ color.name }}</p>
                <p class="font-mono text-xs text-gray-500">{{ color.hex }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Typography -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Typography</h2>
        <Card>
          <p class="text-sm text-gray-500 mb-6">Font Family: <span class="font-mono">Rubik</span> (defined in
            tailwind.config.js)</p>

          <div class="space-y-6">
            <div>
              <p class="text-xs text-gray-400 mb-1">text-5xl font-bold</p>
              <p class="text-5xl font-bold text-gray-900">The quick brown fox</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-4xl font-bold</p>
              <p class="text-4xl font-bold text-gray-900">The quick brown fox</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-3xl font-bold</p>
              <p class="text-3xl font-bold text-gray-900">The quick brown fox</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-2xl font-bold</p>
              <p class="text-2xl font-bold text-gray-900">The quick brown fox</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-xl font-semibold</p>
              <p class="text-xl font-semibold text-gray-900">The quick brown fox</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-lg font-medium</p>
              <p class="text-lg font-medium text-gray-900">The quick brown fox jumps over the lazy dog.</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-base (default)</p>
              <p class="text-base text-gray-900">The quick brown fox jumps over the lazy dog. Pack my box with five
                dozen liquor jugs.</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-sm</p>
              <p class="text-sm text-gray-600">The quick brown fox jumps over the lazy dog. Pack my box with five dozen
                liquor jugs.</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">text-xs</p>
              <p class="text-xs text-gray-500">The quick brown fox jumps over the lazy dog. Pack my box with five dozen
                liquor jugs.</p>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t">
            <h4 class="font-semibold text-gray-900 mb-4">Text Colors</h4>
            <div class="space-y-2">
              <p class="text-gray-900">text-gray-900 - Primary text</p>
              <p class="text-gray-700">text-gray-700 - Secondary text</p>
              <p class="text-gray-600">text-gray-600 - Body text</p>
              <p class="text-gray-500">text-gray-500 - Muted text</p>
              <p class="text-gray-400">text-gray-400 - Disabled/placeholder</p>
              <p class="text-primary">text-primary - Primary brand color</p>
              <p class="text-secondary">text-secondary - Secondary brand color</p>
              <p class="text-accent-dark">text-accent-dark - Accent (readable)</p>
            </div>
          </div>
        </Card>
      </section>

      <!-- Buttons -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Buttons</h2>
        <Card>
          <div class="space-y-8">
            <!-- Primary Buttons -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">PrimaryButton</h4>
              <p class="text-sm text-gray-500 mb-4">Component: <code
                  class="bg-gray-100 px-1 rounded">PrimaryButton</code></p>
              <div class="flex flex-wrap gap-4">
                <PrimaryButton>Primary Button</PrimaryButton>
                <PrimaryButton disabled>Disabled</PrimaryButton>
              </div>
            </div>

            <!-- Secondary Buttons -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">SecondaryButton</h4>
              <p class="text-sm text-gray-500 mb-4">Component: <code
                  class="bg-gray-100 px-1 rounded">SecondaryButton</code></p>
              <div class="flex flex-wrap gap-4">
                <SecondaryButton>Secondary Button</SecondaryButton>
                <SecondaryButton disabled>Disabled</SecondaryButton>
              </div>
            </div>

            <!-- Danger Buttons -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">DangerButton</h4>
              <p class="text-sm text-gray-500 mb-4">Component: <code
                  class="bg-gray-100 px-1 rounded">DangerButton</code></p>
              <div class="flex flex-wrap gap-4">
                <DangerButton>Danger Button</DangerButton>
                <DangerButton disabled>Disabled</DangerButton>
              </div>
            </div>

            <!-- Button Sizes (CSS Classes) -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">Button Sizes</h4>
              <p class="text-sm text-gray-500 mb-4">CSS classes: <code
                  class="bg-gray-100 px-1 rounded">btn btn--primary btn--{size}</code></p>
              <div class="flex flex-wrap items-center gap-4">
                <button class="btn btn--primary btn--xs">Extra Small</button>
                <button class="btn btn--primary btn--sm">Small</button>
                <button class="btn btn--primary btn--md">Medium</button>
                <button class="btn btn--primary btn--lg">Large</button>
                <button class="btn btn--primary btn--xl">Extra Large</button>
              </div>
            </div>

            <!-- Button Variants (CSS Classes) -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">Button Variants</h4>
              <p class="text-sm text-gray-500 mb-4">CSS classes: <code
                  class="bg-gray-100 px-1 rounded">btn btn--{variant} btn--md</code></p>
              <div class="flex flex-wrap gap-4">
                <button class="btn btn--primary btn--md">Primary</button>
                <button class="btn btn--secondary btn--md">Secondary</button>
                <button class="btn btn--warning btn--md">Warning</button>
                <button class="btn btn--danger btn--md">Danger</button>
                <button class="btn btn--neutral btn--md">Neutral</button>
              </div>
            </div>

            <!-- Outline Buttons (CSS Classes) -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">Outline Buttons</h4>
              <p class="text-sm text-gray-500 mb-4">CSS classes: <code
                  class="bg-gray-100 px-1 rounded">btn btn--{variant} btn--outline btn--md</code></p>
              <div class="flex flex-wrap gap-4">
                <button class="btn btn--primary btn--outline btn--md">Primary</button>
                <button class="btn btn--secondary btn--outline btn--md">Secondary</button>
                <button class="btn btn--warning btn--outline btn--md">Warning</button>
                <button class="btn btn--danger btn--outline btn--md">Danger</button>
                <button class="btn btn--neutral btn--outline btn--md">Neutral</button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <!-- Form Inputs -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Form Inputs</h2>
        <Card>
          <div class="max-w-md space-y-6">
            <div>
              <p class="text-sm text-gray-500 mb-4">Components: <code
                  class="bg-gray-100 px-1 rounded">InputLabel</code>, <code
                  class="bg-gray-100 px-1 rounded">TextInput</code></p>
              <InputLabel for="sample1" value="Default Input" />
              <TextInput id="sample1" v-model="sampleInput" type="text" class="mt-1 block w-full"
                placeholder="Enter something..." />
            </div>

            <div>
              <p class="text-sm text-gray-500 mb-4">With <code class="bg-gray-100 px-1 rounded">InputError</code></p>
              <InputLabel for="sample2" value="Input with Error" />
              <TextInput id="sample2" v-model="sampleInput" type="text" class="mt-1 block w-full" />
              <InputError :message="sampleError" class="mt-2" />
            </div>

            <div>
              <InputLabel for="sample3" value="Disabled Input" />
              <TextInput id="sample3" v-model="sampleInput" type="text" class="mt-1 block w-full" disabled
                placeholder="Disabled..." />
            </div>

            <div>
              <p class="text-sm text-gray-500 mb-4">Component: <code class="bg-gray-100 px-1 rounded">Checkbox</code>
              </p>
              <label class="flex items-center gap-2">
                <Checkbox v-model:checked="sampleCheckbox" />
                <span class="text-sm text-gray-700">I agree to the terms</span>
              </label>
            </div>

            <div>
              <p class="text-sm text-gray-500 mb-4">CSS classes: <code
                  class="bg-gray-100 px-1 rounded">text-input-container</code>, <code
                  class="bg-gray-100 px-1 rounded">text-input-label</code>, <code
                  class="bg-gray-100 px-1 rounded">text-input</code></p>
              <div class="text-input-container">
                <label class="text-input-label">Nested Label Style</label>
                <input type="text" class="text-input" placeholder="Enter value..." />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <!-- Alerts -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Alerts</h2>
        <p class="text-sm text-gray-500 mb-4">Component: <code class="bg-gray-100 px-1 rounded">Alert</code></p>
        <div class="space-y-4">
          <Alert variant="success" title="Success">
            Your changes have been saved successfully.
          </Alert>

          <Alert variant="warning" title="Warning">
            Please review your information before continuing.
          </Alert>

          <Alert variant="danger" title="Error">
            Something went wrong. Please try again.
          </Alert>

          <Alert variant="info" title="Information">
            Here's some helpful information for you.
          </Alert>

          <Alert variant="info" title="Dismissible Alert" dismissible @dismiss="() => { }">
            This alert can be dismissed by clicking the X button.
          </Alert>
        </div>
      </section>

      <!-- Badges -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Badges</h2>
        <p class="text-sm text-gray-500 mb-4">Component: <code class="bg-gray-100 px-1 rounded">Badge</code></p>
        <Card>
          <div class="space-y-6">
            <div>
              <h4 class="font-semibold text-gray-900 mb-4">Variants</h4>
              <div class="flex flex-wrap gap-4">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-900 mb-4">Sizes</h4>
              <div class="flex flex-wrap items-center gap-4">
                <Badge variant="primary" size="sm">Small</Badge>
                <Badge variant="primary" size="md">Medium</Badge>
                <Badge variant="primary" size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <!-- Cards -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Cards</h2>
        <p class="text-sm text-gray-500 mb-4">Component: <code class="bg-gray-100 px-1 rounded">Card</code></p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h4 class="font-bold text-gray-900 mb-2">Default Card</h4>
            <p class="text-sm text-gray-600">variant="default" (default)</p>
          </Card>

          <Card variant="interactive">
            <h4 class="font-bold text-gray-900 mb-2">Interactive Card</h4>
            <p class="text-sm text-gray-600">variant="interactive"</p>
          </Card>

          <Card variant="futuristic">
            <h4 class="font-bold text-gray-900 mb-2">Futuristic Card</h4>
            <p class="text-sm text-gray-600">variant="futuristic"</p>
          </Card>

          <Card variant="gradient-primary">
            <h4 class="font-bold mb-2">Gradient Primary</h4>
            <p class="text-sm text-white/80">variant="gradient-primary"</p>
          </Card>

          <Card variant="gradient-secondary">
            <h4 class="font-bold mb-2">Gradient Secondary</h4>
            <p class="text-sm text-white/80">variant="gradient-secondary"</p>
          </Card>

          <Card variant="gradient-accent">
            <h4 class="font-bold mb-2">Gradient Accent</h4>
            <p class="text-sm text-white/80">variant="gradient-accent"</p>
          </Card>
        </div>
      </section>

      <!-- Spinners -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Spinners</h2>
        <p class="text-sm text-gray-500 mb-4">Component: <code class="bg-gray-100 px-1 rounded">Spinner</code></p>
        <Card>
          <div class="space-y-6">
            <div>
              <h4 class="font-semibold text-gray-900 mb-4">Colors</h4>
              <div class="flex items-center gap-8">
                <div class="flex flex-col items-center gap-2">
                  <Spinner color="primary" />
                  <span class="text-xs text-gray-500">primary</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <Spinner color="secondary" />
                  <span class="text-xs text-gray-500">secondary</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <Spinner color="accent" />
                  <span class="text-xs text-gray-500">accent</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <Spinner color="gray" />
                  <span class="text-xs text-gray-500">gray</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-900 mb-4">Sizes</h4>
              <div class="flex items-end gap-8">
                <div class="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span class="text-xs text-gray-500">sm</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span class="text-xs text-gray-500">md</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span class="text-xs text-gray-500">lg</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <Spinner size="xl" />
                  <span class="text-xs text-gray-500">xl</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <!-- Modal -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Modal</h2>
        <p class="text-sm text-gray-500 mb-4">Component: <code class="bg-gray-100 px-1 rounded">Modal</code></p>
        <Card>
          <PrimaryButton @click="showModal = true">Open Modal</PrimaryButton>

          <Modal :show="showModal" @close="showModal = false">
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Modal Title</h3>
              <p class="text-gray-600 mb-6">This is the modal content. You can put anything here.</p>
              <div class="flex justify-end gap-3">
                <SecondaryButton @click="showModal = false">Cancel</SecondaryButton>
                <PrimaryButton @click="showModal = false">Confirm</PrimaryButton>
              </div>
            </div>
          </Modal>
        </Card>
      </section>

      <!-- Icons -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Icons (Heroicons)</h2>
        <p class="text-sm text-gray-500 mb-4">Package: <code class="bg-gray-100 px-1 rounded">@heroicons/vue</code></p>
        <Card>
          <div class="grid grid-cols-4 md:grid-cols-8 gap-6">
            <div class="flex flex-col items-center gap-2">
              <HomeIcon class="h-8 w-8 text-primary" />
              <span class="text-xs text-gray-500">Home</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <BanknotesIcon class="h-8 w-8 text-primary" />
              <span class="text-xs text-gray-500">Finance</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <CurrencyDollarIcon class="h-8 w-8 text-secondary" />
              <span class="text-xs text-gray-500">Lease</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <TagIcon class="h-8 w-8 text-accent-dark" />
              <span class="text-xs text-gray-500">Price</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <BookOpenIcon class="h-8 w-8 text-info" />
              <span class="text-xs text-gray-500">Learn</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <CheckCircleIcon class="h-8 w-8 text-success" />
              <span class="text-xs text-gray-500">Success</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <ExclamationTriangleIcon class="h-8 w-8 text-warning" />
              <span class="text-xs text-gray-500">Warning</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <XCircleIcon class="h-8 w-8 text-danger" />
              <span class="text-xs text-gray-500">Danger</span>
            </div>
          </div>
        </Card>
      </section>

    </div>
  </div>
</template>
