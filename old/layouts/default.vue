<script setup>
const user = useSupabaseUser()
</script>

<template>
	<HeaderAndFooter v-if="user">
		<slot></slot>
	</HeaderAndFooter>

	<div v-else>
		<slot></slot>
	</div>
</template>

<style>
/*  */
</style>
