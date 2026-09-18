<script setup>
import { computed } from 'vue';

const emit = defineEmits(['update:checked']);

const props = defineProps({
	checked: {
		type: [Array, Boolean],
		required: true,
	},
	value: {
		default: null,
	},
});

const proxyChecked = computed({
	get() {
		return props.checked;
	},

	set(val) {
		emit('update:checked', val);
	},
});
</script>

<template>
	<input
		v-model="proxyChecked"
		type="checkbox"
		:value="value"
		class="rounded-sm border-border text-accent focus:ring-accent focus:ring-offset-0 bg-surface"
	/>
</template>
