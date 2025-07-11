<script setup>
import { Switch } from '@headlessui/vue'
defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	label: String,
})

const model = defineModel()
</script>

<template>
	<div class="flex items-center">
		<span
			v-if="props.label"
			class="text-xs text-gray-400 mr-2"
			>{{ label }}</span
		>

		<Switch
			v-model="model"
			v-bind="$attrs"
			class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
			:class="[model ? 'bg-primary' : 'bg-gray-200']"
		>
			<span class="sr-only">Use setting</span>
			<span
				aria-hidden="true"
				class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
				:class="[model ? 'translate-x-5' : 'translate-x-0']"
			/>
		</Switch>
	</div>
</template>
