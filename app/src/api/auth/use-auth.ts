import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { signIn } from '@/lib/auth';

import { client } from '../common';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './types';

export const useLogin = createMutation<LoginResponse, LoginRequest, AxiosError>({
  mutationFn: async data => {
    const response = await client.post<LoginResponse>('/api/login', data);
    // Store token on successful login
    signIn({ access: response.data.token, refresh: '' });
    return response.data;
  },
});

export const useRegister = createMutation<RegisterResponse, RegisterRequest, AxiosError>({
  mutationFn: async data => {
    const response = await client.post<RegisterResponse>('/api/register', data);
    // Store token on successful registration
    signIn({ access: response.data.token, refresh: '' });
    return response.data;
  },
});

export const useForgotPassword = createMutation<ForgotPasswordResponse, ForgotPasswordRequest, AxiosError>({
  mutationFn: async data => {
    const response = await client.post<ForgotPasswordResponse>('/api/forgot-password', data);
    return response.data;
  },
});

export const useResendVerificationEmail = createMutation<{ message: string }, void, AxiosError>({
  mutationFn: async () => {
    const response = await client.post<{ message: string }>('/api/email/verification-notification');
    return response.data;
  },
});

export const useLogout = createMutation<void, void, AxiosError>({
  mutationFn: async () => {
    await client.post('/api/logout');
  },
});
