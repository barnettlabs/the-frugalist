<script setup>
//
</script>

<template>
	<div class="wrapper">
		<div class="content">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped>
.wrapper {
	/* for Tesla picture */
	background-image: url("/images/tesla-model-3-with-mountains-and-clouds.jpeg");
  background-size: cover;
  background-position: right 25% bottom 0%;

	/* for RAM picture */
	/* background-size: cover 100%;
	background-image: url('/images/ram-1500-built-to-serve-edition-lineup.jpeg');
	background-position: left 50% bottom 0%; */

	height: var(--screen-height);
	width: 100vw;
	flex: 1;
	display: flex;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
}
.wrapper::before {
	content: '';
	position: absolute;
	top: 0;
	height: 100%;
	width: 100%;
	background-color: theme('colors.slate.900');
	opacity: 0.95;
}

.content {
	@apply z-10 flex-1 flex flex-col items-center justify-start md:justify-center md:items-start md:pt-20 md:pl-20;
}

@media screen(md) {
	.wrapper {
		background-size: cover;

		/* for RAM picture */
		/* background-position: right 100% bottom 0%; */

		/* for Tesla picture */
		background-position: right 15% bottom 0%;
	}
	.wrapper::before {
		opacity: 0.98;
		background: linear-gradient(
			70deg,
			theme('colors.slate.900') 50%,
			rgba(0, 0, 0, 0)
		);
	}
}
</style>
