<script setup>
import Spinner from '../Spinner.vue'

const props = defineProps({
	label: String,
	type: {
		type: String,
		default: 'button',
	},
	variant: {
		type: String,
		default: 'primary',
	},
	size: {
		type: String,
		default: 'md',
	},
	outline: {
		type: Boolean,
		default: false,
	},
	loading: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
})

const colorClasses = {
	primary: 'btn--primary',
	secondary: 'btn--secondary',
	success: 'btn--success',
	info: 'btn--info',
	warning: 'btn--warning',
	danger: 'btn--danger',
	neutral: 'btn--neutral',
}

const sizeClasses = {
	xs: 'btn--xs',
	sm: `btn--sm`,
	md: `btn--md`,
	lg: `btn--lg`,
	xl: `btn--xl`,
}
</script>

<template>
	<button
		:type="props.type"
		class="btn"
		:class="[
			sizeClasses[size],
			colorClasses[variant],
			{
				'btn--outline': outline,
				'btn--disabled': props.disabled || props.loading,
			},
		]"
	>
		<span
			:class="{
				'opacity-50': props.disabled || props.loading,
			}"
		>
			<slot name="label">
				{{ label }}
			</slot>
		</span>

		<div
			class="absolute"
			:class="{
				hidden: !loading,
			}"
		>
			<Spinner />
		</div>
	</button>
</template>

<style scoped>
/*  */
</style>
