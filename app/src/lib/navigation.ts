import { router } from 'expo-router';

export type AppHref = Parameters<typeof router.push>[0];

export function pushRoute(href: AppHref): void {
	router.push(href);
}
