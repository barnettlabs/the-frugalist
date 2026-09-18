import { Env } from '@env';
import type { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import { signOut, useAuth } from '@/lib/auth';

type TrackedRequestConfig = InternalAxiosRequestConfig & {
	_requestId?: number;
	_startTime?: number;
};

export const client = axios.create({
	baseURL: Env.API_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

let requestId = 0;

// Request interceptor to add auth token
client.interceptors.request.use(
	config => {
		const tracked = config as TrackedRequestConfig;
		const id = ++requestId;
		const fullUrl = `${config.baseURL}${config.url}`;
		tracked._requestId = id;
		tracked._startTime = Date.now();
		console.log(`[API #${id}] → ${config.method?.toUpperCase()} ${fullUrl}`);

		const token = useAuth.getState().token;
		if (token?.access) {
			config.headers.Authorization = `Bearer ${token.access}`;
		}
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling 401 errors
client.interceptors.response.use(
	response => {
		const tracked = response.config as TrackedRequestConfig;
		const id = tracked._requestId;
		const startTime = tracked._startTime;
		const duration = Date.now() - (startTime ?? Date.now());
		console.log(`[API #${id}] ← ${response.status} (${duration}ms)`);
		return response;
	},
	error => {
		const tracked = error.config as TrackedRequestConfig | undefined;
		const id = tracked?._requestId;
		const startTime = tracked?._startTime;
		const duration = startTime ? Date.now() - startTime : 0;
		const status = error.response?.status ?? 'ERR';
		console.log(`[API #${id}] ← ${status} (${duration}ms)`);

		if (error.response?.status === 401 || error.response?.status === 419) {
			// Token is invalid or expired, or session expired - sign out
			signOut();
		}
		return Promise.reject(error);
	}
);
