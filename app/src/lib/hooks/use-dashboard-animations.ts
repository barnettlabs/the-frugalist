import { FadeInDown } from 'react-native-reanimated';

const ANIM_DURATION = 500;

export const DASHBOARD_ANIM_DELAYS = {
	masthead: 50,
	greeting: 150,
	focus: 250,
	actions: 350,
	recent: 450,
} as const;

export function useDashboardAnimations() {
	return {
		masthead: FadeInDown.duration(ANIM_DURATION).delay(DASHBOARD_ANIM_DELAYS.masthead),
		greeting: FadeInDown.duration(ANIM_DURATION).delay(DASHBOARD_ANIM_DELAYS.greeting),
		focus: FadeInDown.duration(ANIM_DURATION).delay(DASHBOARD_ANIM_DELAYS.focus),
		actions: FadeInDown.duration(ANIM_DURATION).delay(DASHBOARD_ANIM_DELAYS.actions),
		recent: FadeInDown.duration(ANIM_DURATION).delay(DASHBOARD_ANIM_DELAYS.recent),
	};
}
