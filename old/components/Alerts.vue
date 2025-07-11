<script setup>
import Alert from './Alert.vue'

const props = defineProps({
	alerts: {
		type: Array,
		default: () => [],
	},
})
</script>

<template>
	<div v-if="props.alerts.length">
		<Alert
			v-for="alert in props.alerts"
			:key="alert.message"
			:variant="alert.variant"
		>
			{{ alert.message }}
		</Alert>
	</div>
</template>

<style scoped>
/*  */
</style>
