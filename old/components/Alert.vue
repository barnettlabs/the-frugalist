<script setup>
import {
	CheckCircleIcon,
	XCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
	variant: {
		type: String,
		default: 'info',
	},
	title: {
		type: String,
		default: '',
	},

	containerClassName: {
		type: String,
		default: '',
	},
	iconClassName: {
		type: String,
		default: '',
	},
	titleClassName: {
		type: String,
		default: '',
	},
	bodyClassName: {
		type: String,
		default: '',
	},
})

const variantIcons = ref({
	success: CheckCircleIcon,
	error: XCircleIcon,
	warning: ExclamationTriangleIcon,
	info: InformationCircleIcon,
})

const variantClasses = {
	success: {
		container: 'bg-green-50',
		icon: 'text-green-700',
		title: 'text-green-800',
		body: 'text-green-700',
		button: 'bg-green-50 text-green-800 hover:bg-green-100',
	},

	error: {
		container: 'bg-red-50',
		icon: 'text-red-700',
		title: 'text-red-800',
		body: 'text-red-700',
		button: 'bg-red-50 text-red-800 hover:bg-red-100',
	},

	warning: {
		container: 'bg-yellow-50',
		icon: 'text-yellow-700',
		title: 'text-yellow-800',
		body: 'text-yellow-700',
		button: 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100',
	},

	info: {
		container: 'bg-blue-50',
		icon: 'text-blue-700',
		title: 'text-blue-800',
		body: 'text-blue-700',
		button: 'bg-blue-50 text-blue-800 hover:bg-blue-100',
	},
}

const selectedStyles = variantClasses[props.variant] || variantClasses.info
const Icon = variantIcons.value[props.variant] || variantIcons.value.info
</script>

<template>
	<div
		class="rounded-md p-4"
		:class="[selectedStyles.container, props.containerClassName]"
	>
		<div class="flex">
			<div class="flex-shrink-0">
				<component
					:is="Icon"
					class="h-5 w-5"
					:class="[selectedStyles.icon, props.iconClassName]"
					aria-hidden="true"
				/>
			</div>
			<div class="ml-3">
				<h3
					class="text-sm font-medium"
					:class="[selectedStyles.title, props.titleClassName]"
				>
					{{ title }}
				</h3>
				<div
					class="text-sm"
					:class="[selectedStyles.body, props.bodyClassName]"
				>
					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/*  */
</style>
