import { computed, nextTick, onBeforeUnmount, onMounted, type Ref, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';

import type { FormErrors } from '@/types';

interface SheetApi<F, S> {
	get(id: string): Promise<S>;
	create(form: F): Promise<S & { id: number }>;
	update(id: string, form: F): Promise<S>;
}

interface Options<F extends object, S> {
	form: Ref<F>;
	api: SheetApi<F, S>;
	/** Where to go if the sheet cannot be loaded, e.g. `/estimates/leasing`. */
	listPath: string;
	/** The edit route a new sheet moves to once it has been saved. */
	editRouteName: string;
	/** Sends guests to sign in; false means do not save. */
	ensureAccount: () => boolean;
}

/**
 * Load, save and unsaved-change tracking for the three estimate pages.
 *
 * Saving keeps you on the page: a new estimate moves to its edit URL, an
 * existing one stays put. Leaving with unsaved changes asks first, so the
 * save bar's "Unsaved changes" means something.
 */
export function useSheetEditor<F extends object, S>({
	form,
	api,
	listPath,
	editRouteName,
	ensureAccount,
}: Options<F, S>) {
	const route = useRoute();
	const router = useRouter();

	const sheetId = computed(() => route.params.id as string | undefined);
	const isEdit = computed(() => !!sheetId.value);

	const saving = ref(false);
	const loadingSheet = ref(false);
	const errors = ref<FormErrors>({});
	const networkError = ref('');
	// A new sheet moves to its edit route, which can remount this page; the save
	// time travels in history state so the bar can still say when it saved.
	const savedAtFromHistory = window.history.state?.savedAt;
	const savedAt = ref<Date | null>(typeof savedAtFromHistory === 'number' ? new Date(savedAtFromHistory) : null);

	// What was last loaded or saved. The form is dirty when it no longer matches.
	const snapshot = ref(JSON.stringify(form.value));
	const markClean = () => (snapshot.value = JSON.stringify(form.value));
	const dirty = computed(() => JSON.stringify(form.value) !== snapshot.value);

	// Fields can normalise what they are given as they mount (a residual kept in
	// step with MSRP, a list re-serialised). Take the snapshot once that has
	// happened, or a sheet would read as changed the moment it opened.
	const markCleanWhenSettled = async () => {
		await nextTick();
		await nextTick();
		markClean();
	};

	const load = async () => {
		if (!sheetId.value) return markCleanWhenSettled();

		loadingSheet.value = true;
		try {
			Object.assign(form.value, await api.get(sheetId.value));
		} catch (error) {
			console.error('Error loading sheet:', error);
			router.push(listPath);
			return;
		} finally {
			loadingSheet.value = false;
		}
		await markCleanWhenSettled();
	};

	const save = async () => {
		if (saving.value || !ensureAccount()) return;

		saving.value = true;
		errors.value = {};
		networkError.value = '';

		try {
			if (sheetId.value) {
				await api.update(sheetId.value, form.value);
				markClean();
			} else {
				const created = await api.create(form.value);
				markClean();
				savedAt.value = new Date();
				await router.replace({
					name: editRouteName,
					params: { id: created.id },
					state: { savedAt: savedAt.value.getTime() },
				});
				return;
			}
			savedAt.value = new Date();
		} catch (error: any) {
			if (error.response?.data?.errors) {
				errors.value = error.response.data.errors;
			} else {
				networkError.value = 'Something went wrong. Please check your connection and try again.';
			}
		} finally {
			saving.value = false;
		}
	};

	onBeforeRouteLeave(() => {
		if (dirty.value && !window.confirm('You have unsaved changes. Leave without saving them?')) return false;
	});

	const onBeforeUnload = (event: BeforeUnloadEvent) => {
		if (dirty.value) event.preventDefault();
	};

	// Cmd/Ctrl+S saves rather than opening the browser's save-page dialog.
	const onKeydown = (event: KeyboardEvent) => {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
			event.preventDefault();
			save();
		}
	};

	onMounted(() => {
		window.addEventListener('beforeunload', onBeforeUnload);
		window.addEventListener('keydown', onKeydown);
		load();
	});

	onBeforeUnmount(() => {
		window.removeEventListener('beforeunload', onBeforeUnload);
		window.removeEventListener('keydown', onKeydown);
	});

	return { sheetId, isEdit, saving, loadingSheet, errors, networkError, savedAt, dirty, save };
}
