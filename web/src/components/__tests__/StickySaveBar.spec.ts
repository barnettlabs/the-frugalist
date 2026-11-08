import { mount, RouterLinkStub } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import StickySaveBar from '@/components/StickySaveBar.vue';

const base = {
	dirty: false,
	saving: false,
	isEdit: true,
	canSave: true,
	savedAt: null as Date | null,
	hasErrors: false,
	backUrl: '/estimates/leasing',
	backLabel: 'All lease estimates',
};

const render = (props: Partial<typeof base> = {}) =>
	mount(StickySaveBar, { props: { ...base, ...props }, global: { stubs: { RouterLink: RouterLinkStub } } });

const button = (wrapper: ReturnType<typeof render>) => wrapper.get('button');

describe('StickySaveBar', () => {
	it('has nothing to save on an unchanged sheet', () => {
		const wrapper = render();

		expect(wrapper.text()).toContain('All changes saved');
		expect(button(wrapper).attributes('disabled')).toBeDefined();
	});

	it('flags unsaved changes and enables saving', async () => {
		const wrapper = render({ dirty: true });

		expect(wrapper.text()).toContain('Unsaved changes');
		expect(button(wrapper).attributes('disabled')).toBeUndefined();
		await button(wrapper).trigger('click');
		expect(wrapper.emitted('save')).toHaveLength(1);
	});

	it('lets a new estimate be saved before anything changes', () => {
		const wrapper = render({ isEdit: false });

		expect(wrapper.text()).toContain('Not saved yet');
		expect(button(wrapper).text()).toBe('Save estimate');
		expect(button(wrapper).attributes('disabled')).toBeUndefined();
	});

	it('says when it last saved', () => {
		const wrapper = render({ savedAt: new Date(2026, 10, 8, 17, 43) });

		expect(wrapper.text()).toMatch(/Saved at 5:43/);
	});

	it('points at the fields when the server rejects the save', () => {
		expect(render({ dirty: true, hasErrors: true }).text()).toContain('check the highlighted fields');
	});

	it('offers guests a sign-in instead of a save', () => {
		const wrapper = render({ canSave: false, isEdit: false });

		expect(button(wrapper).text()).toBe('Sign in to save');
		expect(button(wrapper).attributes('disabled')).toBeUndefined();
	});

	it('cannot be pressed twice while saving', () => {
		const wrapper = render({ dirty: true, saving: true });

		expect(button(wrapper).attributes('disabled')).toBeDefined();
		expect(wrapper.text()).toContain('Saving…');
	});
});
