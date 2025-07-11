<script setup>
const props = defineProps({
	show: {
		type: Boolean,
		required: true,
		default: false,
	},
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
	<Teleport to="body">
		<Transition>
			<div
				class="modal-mask"
				v-if="props.show"
			>
				<div class="modal-wrapper">
					<div class="modal-container">
						<div class="modal-header">
							<slot name="header"></slot>
						</div>

						<div class="modal-body">
							<slot name="body"></slot>
						</div>

						<div class="modal-footer">
							<slot name="footer"> </slot>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.modal-mask {
	position: fixed;
	z-index: 9998;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: table;
	/* transition: opacity 0.3s ease; */
}

.modal-wrapper {
	display: table-cell;
	vertical-align: middle;
}

.modal-container {
	@apply rounded-md w-full max-w-80 md:max-w-96;
	margin: 0px auto;
	padding: 20px 30px;
	background-color: #fff;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
	/* transition: all 0.3s ease; */
	/* font-family: Helvetica, Arial, sans-serif; */
}

.modal-header {
	@apply text-lg;
}

.modal-body {
	margin: 20px 0;
}

.modal-default-button {
	/* float: right; */
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

/* .modal-enter {
	opacity: 0;
}

.modal-leave-active {
	opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
	-webkit-transform: scale(1.1);
	transform: scale(1.1);
} */
</style>
