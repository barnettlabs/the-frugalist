import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export function getItem<T>(key: string): T | null {
	const value = storage.getString(key);
	return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
	try {
		storage.set(key, JSON.stringify(value));
	} catch (e) {
		console.error(`[storage] setItem failed for key "${key}":`, e);
	}
}

export async function removeItem(key: string) {
	try {
		storage.delete(key);
	} catch (e) {
		console.error(`[storage] removeItem failed for key "${key}":`, e);
	}
}
