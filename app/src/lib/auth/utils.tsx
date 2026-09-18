import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export type TokenType = {
	access: string;
	refresh: string;
};

export const getToken = async (): Promise<TokenType | null> => {
	const value = await SecureStore.getItemAsync(TOKEN_KEY);
	return value ? (JSON.parse(value) as TokenType) : null;
};

export const removeToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export const setToken = (value: TokenType) => SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(value));
