<script setup lang="ts">
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

defineProps<{
	primaryLabel?: string;
	disabled?: boolean;
}>();

const emit = defineEmits<{ primary: [] }>();

const PANEL_WIDTH = 176;

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const position = ref({ top: 0, left: 0 });

const updatePosition = () => {
	if (!root.value) return;
	const rect = root.value.getBoundingClientRect();
	position.value = {
		top: rect.bottom + 4,
		left: Math.max(8, rect.right - PANEL_WIDTH),
	};
};

const toggle = async () => {
	open.value = !open.value;
	if (open.value) {
		await nextTick();
		updatePosition();
	}
};

const onScroll = () => {
	if (open.value) updatePosition();
};

const onDocClick = (e: MouseEvent) => {
	if (!open.value) return;
	const target = e.target as Node;
	if (root.value?.contains(target)) return;
	if (panel.value?.contains(target)) return;
	open.value = false;
};

const onEsc = (e: KeyboardEvent) => {
	if (e.key === 'Escape') open.value = false;
};

onMounted(() => {
	document.addEventListener('mousedown', onDocClick);
	document.addEventListener('keydown', onEsc);
	window.addEventListener('scroll', onScroll, true);
	window.addEventListener('resize', onScroll);
});

onUnmounted(() => {
	document.removeEventListener('mousedown', onDocClick);
	document.removeEventListener('keydown', onEsc);
	window.removeEventListener('scroll', onScroll, true);
	window.removeEventListener('resize', onScroll);
});
</script>

<template>
	<div ref="root" class="relative inline-flex items-stretch">
		<button
			type="button"
			:disabled="disabled"
			class="inline-flex items-center gap-1.5 rounded-l-md border border-r-0 border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary hover:bg-surface-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			@click="emit('primary')"
		>
			<slot name="primary-icon" />
			<span>{{ primaryLabel || 'View' }}</span>
		</button>
		<button
			type="button"
			:disabled="disabled"
			class="inline-flex items-center rounded-r-md border border-border bg-surface px-1.5 py-1.5 text-text-muted hover:bg-surface-dark hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			:class="open ? 'bg-surface-dark text-primary' : ''"
			aria-label="More actions"
			:aria-expanded="open"
			@click.stop="toggle"
		>
			<EllipsisVerticalIcon class="h-4 w-4" />
		</button>

		<Teleport to="body">
			<Transition
				enter-active-class="transition ease-out duration-150"
				enter-from-class="opacity-0 scale-95"
				enter-to-class="opacity-100 scale-100"
				leave-active-class="transition ease-in duration-100"
				leave-from-class="opacity-100 scale-100"
				leave-to-class="opacity-0 scale-95"
			>
				<div
					v-if="open"
					ref="panel"
					class="fixed z-[60] origin-top-right rounded-md border border-border bg-surface shadow-lg ring-1 ring-black/5"
					:style="{ top: `${position.top}px`, left: `${position.left}px`, minWidth: `${PANEL_WIDTH}px` }"
					@click="open = false"
				>
					<div class="py-1 flex flex-col">
						<slot name="items" />
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>
